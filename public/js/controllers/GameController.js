angular.module('FourCardGolf').controller('GameController', function($scope, GameDetails, UserDetails) {
	var self = this;
	let socket;
	const user = {
		name  : UserDetails.getUserName(),
		token : UserDetails.getUserToken(),
		email : UserDetails.getUserEmail()
	};
	function init(){
		socket = io('http://localhost:3000/gameSession/' + GameDetails.getGameId());
		socket.on('connect', function(data){
			socket.emit('hello', {player : user});
		});
	}

	init();

	self.sendTurn = function(){
		socket.emit('player', {turn : {move : 'knock', hand : [1,2,3]}});
	}

});