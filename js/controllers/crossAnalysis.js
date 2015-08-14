(function () {
    angular.module('iNu')
        .controller('crossAnalysisController', ['$scope', crossAnalysisController])

    function crossAnalysisController($scope) {
        var self = this;
        self.modelGroup = ['123','1234'];
        self.matchedDatasource = [
            { name: 'Sony', count: 20, matched: true },
            { name: 'HTC', count: 25, matched: false },
            { name: 'Apple', count: 120, matched:false }
        ]
    }
})()