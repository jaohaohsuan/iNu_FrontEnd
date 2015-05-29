(function () {
    angular.module('iNu')
        .controller('buildModelController', ['$scope',buildModelController]);

        function buildModelController($scope){
            var self = this;
            self.tabs =[
                {title:'createComponent',active:true},
                {title:'createModule'},
                {title:'callList'},
                {title:'associateWords'},
                {title:'modules'}
            ]
        }
})();