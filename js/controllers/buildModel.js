(function () {
    angular.module('iNu')
        .controller('buildModelController', ['$scope', '$timeout', '$translate', buildModelController])
        .controller('createModelController', ['$scope', 'jsonMethodService', 'jsonParseService', '$timeout', 'SweetAlert', '$translate', 'URL', createModelController])

    function buildModelController($scope, $timeout, $translate) {
        var self = this;
        //self.modelBroadcast = modelBroadcast;
        self.removeTab = removeTab;
        self.tabIndex = 0;
        self.tabs = [
            {title: 'createModel', active: true},
            {title: 'callList'},
            {title: 'associateWords'},
            {title: 'modules'}
        ]

        $scope.$on('addTab', function (event, tab) {
            self.tabs.splice(self.tabIndex + 1, 0, tab);
            self.tabIndex++;
        });

        function removeTab(tab) {
            $timeout(function () { //刪除tab 不知為何需要用timeout才不會讓網址跑掉
                self.tabIndex--;
                self.tabs.splice(self.tabs.indexOf(tab), 1);
                if (self.tabIndex == 0) {
                    self.tabs[self.tabIndex].active = true;
                }
            }, 0);
        }
    }

    function createModelController($scope, jsonMethodService, jsonParseService, $timeout, SweetAlert, $translate, URL) {

        var modelGroupSelectedTimeout;
        var self = this;

        self.addModelGroup = addModelGroup;
        self.addTab = addTab;
        self.addToBuildSection = addToBuildSection;
        self.autoTips = autoTips;
        self.clear = clear;
        self.deleteModel = deleteModel;
        self.isInstance = true;
        self.isRounded = isRounded;
        self.keywordCheck = keywordCheck;
        self.logicWord = 'and';
        //$scope.$on('currentTab', function (event, tab) {
        //    self.tabIndex = $scope.buildModelCtrl.tabs.indexOf(tab);
        //});
        self.modelDatasource = {
            models: []
        };
        self.modelSection = {
            "basicModel": "mustHave",
            "reuseModel": "mustHave"
        };
        self.modelGroupsSelectedHandler = modelGroupsSelectedHandler;
        self.nextToDo = nextToDo;
        self.renameModel = renameModel;
        self.roles = [
            {"name": "角色：全部", "content": "ALL"},
            {"name": "角色：A", "content": "A"},
            {"name": "角色：B", "content": "B"}
        ];
        self.saveAs = saveAs;
        self.saveAsName = '';
        self.showUndo = false;
        self.tabIndex = 0;
        self.toggleSelection = toggleSelection;
        self.undo = undo;

        setReuseModel();
        setModels();
        setModelSection();
        initialSetting();
        $scope.$on("$destroy", destroyListener);
        function addModelGroup() {
            SweetAlert.swal({
                    title: $translate.instant('newModelsName'), //讀取多語系key
                    type: "input",
                    showCancelButton: true,
                    inputPlaceholder: $translate.instant('newModelsName'),
                    confirmButtonColor: "#1C84C6",
                    confirmButtonText: $translate.instant('sure'),
                    cancelButtonText: $translate.instant('cancel'),
                    closeOnConfirm: false,
                    closeOnCancel: true,
                    animation: false
                },
                function (inputValue) {
                    if (inputValue === false) return false;
                    if (inputValue === "" || !inputValue.trim().length) {
                        swal.showInputError("You need to write something!");
                        return false
                    }
                    swal("Nice!", "You wrote: " + inputValue, "success");
                    self.modelDatasource.models.push({
                        "name": inputValue
                    })
                });
        }

        function addTab() {
            SweetAlert.swal({
                    title: $translate.instant('newComponentName'), //讀取多語系key
                    type: "input",
                    showCancelButton: true,
                    inputPlaceholder: $translate.instant('newComponentName'),
                    confirmButtonColor: "#1C84C6",
                    confirmButtonText: $translate.instant('sure'),
                    cancelButtonText: $translate.instant('cancel'),
                    closeOnConfirm: false,
                    closeOnCancel: true,
                    animation: false
                },
                function (inputValue) {
                    if (inputValue === false) return false;
                    if (inputValue === "" || !inputValue.trim().length) {
                        swal.showInputError("You need to write something!");
                        return false
                    }
                    swal({
                        title: 'Nice!',
                        text: "You wrote: " + inputValue,
                        timer: 1000,
                        type: "success",
                        showConfirmButton: false
                    });
                    $scope.$emit('addTab', {title: 'createModel', active: true, addable: true, tabName: inputValue});
                    URL.path = inputValue; //設定URL Service的path變數
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

        function deleteModel() {
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

        function destroyListener(event) {
            $timeout.cancel(modelGroupSelectedTimeout);
        }

        function initialSetting() {
            self.keywords = [];
            if (URL.path) {
                self.keywords.push({text: URL.path});
                console.log(JSON.stringify(self.keywords))
            }
            self.distance = 5;
            self.selectedRole = self.roles[0];
            self.selectedReuseModel = [];
            self.canAdd = false;
            self.inputFocus = true;
        }

        function isRounded() {
            return window.innerWidth < 768
        }

        function modelGroupsSelectedHandler(selectedModelGroups) {
            if (modelGroupSelectedTimeout) $timeout.cancel(modelGroupSelectedTimeout);
            modelGroupSelectedTimeout = $timeout(function () {
                console.log(selectedModelGroups)
            }, 1000); // delay 1000 ms
        }

        function nextToDo() {
            self.nextView = true;
            self.saveAsNameInputFocus = true;
        }

        function renameModel() {
            SweetAlert.swal("renamed", "", "success");
        }

        function saveAs(condition) {
            if (!self.saveAsName || !self.saveAsName.length) return false;
            else {
                var next = {
                   'edit': function () {
                       $scope.$emit('addTab', {title: 'createModel', active: true, addable: true, tabName: self.saveAsName});
                       URL.path = '編輯樣板的url';
                    },
                    'online': function () {
                        alert('online!')
                    },
                    'save': function () {
                        alert('saved!');
                    }
                };
                return next[condition]();
            }
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


    }
})();