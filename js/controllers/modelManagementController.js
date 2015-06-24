/**
 * Created by Larry on 2015/6/24.
 */
(function(){
   angular.module('iNu')
       .controller('modelManagementController',['$scope',modelManagementController])

    function modelManagementController($scope){
        var self = this;
        self.groups =[{"name":'AAA'},{"name":'BBB'}]
    }
})();