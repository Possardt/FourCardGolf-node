(function(){
  'use strict';

  angular.module('FourCardGolf').controller('GameController', function($scope, $location, GameDetails, UserDetails, $mdToast, $timeout) {
    var self = this;
    let socket;
    const currentTurnMove = {};
    const user = {
      name    : UserDetails.getUserName(),
      userId  : UserDetails.getUserId(),
      email   : UserDetails.getUserEmail()
    };

    function getElementByClass(className){
      return document.getElementsByClassName(className)[0];
    }

    function init(){
      self.deck = {selected : false};
      self.discardPileTop = {selected : false};
      self.holesArray = [];
      for(let i = 0; i < 9; i++){
        self.holesArray[i] = i + 1;
      }
      self.userIdToName = {};
      self.currentTurnName = '';
      self.lastRound = false;
      self.gameStarted = false;
      self.holes = [];
      self.otherPlayerHands = {};

      socket = io('http://localhost:3000/gameSession/' + GameDetails.getGameId());
      socket.on('connect', data => {
        socket.emit('hello', {player : user});

        socket.on('playerConnected', data => {
          if(data.playerName !== user.name){
            showToast(data.playerName + ' has joined the game.');
          }
        });

        socket.on('playerLeft', data => {
          showToast(data.playerName + ' has left the game.');
        });

        socket.on('gameStartingMessage', message => {
          self.gameStarted = true;
          showToast(message);
        });

        socket.on('startTurn', data => {
          self.lastRound = data.lastRound;
          $scope.turnEnabled = data.userId !== user.userId;
          $scope.$apply();

          let nameCard = getElementByClass('top-row-descriptor-turn');

          nameCard.classList.remove('name-animation-show');
          nameCard.classList.add('name-animation-hide');

          $timeout(() => {
            self.currentTurnName = self.userIdToName[data.userId];
            nameCard.classList.remove('name-animation-hide');
            nameCard.classList.add('name-animation-show');
          }, 700);
        });

        socket.on('hands', userIdToHand => {
          if(self.cards === undefined || !equalHands(userIdToHand[user.userId], self.cards)){
            self.cards = userIdToHand[user.userId];

            let scoreCard = getElementByClass('top-row-descriptor-score');
            scoreCard.classList.remove('score-animation-show');
            scoreCard.classList.add('score-animation-hide');

            $timeout(() => {
              self.score = getScoreFromHand(userIdToHand[user.userId]);
              scoreCard.classList.remove('score-animation-hide');
              scoreCard.classList.add('score-animation-show');
            }, 700);
          }
          Object.keys(userIdToHand)
            .filter(userID => { return userID !== user.userId})
            .forEach(userID => {self.otherPlayerHands[userID] = userIdToHand[userID]});
        });

        socket.on('playerKnocked', playerKnockMessage => {
          showToast(playerKnockMessage);
        });

        socket.on('holes', holes => {
          if(!holes.length || holes.length === self.holes.length){
            return;
          }
          self.holes[holes.length - 1] = holes[holes.length - 1];
        });

        socket.on('discardPileUpdate', update => {
          self.discardPileTop.card = update.card;
        });

        socket.on('playerNames', userIdToName => {
          self.userIdToName = userIdToName;
        });

        socket.on('gameOver', message => {
          showToast('Game over, redirecting to main menu in 10 seconds.');
          $scope.gameOver = true;
          $timeout(() => {
            $location.path('/lobby');
          }, 10000);
        });
      });
    }

    init();

    function showToast(message){
      $mdToast.show(
        $mdToast.simple()
          .textContent(message)
          .position('top right')
          .hideDelay(3000)
      );
    }

    function getScoreFromHand(hand){
      let score = hand.map( card => { return card.value })
                      .reduce( (x, y) => { return x + y; });

      let containsHiddenCard =
          hand.filter(card => { return card.hidden; }).length !== 0;

      return containsHiddenCard ? score + '*' : score;
    }

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

    function makeTurn(move, card, swapWith, userId){
      return {
        turn : {
          move     : move,
          card     : card,
          swapWith : swapWith
        },
        userId : userId
      };
    }

    function clearSelectedCards(){
      self.cards.forEach((card) => {
        card.selected = false;
      });
    }

    self.sendTurnSwap = function() {

      if(!currentTurnMove.cardToSwap || !currentTurnMove.swapWith){
        return;
      }

      clearSelectedCards();

      let turn = makeTurn('swap', currentTurnMove.cardToSwap, currentTurnMove.swapWith, user.userId);
      socket.emit('playerTurn', turn);

      self.discardPileTop.selected = false;
      self.deck.selected = false;
      currentTurnMove.cardToSwap = null;
      currentTurnMove.swapWith = '';
    };

    self.sendTurnKnock = function() {
      let turn = makeTurn('knock', null, null);
      socket.emit('playerTurn', turn);
    };

    self.setCardToSwap = function(card) {
      clearSelectedCards();
      card.selected = true;
      currentTurnMove.cardToSwap = card;
    };

    self.setSwapWithDiscardOrDeck = function(choice) {
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

    self.getScoreFromHand = getScoreFromHand;
  });

})();
