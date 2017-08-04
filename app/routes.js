 // app/routes.js

// grab the nerd model we just created
// var Nerd = require('./models/nerd');

var passport        = require('passport');

    module.exports = function(app) {

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

        app.get('/lobby', ensureAuthenticated, function(req, res) {
            res.sendfile('./public/views/index.html'); // load our public/index.html file
        });

        app.get('/game/*', ensureAuthenticated, function(req, res) {
            res.sendfile('./public/views/index.html'); // load our public/index.html file
        });

        app.get('/test', function(){console.log('testing')}, function(req, res){console.log('test');});

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

        function ensureAuthenticated(req, res, next){
            if(req.isAuthenticated()){return next();}
            res.redirect('/');
        };
    };