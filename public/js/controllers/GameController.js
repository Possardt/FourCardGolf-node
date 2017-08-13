angular.module('FourCardGolf').controller('GameController', function($scope, GameDetails) {
	var self = this;

	function init(){
		var socket = io('http://localhost:8080/gameSession/' + GameDetails.getGameId());
		console.log(socket);
		socket.on('connection', function(data){
			console.log(data);
		});
	}

	init();

});