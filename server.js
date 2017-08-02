// server.js

// modules =================================================
var express        	= require('express');
var app            	= express();
var bodyParser     	= require('body-parser');
var methodOverride 	= require('method-override');
var passport	   	= require('passport');
var session 		= require('express-session');
var GitHubStrategy 	= require('passport-github2').Strategy;

// configuration ===========================================

var GITHUB_CLIENT_ID = '931887f1b75b3841c82c';
var GITHUB_CLIENT_SECRET = '48649684bb962dc03ff7276c20456450f4987027';

// config files
// var db = require('./config/db');

// set our port
var port = process.env.PORT || 8080; 

// connect to our mongoDB database 
// (uncomment after you enter in your own credentials in config/db.js)
// mongoose.connect(db.url); 

// get all data/stuff of the body (POST) parameters
// parse application/json 
app.use(bodyParser.json()); 

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true })); 

// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override')); 

// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public')); 



app.use(session({secret: 'neting'}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GitHubStrategy({
		clientID : GITHUB_CLIENT_ID,
		clientSecret: GITHUB_CLIENT_SECRET,
		callbackURL : "http://127.0.0.1:8080/auth/github/callback"
	}, function(accessToken, refreshToken, profile, done){
		User.findOrCreate({githubId : profile.id}, function( err,user) {
			return done(err, user);
		});
	}
));

passport.serializeUser(function(user,done){
	done(null, user);
});

passport.deserializeUser(function(user,done){
	done(null, user);
});

// routes ==================================================
require('./app/routes')(app); // configure our routes

// start app ===============================================
// startup our app at http://localhost:8080
app.listen(port);               

// shoutout to the user                     
console.log('Started on port ' + port);

// expose app           
exports = module.exports = app; 
