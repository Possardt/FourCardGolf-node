(function(){
  'use strict';

  const _                 = require('lodash');
  const deck              = require('./Deck');
  const pendingGameStack 	= {}; //games waiting for players
  const activeGameStack 	= {}; //games that have started
  let gamesNamespace;

  function shuffle(deck) {
    let currentIndex = deck.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      //swap
      temporaryValue = deck[currentIndex];
      deck[currentIndex] = deck[randomIndex];
      deck[randomIndex] = temporaryValue;
    }
  }

  function getGameNumber(numberOfPlayers){
    let gameNumber = Math.floor(Math.random() * 10000);
    let result = pendingGameStack[gameNumber];
    if(!result){
      pendingGameStack[gameNumber] = {
                        gameNumber       : gameNumber,
                        numberOfPlayers  : numberOfPlayers,
                        connectedPlayers : 0,
                        players          : [],
                        socketIds        : [],
                        socketToUserId   : {},
                        userIdToHand     : {},
                        holes            : [],
                        userIdToName     : {}
                     };
      gamesNamespace.emit('pendingGamesUpdate', {pendingGameStack : pendingGameStack});
      return gameNumber;
    }
    else{
      getGameNumber();
    }
  }

  function initializeGameNamespace(io){
    gamesNamespace = io.of('/activeGames');
    gamesNamespace.on('connect', function(socket){
      gamesNamespace.emit('pendingGamesUpdate', {pendingGameStack : pendingGameStack});
    });
  }

  function getPendingGame(game){
    return pendingGameStack[game];
  }

  function getActiveGame(game){
    return activeGameStack[game];
  }

  function addPlayer(gameNumber, userId, socketId, name){
    let game = getPendingGame(gameNumber);
    game.connectedPlayers++;
    game.players.push(userId);
    game.socketIds.push(socketId);
    game.socketToUserId[socketId] = userId;
    game.userIdToName[userId] = name;
    gamesNamespace.emit('pendingGamesUpdate', {pendingGameStack : pendingGameStack});
  }

  function removePlayer(gameNumber, socketId){
    let game = getPendingGame(gameNumber);
    if(game){
      //TODO, delete all of the player specific stuff
      game.connectedPlayers--;
      gamesNamespace.emit('pendingGamesUpdate', {pendingGameStack : pendingGameStack});
    }
  }

  function allPlayersConnected(gameNumber){
    let gameCopy = _.cloneDeep(pendingGameStack[gameNumber]);
    delete pendingGameStack[gameNumber];
    activeGameStack[gameNumber] = gameCopy;
    activeGameStack[gameNumber].currentTurn = 0;
    activeGameStack[gameNumber].deck = deck.getDeck();
    activeGameStack[gameNumber].discardPile = [];
    activeGameStack[gameNumber].hiddenCards = {};
    dealPlayerHands(gameNumber);
    gamesNamespace.emit('pendingGamesUpdate', {pendingGameStack : pendingGameStack});
  }

  //Functionality for started games ============
  function dealPlayerHands(game){
    let activeGame = getActiveGame(game);
    if(!activeGame){
      console.log('no active game found for game: ' + game);
      return;
    }

    shuffle(activeGame.deck);
    shuffle(activeGame.deck);
    shuffle(activeGame.deck);

    for(var i = 0; i < 4; i++){
      activeGame.players.forEach((player) => {
        if(!activeGame.userIdToHand[player]) {
          activeGame.userIdToHand[player] = [drawCard(activeGame.deck)];
        }
        else {
          if(i >= 2){
            let key = Date.now() + Math.floor(Math.random() * 1000);
            activeGame.userIdToHand[player].push({suit : '?',
                                                  card : '?',
                                                  value : 0,
                                                  hidden : true,
                                                  key : key});
            activeGame.hiddenCards[key] = drawCard(activeGame.deck);
          }
          else{
            activeGame.userIdToHand[player].push(drawCard(activeGame.deck));
          }
        }
      });

    }

    activeGame.discardPile.push(drawCard(activeGame.deck));
  }

  function drawCard(deck){
    let card = deck.shift();
    return card;
  }

  function handleTurn(game, data){
    game.currentTurn = ++game.currentTurn % game.connectedPlayers;

    if(data.turn.move === 'knock'){
      return;
    }
    if(data.turn.card.hidden){
      let cardToSwapIndex = _.findIndex(game.userIdToHand[data.userId], {key : data.turn.card.key});
      data.turn.card = game.hiddenCards[data.turn.card.key];
      game.userIdToHand[data.userId][cardToSwapIndex] = data.turn.card;

      delete game.hiddenCards[data.turn.card.key];
    }
    //get either top card of deck or top card of discardPile
    // swap that card with the card the player wants to swap
    // in either case, add the card the player sends to the top of
    //   the discard pile
    let cardToReturn = data.turn.swapWith === 'discard' ?
                        game.discardPile.shift() : game.deck.shift();

    let cardToSwapIndex = _.findIndex(game.userIdToHand[data.userId],
                                        {card : data.turn.card.card,
                                         suit : data.turn.card.suit});

    game.userIdToHand[data.userId].splice(cardToSwapIndex, 1, cardToReturn);
    game.discardPile.unshift(data.turn.card);
  }

  function checkForEndOfRoundOrGame(game){
    if(game.turnsLeft === 0){
      endHole(game);
    }
    game.turnsLeft--;
    if(game.holes.length === 9){
      endGame(game);
    }
  }

  function endHole(game){

    let userIdToScore = {};

    //Calculate scores for each player hand
    Object.keys(game.userIdToHand).forEach((id) =>{
      let score = game.userIdToHand[id]
                      .map(card => { return card.value; })
                      .reduce( (x, y) => { return x + y; });
      userIdToScore[id] = score;
    });


    game.holes.push(userIdToScore);

    //next, collect all of the player's hands.
    // also, collect the cards from the discard pile
    let collectedHands = Object.keys(game.userIdToHand)
                               .map( key => { return game.userIdToHand[key]; })
                               .reduce( (a,b) => { return a.concat(b); })
                               .concat(game.discardPile);

    //let the JS garbage collector clean up, set player hands
    // and discard pile to empty arrays
    game.discardPile = [];
    Object.keys(game.userIdToHand)
          .forEach(id => {
            game.userIdToHand[id] = [];
          });

    game.deck = game.deck.concat(collectedHands);
    game.deck = game.deck.map(card => {
      if(card.hidden){
        return game.hiddenCards[card.key];
      }
      return card;
    });

    game.hiddenCards = {};
    game.lastRound = false;

    //redeal the player hands to start the round
    dealPlayerHands(game.gameNumber);

  }

  function endGame(game){
    console.log('in here');
  }

  module.exports = {
    getGameNumber		       	: getGameNumber,
    pendingGameStack	    	: pendingGameStack,
    initializeGameNamespace : initializeGameNamespace,
    getPendingGame 		    	: getPendingGame,
    addPlayer 			      	: addPlayer,
    removePlayer 			      : removePlayer,
    allPlayersConnected     : allPlayersConnected,
    getActiveGame           : getActiveGame,
    handleTurn              : handleTurn,
    dealPlayerHands         : dealPlayerHands,
    checkForEndOfRound      : checkForEndOfRound
  };
})();
