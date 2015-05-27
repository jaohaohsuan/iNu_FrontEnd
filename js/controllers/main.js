(function () {
    var scripts = document.getElementsByTagName('script');
    var scriptPath = scripts[scripts.length - 1].src;
    var theScriptDirectory = scriptPath.substring(0, scriptPath.lastIndexOf('/'));
    angular.module('iNu')
        .controller('mainController', ['$state', 'jsonMethodService', function ($state, jsonMethodService) {
            var self = this;
            self.theScriptDirectory = theScriptDirectory;
//            $state.go('main.crossAnalysis');
            jsonMethodService.getJson('json/pagetitle.json').then(
                function (data) {//success
                    self.userInfo = data;
                }, function (data) {//error

                }
            );

            self.selectGroup = function (item) {
                console.log("selected:" + item);
            };
            self.logout = function () {
                $state.go('login');
            };

        }])

})();