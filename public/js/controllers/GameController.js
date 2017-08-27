angular.module('FourCardGolf').controller('GameController', function($scope, GameDetails, UserDetails, $mdToast) {
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

      socket.on('playerConnected', (data) => {
        $mdToast.showSimple(data.playerName + ' has joined the game.');
      });

      socket.on('playerLeft', (data) => {
        $mdToast.showSimple(data.playerName + ' has left the game.');
      });

      socket.on('gameMessage', (data) => {
        $mdToast.showSimple(data.message);
      });

      socket.on('turnReceived', (data) => {
        console.log(data);
      });

      socket.on('startTurn', (data) => {
        console.log(data);
      });

      socket.on('hands', (tokenToHands) => {
        self.cards = tokenToHands[user.token];
        console.log(self.cards);
      });
		});
	}

	init();

  function makeTurn(move, hand, token){
    return {
      turn : {
        move : move,
        hand : hand
      },
      playerToken : token
    };
  }

	self.sendTurn = function(){
		socket.emit('playerTurn', {playerToken : user.token});
	}

});
