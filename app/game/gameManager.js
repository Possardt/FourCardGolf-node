let _ 			= require('lodash');
let gameStack 	= [];

function getGameNumber(numberOfPlayers){
	let gameNumber = Math.floor(Math.random() * 10000);
	let result = _.find(gameStack, {gameNumber : gameNumber});
	if(!result){
		gameStack.push({gameNumber : gameNumber, numberOfPlayers : numberOfPlayers});
		return gameNumber;
	}
	else{
		getGameNumber();
	}
}



module.exports = {
	getGameNumber 	: getGameNumber,
	gameStack 		: gameStack
};