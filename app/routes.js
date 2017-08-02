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
        app.get('*', function(req, res) {
            res.sendfile('./public/views/index.html'); // load our public/index.html file
        });

        app.get('/auth/github',
		  	passport.authenticate('github', { scope: [ 'user:email' ] }));

		app.get('/auth/github/callback', 
  			passport.authenticate('github', { failureRedirect: '/' }),
  			function(req, res) {
    			// Successful authentication, redirect home.
    			res.redirect('/lobby');
  			});

    };
