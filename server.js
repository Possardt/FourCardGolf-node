'use strict';

// server.js

// modules =================================================
const express          = require('express');
const app              = express();
const bodyParser 	     = require('body-parser');
const methodOverride   = require('method-override');
const passport       	 = require('passport');
const session          = require('express-session');
const gameManager 	 	 = require('./app/game/gameManager')
const server 		    	 = require('http').createServer(app);
const io 				       = require('socket.io')(server);
const strategies       = require('./app/strategies.js');

// configuration ===========================================
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(express.static(__dirname + '/public'));

app.use(session({
	secret: 'neting',
	resave: true,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());


passport.use(strategies.githubStrategy);

passport.use(strategies.facebookStrategy);

passport.serializeUser(function(user,done){
	done(null, user);
});

passport.deserializeUser(function(user,done){
	done(null, user);
});

gameManager.initializeGameNamespace(io);

// routes ==================================================
require('./app/routes')(app, passport, io); // configure our routes

// start app ===============================================
server.listen(3000);
console.log('Started on port 3000');
exports = module.exports = app;
