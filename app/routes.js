module.exports = function(app, passport, mongoDb) {

    //Angular routes
    app.get('/', function(req, res) {
        res.sendfile('./public/views/index.html');
    });

    app.get('/lobby', function(req, res) {
        res.sendfile('./public/views/index.html');
    });

    app.get('/game/*', function(req, res) {
        res.sendfile('./public/views/index.html');
    });
    //End Angular routes

    app.post("/logout", function(req, res) {
        req.logOut();
        res.send(200);
    });

    //endpoint to verify user is authenticated
    app.get('/loggedin',function(req, res) {
        res.send(req.isAuthenticated() ? '1' : '0');
    });

    app.get('/auth/github',
	  	passport.authenticate('github', { scope: [ 'user:email' ] }),
            function(req,res){});

	app.get('/auth/github/callback',
        passport.authenticate('github', { failureRedirect: '/' }),
			function(req, res) {
    			res.redirect('/#/lobby');
            }
    );
};