angular.module('FourCardGolf').controller('LobbyController', function($http, $scope, $location) {
	var self = this;

	self.startGame = function(){
		$http.get('/game/1001').then(() => {
			$location.path('/game/1001');
		}).catch(err => {console.log(err)});
	}
});