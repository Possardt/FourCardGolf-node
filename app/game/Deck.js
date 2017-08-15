let suits = ['Clubs','Spades','Hearts','Diamonds'],
	cards = ['A','2','3','4','5','6','7','8','9','10','J','K','Q'],
	deck = [];

function getDeck(){
	suits.forEach((suit) => {
		cards.forEach((card) => {
			deck.push({suit : suit, card : card, value : cardToValue(card)});
		});
	});
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
  return deck;
}

module.exports = {
	getDeck : getDeck,
	shuffle : shuffle
};