angular.module('FourCardGolf').controller('GameController', function($scope, GameDetails) {
	var self = this;
	let socket;
	function init(){
		socket = io('http://localhost:8080/gameSession/' + GameDetails.getGameId());
		socket.on('connect', function(data){
			console.log(data);
			socket.on('welcome',(data) => {console.log(data);});
			socket.emit('player', {message : 'I are the client'});
		});
	}

	init();
	// socket.emit('player', {playerId : })

});