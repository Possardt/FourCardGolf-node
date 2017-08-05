var app = angular.module('FourCardGolf', ['ngRoute', 'ngMaterial']);

app.config(['$routeProvider', function($routeProvider) {

    $routeProvider
        // home page
        .when('/', {
            templateUrl		: 'views/login.html',
            LoginController	: 'LoginController'
        })
        //game lobby
        .when('/lobby', {
        	templateUrl		: 'views/lobby.html',
            resolve         : {
                logincheck : checkLoggedIn
            },
        	controller 		: 'LobbyController'
        })
        //game page
        .when('/game/:gameId', {
            templateUrl     : 'views/game.html',
            resolve         : {
                logincheck  : checkLoggedIn
            },
            controller      : 'GameController'
        });

}]);

var checkLoggedIn = function($q, $timeout, $http, $location, $rootScope){
    var deferred = $q.defer();
    $http.get('/loggedin').then(function(user){
        console.log(user);
        if(user.data !== '0'){
            deferred.resolve();
        }else{
            deferred.reject();
        }
    },function(){}).catch(error => {console.log(error);});
    return deferred.promise;

};

app.config(['$locationProvider',function($locationProvider){
    $locationProvider.hashPrefix('');
}]);

app.config(function($mdThemingProvider){
    $mdThemingProvider.theme('default')
        .primaryPalette('green')
        .accentPalette('light-green');
});