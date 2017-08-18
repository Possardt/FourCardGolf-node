var app = angular.module('FourCardGolf', ['ngRoute', 'ngMaterial', 'ngMessages']);

app.config(['$routeProvider', function($routeProvider) {

    $routeProvider
        // home page
        .when('/', {
            templateUrl		: 'views/login.html'
        })
        //game lobby
        .when('/lobby', {
        	templateUrl		: 'views/lobby.html',
            resolve         : {
                logincheck : checkLoggedIn
            }
        })
        //game page
        .when('/game/:gameId', {
            templateUrl     : 'views/game.html',
            resolve         : {
                logincheck  : checkLoggedIn
            }
        });

}]);

var checkLoggedIn = function($q, $timeout, $http, $location, $rootScope, UserDetails){
    var deferred = $q.defer();
    $http.get('/loggedin')
        .then(function(user){
            if(user.data !== '0'){
                $rootScope.loggedIn = true;
                UserDetails.setUserName(user.data.name);
                UserDetails.setUserEmail(user.data.email);
                UserDetails.setUserToken(user.data.token);

                deferred.resolve();
            }else{
                $location.path('/');
                deferred.reject();
            }
        })
        .catch(error => {console.log(error);});
    
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