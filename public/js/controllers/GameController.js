angular.module('FourCardGolf').controller('GameController', function($scope, GameDetails) {
	var self = this;

	function init(){
		var socket = io('http://localhost:8080/gameSession/' + GameDetails.getGameId());
		socket.on('connect', function(data){
			console.log(data);
			socket.on('welcome',(data) => {console.log(data);});
			socket.emit('client', {message : 'I are the client'});
		});
	}

	init();

});