angular.module('FourCardGolf').service('GameDetails', function(){
	let gameId,
		numberOfPlayers;
	return {
		getGameId : function(){return gameId;},
		setGameId : function(game){gameId = game;},
		getNumberOfPlayers : function(){return numberOfPlayers;},
		setNumberOfPlayers : function(num){numberOfPlayers = num;}
	}
});