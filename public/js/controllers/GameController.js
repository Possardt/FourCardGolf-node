angular.module('FourCardGolf').controller('GameController', function($scope, GameDetails) {
	var self = this;
	let socket;
	function init(){
		socket = io('http://localhost:3000/gameSession/' + GameDetails.getGameId());
		console.log('outside of connection');
		socket.on('connect', function(data){
			console.log('in here');
			socket.emit('hello', {message : 'please work'});
		});
		socket.emit('hello', {message : 'connect meeee'});
	}

	init();

	self.sendTurn = function(){
		socket.emit('player', {turn : {move : 'knock', hand : [1,2,3]}});
	}

});