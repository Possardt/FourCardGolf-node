let _ 			= require('lodash');
let gameStack 	= [];
let gamesNamespace;

function getGameNumber(numberOfPlayers){
	let gameNumber = Math.floor(Math.random() * 10000);
	let result = _.find(gameStack, {gameNumber : gameNumber});
	if(!result){
		gameStack.push({gameNumber : gameNumber, numberOfPlayers : numberOfPlayers, connectedPlayers : 0});
		gamesNamespace.emit('activeGamesUpdate', {gameStack : gameStack});
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
		gamesNamespace.emit('activeGamesUpdate', {gameStack : gameStack});
	});
}

function getGame(game){
	return _.find(gameStack, {gameNumber : Number(game)});
}

function addPlayer(gameNumber){
	let game = getGame(Number(gameNumber));
	game.connectedPlayers++;
	gamesNamespace.emit('activeGamesUpdate', {gameStack : gameStack});
}

function removePlayer(gameNumber){
	let game = getGame(Number(gameNumber));
	game.connectedPlayers--;
	gamesNamespace.emit('activeGamesUpdate', {gameStack : gameStack});	
}		

module.exports = {
	getGameNumber		 	: getGameNumber,
	gameStack 				: gameStack,
	initializeGameNamespace : initializeGameNamespace,
	getGame 				: getGame,
	addPlayer 				: addPlayer,
	removePlayer 			: removePlayer
};