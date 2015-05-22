(function(){
	
function config($stateProvider, $urlRouterProvider, $ocLazyLoadProvider, IdleProvider, KeepaliveProvider){
	
}

angular
    .module('iNu')
    .config(['$stateProvider', '$urlRouterProvider', '$ocLazyLoadProvider', 'IdleProvider', 'KeepaliveProvider',config])
    .run(function($rootScope, $state) {
        $rootScope.$state = $state;
    });

})()