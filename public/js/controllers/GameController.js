'use strict';

angular.module('FourCardGolf').controller('GameController', function($scope, GameDetails, UserDetails, $mdToast) {
	var self = this;
	let socket;
  const currentTurnMove = {};
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
        if(data.playerName !== user.name){
          $mdToast.showSimple(data.playerName + ' has joined the game.');
        }
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
        $scope.turnEnabled = data.token !== user.token;
        $scope.$apply();
      });

      socket.on('hands', (tokenToHands) => {
        console.log(tokenToHands);
        self.cards = tokenToHands[user.token];
      });

      socket.on('discardPileUpdate', (update) => {
        self.discardPileTop = update.card;
      });
		});
	}

	init();

  function makeTurn(move, card, swapWith, token){
    return {
      turn : {
        move     : move,
        card     : card,
        swapWith : swapWith
      },
      playerToken : token
    };
  }

	self.sendTurnSwap = function(){

    if(!currentTurnMove.cardToSwap || !currentTurnMove.swapWith){
      return;
    }
    let turn = makeTurn('swap', currentTurnMove.cardToSwap, currentTurnMove.swapWith, user.token);
		socket.emit('playerTurn', turn);
	};

  self.sendTurnKnock = function(){

  };

  self.setCardToSwap = function(card){
    angular.element(card).addClass('selected');
    currentTurnMove.cardToSwap = card;
  };

  self.setSwapWithDiscardOrDeck = function(choice){
    currentTurnMove.swapWith = choice;
  };


});
