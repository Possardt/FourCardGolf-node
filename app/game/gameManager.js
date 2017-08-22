const _               = require('lodash');
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
                      socketIds        : []
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

function addPlayer(gameNumber, token, socketId){
  console.log(socket);
	let game = getPendingGame(gameNumber);
	game.connectedPlayers++;
  game.players.push(token);
  game.socketIds.push(socketId);
	gamesNamespace.emit('pendingGamesUpdate', {pendingGameStack : pendingGameStack});
}

function removePlayer(gameNumber){
	let game = getPendingGame(gameNumber);
	game.connectedPlayers--;
	gamesNamespace.emit('pendingGamesUpdate', {pendingGameStack : pendingGameStack});
}

function allPlayersConnected(gameNumber){
	let gameCopy = _.cloneDeep(pendingGameStack[gameNumber]);
	delete pendingGameStack[gameNumber];
  activeGameStack[gameNumber] = gameCopy;
  gamesNamespace.emit('pendingGamesUpdate', {pendingGameStack : pendingGameStack});
}

//Functionality for started games ============
function startGame(){
  //TODO need players at this point
}

function handleTurn(){

}

module.exports = {
	getGameNumber		       	: getGameNumber,
	pendingGameStack	    	: pendingGameStack,
	initializeGameNamespace : initializeGameNamespace,
	getPendingGame 		    	: getPendingGame,
	addPlayer 			      	: addPlayer,
	removePlayer 			      : removePlayer,
	activeGameStack 		    : activeGameStack,
  allPlayersConnected     : allPlayersConnected
};
