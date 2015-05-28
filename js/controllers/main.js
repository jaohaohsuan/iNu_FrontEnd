(function () {
    var scripts = document.getElementsByTagName('script');
    var scriptPath = scripts[scripts.length - 1].src;
    var theScriptDirectory = scriptPath.substring(0, scriptPath.lastIndexOf('/'));
    angular.module('iNu')
        .controller('mainController', ['$state', 'jsonMethodService', mainController])


    function mainController($state, jsonMethodService) {
        var self = this;

        self.logout =logout;
        self.selectGroup = selectGroup;
//            $state.go('main.crossAnalysis');
        self.theScriptDirectory = theScriptDirectory;



        doService();


        function doService() {

            jsonMethodService.getJson('json/pagetitle.json').then(
                function (data) {//success
                    self.userInfo = data;
                }, function (data) {//error

                }
            );
        }
        function logout(){
            $state.go('login');
        }
        function selectGroup(item) {
            console.log("selected:" + item);
        };

    }
})();