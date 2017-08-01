var app = angular.module('FourCardGolf', ['ngRoute', 'ngMaterial']);

app.config(['$routeProvider', function($routeProvider) {

    $routeProvider
        // home page
        .when('/', {
            templateUrl		: 'views/login.html',
            LoginController	: 'LoginController'
        //game lobby
        }).when('/lobby',{
        	templateUrl		: 'views/lobby.html',
        	controller 		: 'LobbyController'
        });

}]);

app.config(['$locationProvider',function($locationProvider){
    $locationProvider.hashPrefix('');
}]);

app.config(function($mdThemingProvider){
    $mdThemingProvider.theme('default')
        .primaryPalette('green')
        .accentPalette('light-green');
});