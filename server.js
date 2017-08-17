// server.js

// modules =================================================
const express        	= require('express');
const app            	= express();
const bodyParser     	= require('body-parser');
const methodOverride 	= require('method-override');
const passport		   	= require('passport');
const session 			= require('express-session');
const GitHubStrategy 	= require('passport-github2').Strategy;
const MongoClient 		= require('mongodb').MongoClient;
const assert			= require('assert');
const secrets			= require('./secrets');
const gameManager 		= require('./app/game/gameManager')
const server 			= require('http').createServer(app);
const io 				= require('socket.io')(server);


// configuration ===========================================
const GITHUB_CLIENT_ID = secrets.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = secrets.GITHUB_CLIENT_SECRET;
const MongoURI = secrets.mongoURI;
let mongoDb;

MongoClient.connect(MongoURI, function(err, db) {
  assert.equal(null, err);
  console.log("Connected to the Mongo DB successfully.");
  mongoDb = db;
});

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


passport.use(new GitHubStrategy({
		clientID : GITHUB_CLIENT_ID,
		clientSecret: GITHUB_CLIENT_SECRET,
		callbackURL : "http://localhost:3000/auth/github/callback"
	}, function(accessToken, refreshToken, profile, done){
		process.nextTick(function (){
			MongoClient.connect(MongoURI, function(err,db){
				let collection = db.collection('user');
				collection.update({authId : profile._json.id, name : profile._json.name, email : profile._json.email},
								{authId : profile._json.id, name : profile._json.name, email : profile._json.email, lastLoginTs : new Date()}, {upsert:true})
							.catch(err => {console.log(err);});
				db.close();
			});
			return done(null, profile);
		});
	}
));

passport.serializeUser(function(user,done){
	done(null, user);
});

passport.deserializeUser(function(user,done){
	done(null, user);
});

gameManager.initializeGameNamespace(io);

// routes ==================================================
require('./app/routes')(app, passport, mongoDb, io); // configure our routes

// start app ===============================================
server.listen(3000);              
console.log('Started on port 3000');
exports = module.exports = app;