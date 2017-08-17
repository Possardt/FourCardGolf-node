angular.module('FourCardGolf').controller('LobbyController', function($http, $scope, $location, GameDetails, UserDetails) {
	let self = this;
	let socket;
	$scope.gameStack = [];
	
	self.name = UserDetails.getUserName();

	self.humanPlayersSelectChange = function(){
		$scope.showHumanPlayersWarning = self.humanPlayers ? false : true;
	}

	self.startHumanGame = function(){
		if(self.humanPlayers){
			let gameNumberConfig = {
					method	: 'GET',
					params 	: {
						numberOfPlayers : self.humanPlayers
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
	}

	self.joinGame = function(gameId){
		GameDetails.setGameId(gameId);
		$location.path('/game/' + gameId);
	}

	function init(){
		socket = io('http://localhost:3000/activeGames');
		socket.on('connect', function(data){
			socket.on('welcome',(data) => {console.log(data);});
			socket.on('activeGamesUpdate', (data) => {
				console.log('active games update');
				console.log(data);
				angular.extend($scope.gameStack, data.gameStack);
				$scope.$apply();
			});
		});
	}

	init();

});