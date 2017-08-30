'use strict';

const gameManager = require('./game/gameManager');

module.exports = function(app, passport, mongoDb, io) {

  app.get('/', function(req, res) {
    res.sendfile('./public/views/index.html');
  });

  app.post("/logout", function(req, res) {
    req.logOut();
    res.send(200);
  });

  //endpoint to verify user is authenticated
  app.get('/loggedin',function(req, res) {
    let dataToReturn = !req.isAuthenticated() ? '0' :
      {
        name    : req.user._json.name,
        email   : req.user._json.email,
        token   : req.user._json.id
      };

    res.send(dataToReturn);
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
          playerName = data.player.name;
          nsp.emit('playerConnected', {playerName : data.player.name});
          gameManager.addPlayer(gameId, data.player.token, socket.conn.id);
        }

        if(game.connectedPlayers === Number(game.numberOfPlayers)){
          gameManager.allPlayersConnected(gameId);
          game = gameManager.getActiveGame(gameId);
          nsp.emit('gameMessage', {message : 'game is starting'});
          nsp.emit('hands', game.tokenToHands);
          nsp.emit('discardPileUpdate', { card : game.discardPile[0]});
          nsp.emit('startTurn', {token : game.socketToToken[game.socketIds[game.currentTurn]]});
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

        if(socket.conn.id === currentTurnSocketId){
          gameManager.handleTurn(game, data);
        }

        currentTurnSocketId = game.socketIds[game.currentTurn];
        nsp.emit('startTurn',{token : game.socketToToken[currentTurnSocketId]});
      });



    });
    res.send(200);
  });
};
