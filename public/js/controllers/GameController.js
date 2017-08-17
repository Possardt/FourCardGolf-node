angular.module('FourCardGolf').controller('GameController', function($scope, GameDetails) {
	var self = this;
	let socket;
	function init(){
		socket = io('http://localhost:3000/gameSession/' + GameDetails.getGameId());
		socket.on('connection', function(data){
			// console.log(data);
			socket.on('welcome',(data) => {console.log(data);});
			// socket.emit('player', {message : 'I are the client'});
		});
	}

	init();

	self.sendTurn = function(){
		socket.emit('player', {turn : {move : 'knock', hand : [1,2,3]}});
	}

});