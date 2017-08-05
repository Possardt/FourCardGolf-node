 // app/routes.js

// grab the nerd model we just created
// var Nerd = require('./models/nerd');

// var passport        = require('passport');

    module.exports = function(app, passport) {

        // server routes ===========================================================
        // handle things like api calls
        // authentication routes

        // sample api route
        

        // route to handle creating goes here (app.post)
        // route to handle delete goes here (app.delete)

        // frontend routes =========================================================
        // route to handle all angular requests
        app.get('/', function(req, res) {
            res.sendfile('./public/views/index.html'); // load our public/index.html file
        });

        app.get('/lobby', function(req, res) {
            res.sendfile('./public/views/index.html'); // load our public/index.html file
        });

        app.get('/game/*', function(req, res) {
            res.sendfile('./public/views/index.html'); // load our public/index.html file
        });

        app.get('/loggedin',function(req, res) {
            res.send(req.isAuthenticated() ? '1' : '0');
        });

        app.get('/auth/github',
		  	   passport.authenticate('github', { scope: [ 'user:email' ] }),
            function(req,res){
                console.log('in here');
            });

		app.get('/auth/github/callback',
            	passport.authenticate('github', { failureRedirect: '/' }),
  			function(req, res) {
    			// Successful authentication, redirect home.
    			res.redirect('/#/lobby');
            }
        );
    };