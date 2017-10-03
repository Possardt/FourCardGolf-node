(function(){
  'use strict';

  const gameManager = require('./game/gameManager');
  const MongoURI    = require('../secrets.js').mongoURI;
  const MongoClient = require('mongodb').MongoClient;

  module.exports = function(app, passport, io) {
    let mongoDb;

    MongoClient.connect(MongoURI, function(err, db) {
      mongoDb = db;
    });

    app.get('/', function(req, res) {
      res.sendfile('./public/views/index.html');
    });

    app.post("/logout", function(req, res) {
      req.logOut();
      res.send(200);
    });

    //endpoint to verify user is authenticated
    app.get('/loggedin',function(req, res) {
      let dataToReturn;
      if(!req.isAuthenticated()){
        res.send('0');
      }
      else{
        mongoDb.collection('user')
          .findOne(
            { 'authId' : req.user._json.id},
            { _id : 0 })
          .then(result => {
            if(!result){
              res.send('0');
            }
            else{
              return {
                name   : result.name,
                userId : result.userId,
                email  : result.email
              };
            }
          })
          .then(dataToReturn => {
            res.send(dataToReturn);
          });
      }
    });

    app.get('/auth/github',
            passport.authenticate('github', { scope: [ 'user:email' ] }));

    app.get('/auth/github/callback',
      passport.authenticate('github', { failureRedirect: '/' }),
      function(req, res) {
        res.redirect('/#/lobby');
      }
    );

    app.get('/auth/facebook',
            passport.authenticate('facebook'));

    app.get('/auth/facebook/callback',
      passport.authenticate('facebook', { failureRedirect : '/'}),
      function(req,res){
        res.redirect('/#/lobby');
      }
    );

    app.get('/game/getGameNumber?:numberOfPlayers', function(req,res){
      res.send({gameNumber : gameManager.getGameNumber(req.query.numberOfPlayers)});
    });

    //endpoint for socket.io
    app.get('/game?:gameId',function(req,res){
      let nsp = io.of('/gameSession/' + req.query.gameId);
      let gameId = req.query.gameId;
      nsp.on('connection', function(socket){
        let game = gameManager.getPendingGame(gameId);
        let playerName;
        socket.on('hello',function(data){
          if(!game){
            console.log('game not found on stack, gameId : ' + gameId);
          }
          else{
            nsp.emit('playerConnected', {playerName : data.player.name});
            gameManager.addPlayer(gameId, data.player.userId, socket.conn.id, data.player.name);
          }

          if(game.connectedPlayers === Number(game.numberOfPlayers)){
            gameManager.allPlayersConnected(gameId);
            game = gameManager.getActiveGame(gameId);
            nsp.emit('gameStartingMessage', 'Game is starting!');
            nsp.emit('hands', game.userIdToHand);
            nsp.emit('discardPileUpdate', { card : game.discardPile[0]});
            nsp.emit('startTurn', {userId : game.socketToUserId[game.socketIds[game.currentTurn]]});
          }
        });

        socket.on('disconnect', function(){
          nsp.emit('playerLeft', {playerName : playerName});
          gameManager.removePlayer(gameId, socket.conn.id);
        });

        socket.on('playerTurn', (data) => {
          //Always get the latest version of the game
          game = gameManager.getActiveGame(gameId);
          let currentTurnSocketId = game.socketIds[game.currentTurn];
          let playerName = game.userIdToName[game.socketToUserId[currentTurnSocketId]];

          if(socket.conn.id === currentTurnSocketId){
            if(data.turn.move === 'knock'){
              nsp.emit('playerKnocked', playerName + ' has knocked!');
              game.lastRound = true;
              game.turnsLeft = game.connectedPlayers - 1;
            }

            gameManager.handleTurn(game, data);
            gameManager.checkForEndOfRoundOrGame(game);

            nsp.emit('holes', game.holes);
            nsp.emit('hands', game.userIdToHand);
            nsp.emit('discardPileUpdate', { card : game.discardPile[0]});

            if(game.endGame){
              console.log('time to end me');
              nsp.emit('gameOver', {});
            }
          }

          currentTurnSocketId = game.socketIds[game.currentTurn];
          nsp.emit('startTurn',{userId : game.socketToUserId[currentTurnSocketId], lastRound : game.lastRound});
        });



      });
      res.send(200);
    });
  };
})();
