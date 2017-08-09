module.exports = function(app, passport, mongoDb) {

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
                {name : req.user._json.name, email : req.user._json.email};
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
};