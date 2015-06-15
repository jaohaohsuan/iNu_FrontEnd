(function () {
    angular.module('iNu')
        .controller('buildModelController', ['$scope', '$timeout', buildModelController])
        .controller('createModelController', ['$scope', 'jsonMethodService', 'jsonParseService', '$timeout', 'SweetAlert', '$translate', createModelController])

    function buildModelController($scope, $timeout) {
        var self = this;
        self.modelBroadcast = modelBroadcast;

        self.tabs = [
            {title: 'createComponent', active: true},
            {title: 'createModel'},
            {title: 'callList'},
            {title: 'associateWords'},
            {title: 'modules'}
        ]
//        $timeout (function() {
//            modelBroadcast(self.tabs[0]);
//        },50);

        function modelBroadcast(tab) {
            $scope.$broadcast('currentTab', tab);
        }
    }

    function createModelController($scope, jsonMethodService, jsonParseService, $timeout, SweetAlert, $translate) {
        var self = this;
        self.addModel = addModel;
        self.addToBuildSection = addToBuildSection;
        self.autoTips = autoTips;
        self.clear = clear;
        self.componentOrModelName = $translate.instant('components');
        self.deleteComponent = deleteComponent;
        self.isComponent = true;
        self.isInstance = true;
        self.isNextTodo = false;
        self.isRounded = isRounded;
        self.keywordCheck = keywordCheck;
        self.logicWord = 'and';
        $scope.$on('currentTab', function (event, tab) {
            if (tab.title === 'createComponent') {
                self.isComponent = true;
                self.componentOrModelName = $translate.instant('components');
            } else {
                self.isComponent = false;
                self.componentOrModelName = $translate.instant('models');
            }
        });
        self.modelDatasource = {
            models: []
        };
        self.modelSection = {
            "basicModel": "mustHave",
            "reuseModel": "mustHave"
        };
        self.renameComponent = renameComponent;
        self.roles = [
            {"name": "角色：全部", "content": "ALL"},
            {"name": "角色：A", "content": "A"},
            {"name": "角色：B", "content": "B"}
        ];
        self.saveAs = saveAs;
        self.saveAsName = '';
        self.showUndo = false;
        self.toggleSelection = toggleSelection;
        self.undo = undo;

        setReuseModel();
        setModels();
        setModelSection();
        initialSetting();

        function addModel() {
            SweetAlert.swal({
                    title: $translate.instant('newModelsName'), //讀取多語系key
                    type: "input",
                    showCancelButton: true,
                    confirmButtonColor: "#1C84C6",
                    confirmButtonText: $translate.instant('sure'),
                    cancelButtonText: $translate.instant('cancel'),
                    closeOnConfirm: false,
                    closeOnCancel: true,
                    animation:false
                },
                function (inputValue) {
                    if (inputValue === false) return false;
                    if (inputValue === ""||!inputValue.trim().length) {
                        swal.showInputError("You need to write something!");
                        return false
                    }
                    swal("Nice!", "You wrote: " + inputValue, "success");
                    self.modelDatasource.models.push({
                        "name": inputValue
                    })
                });
        }

        function addToBuildSection(modelSection) {
            var kvDatasource = jsonParseService.getObjectMappingNameToValueFromDatas(self.datasource, "name");
            jsonMethodService.getJson('json/mustNotNew.json').then(function (collectionjson) {
                var datas = jsonParseService.getDatasFromCollectionJson(collectionjson);
                kvDatasource[modelSection].datas = datas;
            })
            initialSetting();
        }

        function autoTips(query) {
            var t = {
                "i": ["ibon", "ipad", "iphone1", "iphone2"],
                "ib": ["ibon"],
                "ibo": ["ibon"],
                "ibon": ["ibon"],
                "ip": ["ipad", "iphone1", "iphone2"],
                "ipa": ["ipad"],
                "iph": ["iphone1", "iphone2"],
                "ipad": ["ipad"],
                "ipho": ["iphone1", "iphone2"],
                "iphon": ["iphone1", "iphone2"],
                "iphone": ["iphone1", "iphone2"],
                "iphone1": ["iphone1"],
                "iphone2": ["iphone2"],
                "不": ["不賠", "不會"],
                "不賠": ["不賠"],
                "不會": ["不會"]

            }
            return t[query];
        }

        function clear(section) {
            self.showUndo = true;
        }

        function deleteComponent() {
            SweetAlert.swal({
                    title: $translate.instant('sureDelete'), //讀取多語系key
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: $translate.instant('sure'),
                    cancelButtonText: $translate.instant('cancel'),
                    closeOnConfirm: false,
                    closeOnCancel: true
                },
                function (isConfirm) {
                    if (isConfirm) {
                        SweetAlert.swal("deleted", "", "success");
                    }

                });
        }

        function initialSetting() {
            self.keywords = "";
            self.distance = 5;
            self.selectedRole = self.roles[0];
            self.selectedReuseModel = [];
            self.canAdd = false;
            self.inputFocus = true;
        }

        function renameComponent() {
            SweetAlert.swal("renamed", "", "success");
        }

        function saveAs() {
            if (self.saveAsName)
                self.isNextTodo = true;
        }


        function setModels() {
            jsonMethodService.getJson('json/models.json').then(
                function (data) {
                    self.modelDatasource.models = data;

                })
        }

        function setModelSection() {
            jsonMethodService.getJson('json/buildSection.json').then(function (collectionjson) {
                self.datasource = jsonParseService.getRelTemplate(collectionjson.collection.links, "section");
                angular.forEach(self.datasource, function (section) {
                    jsonMethodService.getJson('json/' + section.href).then(function (collectionjson) {
                        var datas = jsonParseService.getDatasFromCollectionJson(collectionjson);
                        section.datas = datas;
                    })
                })
            })
        }

        function setReuseModel() {
            jsonMethodService.getJson('json/reuseModel.json').then(
                function (data) {//success
                    self.reuseModel = data;
                }, function (data) {//error


                }
            );
        }

        function toggleSelection(selectedItems, item) {
            var idx = selectedItems.indexOf(item);
            if (idx != -1) selectedItems.splice(idx, 1);
            else selectedItems.push(item);
        }

        function undo() {
            self.showUndo = false;
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

        function isRounded() {
            return window.innerWidth < 768
        }
    }
})();