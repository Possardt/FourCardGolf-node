angular.module('FourCardGolf').service('UserDetails', function(){
	let userName,
		userToken,
		userEmail;
	return {
		getUserName 	: function(){return userName},
		setUserName 	: function(name){userName = name},
		getUserToken 	: function(){return userToken},
		setUserToken 	: function(token){userToken = token},
		getuserEmail 	: function(){return userEmail},
		setUserEmail 	: function(email){userEmail = email}
	}
});