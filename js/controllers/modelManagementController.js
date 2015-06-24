/**
 * Created by Larry on 2015/6/24.
 */
(function(){
   angular.module('iNu')
       .controller('modelManagementController',['$scope',modelManagementController])

    function modelManagementController($scope){
        var self = this;
        self.datasource =[{"name":'AAA'},{"name":'BBB'},{"name":'BBB'},{"name":'BBB'},{"name":'BBB'},{"name":'BBB'},{"name":'BBB'},{"name":'BBB'}]
        self.selectedItems = [];
        self.displayProperty = "name";
        self.placeholder = "Select Models...";
    }
})();