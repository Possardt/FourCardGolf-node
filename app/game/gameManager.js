'use strict';

const _               = require('lodash');
const deck            = require('./Deck');
const pendingGameStack 	= {}; //games waiting for players
const activeGameStack 	= {}; //games that have started
let gamesNamespace;

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
                      socketToToken    : {},
                      tokenToHands     : {},
                      holes            : []
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

function addPlayer(gameNumber, token, socketId){
	let game = getPendingGame(gameNumber);
	game.connectedPlayers++;
  game.players.push(token);
  game.socketIds.push(socketId);
  game.socketToToken[socketId] = token;
	gamesNamespace.emit('pendingGamesUpdate', {pendingGameStack : pendingGameStack});
}

function removePlayer(gameNumber, socketId){
	let game = getPendingGame(gameNumber);
  if(game){
    game.connectedPlayers--;
    gamesNamespace.emit('pendingGamesUpdate', {pendingGameStack : pendingGameStack});
  }
}

function allPlayersConnected(gameNumber){
	let gameCopy = _.cloneDeep(pendingGameStack[gameNumber]);
	delete pendingGameStack[gameNumber];
  activeGameStack[gameNumber] = gameCopy;
  activeGameStack[gameNumber].currentTurn = 0;
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
  activeGame.deck = deck.getDeck();
  activeGame.discardPile = [];

  for(var i = 0; i < 4; i++){
    activeGame.players.forEach((player) => {
      if(!activeGame.tokenToHands[player]) {
        activeGame.tokenToHands[player] = [];
        activeGame.tokenToHands[player].push(drawCard(activeGame.deck));
      }
      else {
        activeGame.tokenToHands[player].push(drawCard(activeGame.deck));
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

  //get either top card of deck or top card of discardPile
  // swap that card with the card the player wants to swap
  // in either case, add the card the player sends to the top of
  //   the discard pile
  let cardToReturn = data.turn.swapWith === 'discard' ?
                      game.discardPile.shift() : game.deck.shift();

  let cardToSwapIndex = _.findIndex(game.tokenToHands[data.playerToken],
                                    {card : data.turn.card.card, suit : data.turn.card.suit});
  game.tokenToHands[data.playerToken].splice(cardToSwapIndex, 1, cardToReturn);
  game.discardPile.unshift(data.turn.card);
}

function checkForEndOfRound(game){
  if(game.turnsLeft === 0){
    endHole(game);
  }
  game.turnsLeft--;
}

function endHole(game){
  console.log(game.tokenToHands);

  let tokenToScores = {},
      hole          = {};

  //Calculate scores for each player hand
  Object.keys(game.tokenToHands).forEach((token) =>{
    let score = game.tokenToHands[token].reduce( (x, y) => {
      //the first time, the accumulator is an object
      // after it turns into a number so the ternary
      // is necessary
      x = typeof x === 'object' ? x.value : x;
      return x + y.value;
    });
    tokenToScores[token] = score;
  });

  hole['tokenToScores'] = tokenToScores;
  game.holes.push(hole);

  //next, collect all of the player's hands.
  // also, collect the cards from the discard pile
  let collectedHands = Object.keys(game.tokenToHands)
                             .map( key => { return game.tokenToHands[key]; })
                             .reduce((a,b) => { return a.concat(b); })
                             .concat(game.discardPile);

  //let the JS garbage collector clean up, set player hands
  // and discard pile to empty arrays
  game.discardPile = [];
  Object.keys(game.tokenToHands)
        .forEach(token => {
          game.tokenToHands[token] = [];
        });
  game.deck = game.deck.concat(collectedHands);
  game.lastRound = false;

  //redeal the player hands to start the round
  dealPlayerHands(game.gameNumber);

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
