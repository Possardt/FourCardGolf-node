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
    self.deck = {selected : false};
    self.discardPileTop = {selected : false};

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
        if(self.cards === undefined || !equalHands(tokenToHands[user.token], self.cards)){
          self.cards = tokenToHands[user.token];
        }
      });

      socket.on('holes', holes => {
        self.holes = holes;
      });

      socket.on('discardPileUpdate', (update) => {
        self.discardPileTop.card = update.card;
      });
		});
	}

	init();

  function equalHands(hand1, hand2){
    if(hand1.length !== hand2.length){
      return false;
    }
    for(let i = 0; i < hand1.length; i++){
      if(hand1[i].card !== hand2[i].card ||
         hand1[i].suit !== hand2[i].suit){
        return false;
      }
    }
    return true;
  }

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

  function clearSelectedCards(){
    self.cards.forEach((card) => {
      card.selected = false;
    });
  }

	self.sendTurnSwap = function(){

    if(!currentTurnMove.cardToSwap || !currentTurnMove.swapWith){
      return;
    }

    clearSelectedCards();

    let turn = makeTurn('swap', currentTurnMove.cardToSwap, currentTurnMove.swapWith, user.token);
		socket.emit('playerTurn', turn);

    self.discardPileTop.selected = false;
    self.deck.selected = false;
    currentTurnMove.cardToSwap = null;
    currentTurnMove.swapWith = '';
	};

  self.sendTurnKnock = function(){
    let turn = makeTurn('knock', null, null);
    socket.emit('playerTurn', turn);
  };

  self.setCardToSwap = function(card){
    clearSelectedCards();
    card.selected = true;
    currentTurnMove.cardToSwap = card;
  };

  self.setSwapWithDiscardOrDeck = function(choice){
    if(choice === 'deck'){
      self.discardPileTop.selected = false;
      self.deck.selected = true;
    }
    else {
      self.discardPileTop.selected = true;
      self.deck.selected = false;
    }
    currentTurnMove.swapWith = choice;
  };


});
