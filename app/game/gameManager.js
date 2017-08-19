let _ 					= require('lodash');
let pendingGameStack 	= {}; //games waiting for players
let activeGameStack 	= {}; //games that have started
let gamesNamespace;

function getGameNumber(numberOfPlayers){
	let gameNumber = Math.floor(Math.random() * 10000);
	let result = pendingGameStack[gameNumber];
	if(!result){
		pendingGameStack[gameNumber] = {
									gameNumber : gameNumber,
									numberOfPlayers : numberOfPlayers,
									connectedPlayers : 0
								};
		gamesNamespace.emit('activeGamesUpdate', {pendingGameStack : pendingGameStack});
		return gameNumber;
	}
	else{
		getGameNumber();
	}
}

function initializeGameNamespace(io){
	gamesNamespace = io.of('/activeGames');
	gamesNamespace.on('connect', function(socket){
		gamesNamespace.emit('welcome', {message : 'welcome to the lobby, foo'});
		gamesNamespace.emit('activeGamesUpdate', {pendingGameStack : pendingGameStack});
	});
}

function getPendingGame(game){
	return pendingGameStack[game];
}

function addPlayer(gameNumber){
	let game = getPendingGame(Number(gameNumber));
	game.connectedPlayers++;
	gamesNamespace.emit('pendingGamesUpdate', {pendingGameStack : pendingGameStack});
}

function removePlayer(gameNumber){
	let game = getPendingGame(Number(gameNumber));
	game.connectedPlayers--;
	gamesNamespace.emit('pendingGamesUpdate', {pendingGameStack : pendingGameStack});	
}

function allPlayersConnected(gameNumber){
	let gameCopy;
	angular.copy(pendingGameStack[gameNumber], gameCopy);
	delete pendingGameStack.gameNumber;
}		

module.exports = {
	getGameNumber		 	: getGameNumber,
	pendingGameStack		: pendingGameStack,
	initializeGameNamespace : initializeGameNamespace,
	getPendingGame 			: getPendingGame,
	addPlayer 				: addPlayer,
	removePlayer 			: removePlayer,
	activeGameStack 		: activeGameStack
};