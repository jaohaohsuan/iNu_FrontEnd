(function(){
	
function config($stateProvider, $urlRouterProvider, $ocLazyLoadProvider, IdleProvider, KeepaliveProvider){
    $urlRouterProvider.otherwise("/main");
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
            views:{
                '':{
                    templateUrl: "views/buildModel.html",
                    controller: 'buildModelController',
                    controllerAs: 'buildModelCtrl'
                },
                'createComponent@main.buildModel':{
                    templateUrl:'views/buildModel_createComponent.html'
                },
                'createModule@main.buildModel':{
                    templateUrl:'views/buildModel_createModule.html'
                },
                'callList@main.buildModel':{
                    templateUrl:'views/buildModel_callList.html'
                },
                'associateWords@main.buildModel':{
                    templateUrl:'views/buildModel_associateWords.html'
                },
                'modules@main.buildModel':{
                    templateUrl:'views/buildModel_modules.html'
                }
            },
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
        //.state('main.buildModel.createComponent',{
        //    url:'/createComponent',
        //    views:{
        //        'createComponent':{
        //            templateUrl:'views/buildModel_createComponent.html'
        //        }
        //    }
        //})
        //.state('main.buildModel.createModule',{
        //    url:'/createModule',
        //    views:{
        //        'createModule':{
        //            templateUrl:'views/buildModel_createModule.html'
        //        }
        //    }
        //})
        //.state('main.buildModel.callList',{
        //    url:'/callList',
        //    views:{
        //        'callList':{
        //            templateUrl:'views/buildModel_callList.html'
        //        }
        //    }
        //})
        //.state('main.buildModel.associateWords',{
        //    url:'/associateWords',
        //    views:{
        //        'associateWords':{
        //            templateUrl:'views/buildModel_associateWords.html'
        //        }
        //    }
        //})
        //.state('main.buildModel.modules',{
        //    url:'/modules',
        //    views:{
        //        'modules':{
        //            templateUrl:'views/buildModel_modules.html'
        //        }
        //    }
        //})
}

    angular
        .module('iNu')
        .config(['$stateProvider', '$urlRouterProvider', '$ocLazyLoadProvider', 'IdleProvider', 'KeepaliveProvider',config])
        .run(function($rootScope, $state) {
            //$rootScope.$state = $state;
        });

})();