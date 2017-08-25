const _               = require('lodash');
const deck            = require('./Deck');
let pendingGameStack 	= {}; //games waiting for players
let activeGameStack 	= {}; //games that have started
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
                      socketToToken    : {}
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

function removePlayer(gameNumber){
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
  activeGameStack[gameNumber].deck =
  gamesNamespace.emit('pendingGamesUpdate', {pendingGameStack : pendingGameStack});
}

//Functionality for started games ============
function getPlayerHands(){

}

function handleTurn(game, data){
  game.currentTurn = ++game.currentTurn % game.connectedPlayers;
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
  handleTurn              : handleTurn
};
