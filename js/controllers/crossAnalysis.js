(function() {
    angular.module('iNu')
        .controller('crossAnalysisController', ['API_PATH', '$scope', 'buildModelService', crossAnalysisController])

    function crossAnalysisController(API_PATH, $scope, buildModelService) {
        var templateUrl = API_PATH + '_query/template';

        var self = this;
        self.queriesBinding = {};
        self.modelGroupSelectDataSource = [];
        self.modelGroupSelectedItems = '';
        self.matchedDatasource = [
            {
                name: 'Sony',
                count: 20,
                matched: true
            },
            {
                name: 'HTC',
                count: 25,
                matched: false
            },
            {
                name: 'Apple',
                count: 120,
                matched: false
            }
        ]
        buildModelService.setQueriesBinding(templateUrl, {}, self.queriesBinding, function(queriesBinding) {
            angular.forEach(queriesBinding.search.tags, function(tag) {
                self.modelGroupSelectDataSource.push(tag.name);
            });
        })
    }
})()