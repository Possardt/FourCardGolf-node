(function(){
  'use strict';

  let suits	= ['Clubs','Spades','Hearts','Diamonds'],
      cards	= ['A','2','3','4','5','6','7','8','9','10','J','K','Q'];

  const cardToValue = {
    'A'  : 1,
    '2'  : 2,
    '3'  : 3,
    '4'  : 4,
    '5'  : 5,
    '6'  : 6,
    '7'  : 7,
    '8'  : 8,
    '9'  : 9,
    '10' : 0,
    'J'  : 0,
    'Q'  : 10,
    'K'  : 10
  }

  function getDeck(){
    let deck = [];

    suits.forEach((suit) => {
      cards.forEach((card) => {
        deck.push({suit      : suit,
                   shortSuit : suit.split('')[0],
                   card      : card,
                   value     : cardToValue[card]});
      });
    });

    shuffle(deck);
    shuffle(deck);
    shuffle(deck);
    shuffle(deck);

    return deck;
  }

  //Fisher yates shuffle
  function shuffle(deck) {
    let currentIndex = deck.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      //swap
      temporaryValue = deck[currentIndex];
      deck[currentIndex] = deck[randomIndex];
      deck[randomIndex] = temporaryValue;
    }
  }

  module.exports = {
    getDeck : getDeck,
    shuffle : shuffle
  };
})();
