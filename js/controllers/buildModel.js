(function () {
    angular.module('iNu')
        .controller('buildModelController', ['$scope', '$state', buildModelController])
        .controller('createModelController', ['$scope','jsonMethodService',createModelController]);

    function buildModelController($scope, $state) {
        var self = this;
        self.modelBroadcast = modelBroadcast;
        self.tabs = [
            {title: 'createComponent', active: true},
            {title: 'createModule'},
            {title: 'callList'},
            {title: 'associateWords'},
            {title: 'modules'}
        ]
        function modelBroadcast(tab){
            var isComopnent = (tab.title == self.tabs[0].title);
            $scope.$broadcast('isComponent', isComopnent);
        }
    }

    function createModelController($scope,jsonMethodService) {
        var self = this;
        self.addModelArea = addModelArea;
        self.canAdd = false;
        self.distance = 5;
        self.deleteItem = deleteItem;
        self.isComponent = true;
        self.logicWord = 'and';
        $scope.$on('isComponent', function (event, isComponent) {
            self.isComponent = isComponent;
        });
        self.keywordCheck = keywordCheck;
        self.modelArea = {
            "basicModel": "mustHave",
            "reuseModel": "mustHave"
        };
        self.mustHave = [];
        self.mustNot = [];
        self.roles = [
            {"name": "角色：全部","content": "ALL"},
            {"name": "角色：A","content": "A"},
            {"name": "角色：B","content": "B"}
        ]
        self.should = [];
        self.selectedRole = self.roles[0];
        self.selectedReuseModel = [];
        self.toggleSelection = toggleSelection;
        setReuseModel();
        function addModelArea(content, logicword, distance, role, modelArea) {
            var data = {};
            data.content = content;
            data.distance = distance;
            data.logicWord = logicword;
            data.role = role.content;
            self[modelArea].push(data);
            self.keywords = "";
            self.distance = 5;
            self.selectedRole = self.roles[0];
            self.selectedReuseModel = [];
            self.canAdd = false;
        }

        function deleteItem(source, item) {
            var index = source.indexOf(item);
            source.splice(index, 1);
        }
        function setReuseModel(){
            jsonMethodService.getJson('json/reuseModel.json').then(
                function (data) {//success
                    self.reuseModel = data;
                }, function (data) {//error

                }
            );
        }
        function toggleSelection(selectedItems,item){
            var idx = selectedItems.indexOf(item);
            if (idx != -1) selectedItems.splice(idx,1);
            else selectedItems.push(item);
        }
        /**
         *檢查輸入規則
         * @param textcontent
         */
        function keywordCheck(textcontent) {
            if (!textcontent || textcontent.length <= 0){
                self.canAdd = false;
                return;
            }
            var regExp = /(,| )((,+|and|after|near|not|or)( |$)|,+)/g
            var match = regExp.exec(textcontent)
            if (match != null) {
                alert("錯誤位置：" + match.index + "，原因：,後面不可緊接著[" + match[2] + "]");
                self.canAdd = false;
            } else self.canAdd = true;
        }
    }
})();