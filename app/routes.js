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

    app.get('/game/getGameNumber?:numberOfPlayers', function(req,res){
        res.send({gameNumber : gameManager.getGameNumber(req.query.numberOfPlayers)});
    });

    //endpoint for socket.io
    app.get('/game?:gameId',function(req,res){
        let nsp = io.of('/gameSession/' + req.query.gameId);
        nsp.on('connect', function(socket){
            nsp.emit('welcome', {message : 'suh dude.'});
            socket.on('player', function(data){
                console.log(data);
            });
        });
        res.send(200);
    });
};