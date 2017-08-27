const secrets          = require('../secrets.js');
const GitHubStrategy   = require('passport-github2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const MongoClient      = require('mongodb').MongoClient;
const assert		    	 = require('assert');

const GITHUB_CLIENT_ID        = secrets.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET    = secrets.GITHUB_CLIENT_SECRET;
const FACEBOOK_CLIENT_ID      = secrets.FACEBOOK_CLIENT_ID;
const FACEBOOK_CLIENT_SECRET  = secrets.FACEBOOK_CLIENT_SECRET;
const MongoURI                = secrets.mongoURI;

MongoClient.connect(MongoURI, function(err, db) {
  assert.equal(null, err);
});

let githubStrategy = new GitHubStrategy({
		clientID     : GITHUB_CLIENT_ID,
		clientSecret : GITHUB_CLIENT_SECRET,
		callbackURL  : "http://localhost:3000/auth/github/callback"
	}, function(accessToken, refreshToken, profile, done){
		process.nextTick(function (){
			MongoClient.connect(MongoURI, function(err,db){
				let collection = db.collection('user');
				collection.update({
                        authId : profile._json.id,
                          name : profile._json.name,
                         email : profile._json.email
            }, {
                        authId : profile._json.id,
                          name : profile._json.name,
                         email : profile._json.email,
                   lastLoginTs : new Date()},
            {upsert:true})
			  .catch(err => {
            console.log(err);
        });
				db.close();
			});
			return done(null, profile);
		});
	}
);

let facebookStrategy = new FacebookStrategy({
    clientID     : FACEBOOK_CLIENT_ID,
    clientSecret : FACEBOOK_CLIENT_SECRET,
    callbackURL  : "http://localhost:3000/auth/facebook/callback"
  }, function(accessToken, refreshToken, profile, done){
    process.nextTick(function() {
      MongoClient.connect(MongoURI, function(err, db){
        let collection = db.collection('user');
        collection.update({
                        authId : profile._json.id,
                          name : profile._json.name
          },{
                        authId : profile._json.id,
                          name : profile._json.name,
                   lastLoginTs : new Date()
          }, {upsert:true})

        .catch(err => {
            console.log(err);
        });
        db.close();
      });
    });
    return done(null, profile);
  }
);

module.exports = {
    facebookStrategy : facebookStrategy,
    githubStrategy   : githubStrategy
};
