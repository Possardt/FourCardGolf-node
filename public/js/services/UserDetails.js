angular.module('FourCardGolf').service('UserDetails', function(){
	let userName,
		userId,
		userEmail;
	return {
		getUserName 	: function() {return userName},
		setUserName 	: function(name) {userName = name},
		getUserId   	: function() {return userId},
		setUserId   	: function(id) {userId = id},
		getUserEmail 	: function() {return userEmail},
		setUserEmail 	: function(email) {userEmail = email}
	}
});
