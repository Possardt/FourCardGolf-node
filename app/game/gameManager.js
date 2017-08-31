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
                      tokenToHands     : {}
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
  console.log(data);
  console.log(game.tokenToHands[data.playerToken]);

  //get either top card of deck or top card of discardPile
  // swap that card with the card the player wants to swap
  // in either case, add the card the player sends to the top of
  //   the discard pile

  //TODO, update game score based on move
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
  dealPlayerHands         : dealPlayerHands
};
