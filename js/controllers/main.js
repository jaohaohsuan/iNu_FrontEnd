(function () {
    var scripts = document.getElementsByTagName('script');
    var scriptPath = scripts[scripts.length - 1].src;
    var theScriptDirectory = scriptPath.substring(0, scriptPath.lastIndexOf('/'));
    angular.module('iNu')
        .controller('mainController', ['$state', 'jsonMethodService', '$scope', mainController])


    function mainController($state, jsonMethodService, $scope) {
        var self = this;
        $scope.$on('minimalizaSidebar', minimalizaSidebar)
      
        self.logout = logout;
        self.miniNaviLogo = false;
        $scope.showLogo = true;
        self.selectGroup = selectGroup;
//            $state.go('main.crossAnalysis');
        self.theScriptDirectory = theScriptDirectory;



        doService();


        function doService() {

            jsonMethodService.get('json/pagetitle.json').then(
                function (data) {//success
                    self.userInfo = data;
                }, function (data) {//error

                }
            );
        }
        function logout(){
            $state.go('login');
        }
        function minimalizaSidebar() {
            self.miniNaviLogo = !self.miniNaviLogo;
        }
        function selectGroup(item) {
            console.log("selected:" + item);
        };

    }
})();