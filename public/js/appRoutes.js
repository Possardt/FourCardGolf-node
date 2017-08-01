// public/js/appRoutes.js
angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $routeProvider

        // home page
        .when('/', {
            templateUrl: 'views/login.html',
            controller: 'LoginController'
        });

    $locationProvider.html5Mode(true);

}]);
