(function(){
	
function config($stateProvider, $urlRouterProvider, $ocLazyLoadProvider, IdleProvider, KeepaliveProvider){
    $urlRouterProvider.otherwise("/login");
    // Configure Idle settings
//    IdleProvider.idle(5); // in seconds
//    IdleProvider.timeout(120); // in seconds
    $ocLazyLoadProvider.config({
        // Set to true if you want to see what and when is dynamically loaded
        debug: false
    });
    $stateProvider
        .state('login', {
            url: "/login",
            controller: "loginController",
            controllerAs: "loginCtrl",
            templateUrl: "views/login.html"

        })
        .state('main',{
            url: '/main',
            controller: 'mainController',
            controllerAs: 'mainCtrl',
            templateUrl: "views/common/content.html"
        })
//        .state('main.businessTrend',{
//            url: '/businessTrend',
//            templateUrl: "Main/businessTrend.html",
//            controller: 'trendController',
//            controllerAs: 'trendCtrl'
//        })
        .state('main.recordList',{
            url: '/recordList',
            templateUrl: "views/recordList.html",
            controller: 'recordListController',
            controllerAs: 'recordListCtrl',
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            name: ['ui.grid', 'ui.grid.edit','ui.grid.selection','ui.grid.pagination','ui.grid.expandable','ui.grid.pinning'],
                            files: ['css/plugins/uiGrid/ui-grid.min.css','js/plugins/uiGrid/ui-grid.min.js']
                        },
                        {
                            name: 'ui.tree',
                            files: ['css/plugins/uiTree/angular-ui-tree.min.css','js/plugins/uiTree/angular-ui-tree.min.js']
                        }
                    ]);
                }
            }
        })
        .state('main.crossAnalysis',{
            url: '/crossAnalysis',
            templateUrl: "views/crossAnalysis.html"
        })
        .state('main.buildModel',{
            url: '/buildModel',
            templateUrl: "views/buildModel.html",
            controller: 'buildModelController',
            controllerAs: 'buildModelCtrl',
            resolve:{
                loadPlugin: function($ocLazyLoad){
                    return $ocLazyLoad.load([
                        {
                            name: ['ngDragDrop'],
                            files: ['js/plugins/dragdrop/angular-dragdrop.min.js']
                        }
                    ])
                }
            }
        })

}

angular
    .module('iNu')
    .config(['$stateProvider', '$urlRouterProvider', '$ocLazyLoadProvider', 'IdleProvider', 'KeepaliveProvider',config])
    .run(function($rootScope, $state) {
        //$rootScope.$state = $state;
    });

})()