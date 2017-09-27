(function(){
  'use strict';
  angular.module('FourCardGolf').controller('LoginController', function($scope, $http, $rootScope, $location) {
    var self = this;

    self.logOut = function(){
      $http.post('/logout')
        .then(() => {
          $rootScope.loggedIn = false;
          $location.path('/');
        })
        .catch((err) => {console.error(err);});
    };

  });

})();
