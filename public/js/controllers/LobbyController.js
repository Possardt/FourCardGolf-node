angular.module('FourCardGolf').controller('LobbyController', function($http, $scope, $location, GameDetails, UserDetails) {
	let self = this;

	self.name = UserDetails.getUserName();

	self.startGame = function(){
		let gameNumberConfig = {
				method	: 'GET',
				params 	: {
					numberOfPlayers : $scope.humanPlayers
				}
		};
		$http.get('/game/getGameNumber', gameNumberConfig)
				.then(resp => { 
					GameDetails.setGameId(resp.data.gameNumber);
					GameDetails.setNumberOfPlayers($scope.humanPlayers);
					let gameConfig = {
						method	: 'GET',
						params 	: {
							gameId 	: GameDetails.getGameId()
						}
					}
					$http.get('/game', gameConfig)
					.then(() =>{
						$location.path('/game/' + GameDetails.getGameId());
					}).catch(err => {
						console.log(err)
					});
				})
				.catch(err => {
					console.log(err);
				});
	}
});