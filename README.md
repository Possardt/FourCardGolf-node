# FourCardGolf-node
This is a multiplayer game made using the MEAN stack.  Other libraries used were Angular Material, Socket.io, passport(and associated strategies for auth).

## To start the game (note: you need Node ro run locally) :
1) Clone/download this repo
1) Navigate to the root directory
    - run npm -install
    - run node server.js
    - Note: you'll also need client secrets/tokens for authentication via Facebook or Github
1) Open a browser and navigate to localhost:3001
1) Start a game!

## Rules to Four Card Golf
1) In the beginning, every player is dealt 4 cards, two facing down.
1) When your turn comes, you can swap any of your cards with the deck or the discard pile.
    - when you swap a facing down card, it is revealed and added to the discard pile
1) The goal is to have the lowest scoring hand of all players
1) Each round is concluded when a player decides to knock
    - when you knock the other players get one last turn, then scores are collected
1) Repeat rounds until 9 or 18 holes are completed
