(function () {
    angular.module('iNu')
        .controller('buildModelController', ['$scope', '$state', buildModelController])
        .controller('createModelController', ['$scope', 'jsonMethodService','jsonParseService', createModelController])

    function buildModelController($scope, $state) {
        var self = this;
        self.modelBroadcast = modelBroadcast;
        self.tabs = [
            {title: 'createComponent', active: true},
            {title: 'createModel'},
            {title: 'callList'},
            {title: 'associateWords'},
            {title: 'modules'}
        ]
        function modelBroadcast(tab) {
            var isComopnent = (tab.title == self.tabs[0].title);
            $scope.$broadcast('isComponent', isComopnent);
        }
    }

    function createModelController($scope, jsonMethodService,jsonParseService) {
        var self = this;
        self.addToBuildSection = addToBuildSection;
        self.isComponent = true;
        self.isRounded=isRounded;
        self.logicWord = 'and';
        $scope.$on('isComponent', function (event, isComponent) {
            self.isComponent = isComponent;
        });
        self.keywordCheck = keywordCheck;
        self.modelSection = {
            "basicModel": "mustHave",
            "reuseModel": "mustHave"
        };
        self.roles = [
            {"name": "角色：全部", "content": "ALL"},
            {"name": "角色：A", "content": "A"},
            {"name": "角色：B", "content": "B"}
        ]
        self.toggleSelection = toggleSelection;
        setReuseModel();
        setModelSection();

        function addToBuildSection(modelSection) {
            var kvDatasource = jsonParseService.getObjectMappingNameToValueFromDatas(self.datasource,"name");
            jsonMethodService.getJson('json/mustNotNew.json').then(function(collectionjson){
                var datas = jsonParseService.getDatasFromCollectionJson(collectionjson);
                kvDatasource[modelSection].datas = datas;
            })
            initialSetting();
        }

        function initialSetting(){
            self.keywords = "";
            self.distance = 5;
            self.selectedRole = self.roles[0];
            self.selectedReuseModel = [];
            self.canAdd = false;
            self.inputFocus = true;
        }
        function setReuseModel() {
            jsonMethodService.getJson('json/reuseModel.json').then(
                function (data) {//success
                    self.reuseModel = data;
                }, function (data) {//error

                }
            );
        }
        function setModelSection(){
            jsonMethodService.getJson('json/buildSection.json').then(function(collectionjson){
                self.datasource = jsonParseService.getRelTemplate(collectionjson.collection.links,"section");
                angular.forEach( self.datasource,function(section){
                    jsonMethodService.getJson('json/' + section.href).then(function(collectionjson){
                        var datas = jsonParseService.getDatasFromCollectionJson(collectionjson);
                        section.datas = datas;
                    })
                })
            })
        }
        function toggleSelection(selectedItems, item) {
            var idx = selectedItems.indexOf(item);
            if (idx != -1) selectedItems.splice(idx, 1);
            else selectedItems.push(item);
        }

        /**
         *檢查輸入規則
         * @param textcontent
         */
        function keywordCheck(textcontent) {
            if (!textcontent || textcontent.length <= 0) {
                self.canAdd = false;
                return;
            }
            self.canAdd = true;
        }
        function isRounded(){
            return window.innerWidth<768
        }
    }
})();