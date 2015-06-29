(function () {
    angular.module('iNu')
        .controller('buildModelController', ['$scope', '$timeout', '$translate', buildModelController])
        .controller('createModelController', ['$scope', 'jsonMethodService', 'jsonParseService', '$timeout', 'SweetAlert', '$translate', 'URL','structFormat', '$anchorScroll', '$location',  createModelController])
        .controller('modelManagementController', ['$scope', 'jsonMethodService','$translate','$modal', modelManagementController])


    function buildModelController($scope, $timeout, $translate) {
        var self = this;
        //self.modelBroadcast = modelBroadcast;
        self.removeTab = removeTab;
        self.tabIndex = 0;
        self.tabs = [
            {title: 'createModel'},
            {title: 'matchedReview'},
            {title: 'modelManagement', active: true},
            {title: 'modules'}
        ]

        self.tabClicked = tabClicked;
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

        function tabClicked() {
            $scope.$broadcast('tabClicked');
        }
    }

    function createModelController($scope, jsonMethodService, jsonParseService, $timeout, SweetAlert, $translate, URL,structFormat, $anchorScroll, $location) {

        var modelGroupSelectedTimeout;
        var self = this;
        self.addModelGroup = addModelGroup;
        self.addTab = addTab;
        self.addToBuildSection = addToBuildSection;
        self.autoTips = autoTips;

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
        self.sections = [];
        self.sectionsClear = sectionsClear;
        self.sectionsDblclick = sectionsDblclick;
        self.showUndo = false;
        self.tabIndex = 0;
        self.toggleSelection = toggleSelection;
        self.undo = undo;

        setReuseModel();
        setModels();
        setModelSection();
        initialSetting();
        $scope.$on("$destroy", destroyListener);
        $scope.$on('tabClicked', tabClicked);
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
                    $location.hash('models' + inputValue);
                    $anchorScroll('models' + inputValue);
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
            self.keywordInputFocus = true;
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
                        $scope.$emit('addTab', {
                            title: 'createModel',
                            active: true,
                            addable: true,
                            tabName: self.saveAsName
                        });
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
            jsonMethodService.getJson('http://10.85.1.156:49154/_query/template').then(function (collectionjson) {
                var editLink = jsonParseService.getEditorLinkFromLinks(collectionjson.collection.links);
                jsonMethodService.getJson(editLink.href).then(function(collectionjson){
                    angular.forEach(collectionjson.collection.items,function(item){
                        angular.forEach(item.links,function(link){
                            if (link.rel === "section"){
                                jsonMethodService.getJson(link.href).then(function(collectionjson){
                                    link.items = collectionjson.collection.items;
                                    angular.forEach(link.items,function(item){
                                        item.itemInfo = structFormat.sectionItemFormat(item.data,"query","logic","distance","editable");
                                    })
                                })
                                self.sections.push(link);
                            }
                        })
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
        function sectionsClear(section) {
            self.showUndo = true;
        }
        function sectionsDblclick(item){
            alert("editable")
        }
        function tabClicked() {
            self.keywordInputFocus = false;
            $timeout(function () {
                self.keywordInputFocus = true;
            })
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

    function modelManagementController($scope, jsonMethodService, $translate,$modal) {
        var self = this;
        $scope.changeModelStatus = changeModelStatus;
        $scope.checkOnline = checkOnline;
        self.datasource = [];
        $scope.editModel = editModel;
        self.gridOptions = {
            columnDefs: [
                {
                    field: 'modelName',
                    displayName: '{{"modelName"|translate}}',
                    headerCellFilter: 'translate',
                    cellTemplate: '<button ng-click="grid.appScope.showModelDetail(row.entity)" class="btn btn-success btn-block">{{row.entity.modelName}}</button>'
                },
                {
                    field: 'role',
                    displayName: '{{"role"|translate}}',
                    headerCellFilter: 'translate'
                },
                {
                    field: 'creator',
                    displayName: '{{"creator"|translate}}',
                    headerCellFilter: 'translate'
                },
                {
                    field: 'lastModifiedTime',
                    displayName: '{{"lastModifiedTime"|translate}}',
                    headerCellFilter: 'translate'
                },
                {
                    field: 'lastModifiedBy',
                    displayName: '{{"lastModifiedBy"|translate}}',
                    headerCellFilter: 'translate'
                },
                {
                    field: 'status',
                    displayName: '{{"status"|translate}}',
                    headerCellFilter: 'translate'
                },
                {
                    name: '{{"management"|translate}}',
                    displayName: '{{"management"|translate}}',
                    headerCellFilter: 'translate',
                    cellTemplate: '<div class="model-management-grid">' +
                    '<a ng-click="grid.appScope.changeModelStatus(row.entity)">{{grid.appScope.checkOnline(row.entity.status)}}</a>' + //之後改成綁定後端給的狀態
                    '<a ng-click="grid.appScope.editModel(row.entity)">{{"edit"|translate}}</a>' +
                    '<a ng-click="grid.appScope.saveAsModel(row.entity)">{{"saveAs"|translate}}</a>' +
                    '</div>'
                }
            ],
            data: [
                {'modelName': 'Abc', 'role': 'A', 'status': 'online'},
                {'modelName': 'Def', 'role': 'B', 'status': 'offline'}

            ]
        };
        $scope.isModelOnline = false; //之後讀取API時需判斷此模型的上下線狀態
        $scope.saveAsModel = saveAsModel;
        self.selectedItems = [];
        $scope.showModelDetail=showModelDetail;
        setModels();


        function checkOnline(status) {

            var returnText = {
                'online': function () {
                    return $translate.instant('offline')
                },
                'offline': function () {
                    return $translate.instant('online')
                }
            };
            if (typeof returnText[status] !== 'function') {
                return 'no status';
            }
            return returnText[status]();
        }

        function changeModelStatus(entity) {
            var status = {
                'online': function () {
                    entity.status = 'offline';
                },
                'offline': function () {
                    entity.status = 'online';
                }
            };
            return status[entity.status]();


        }

        function editModel(entity) {
            $scope.$emit('addTab', {
                title: 'createModel',
                active: true,
                addable: true,
                tabName: entity.modelName
            });
        }
        function saveAsModel(entity){
            var modelInstance = $modal.open({
                backdropClass:'model-management-model-backdrop',
                controller:['$modalInstance',saveAsController],
                controllerAs:'saveAsCtrl',
                template:'<div ><span ng-click="saveAsCtrl.closeModal()" class="btn fa fa-remove fa-lg pull-right"></span>' +
                               '<model-instance datasource="saveAsCtrl.datasource" is-management="true" title="{{::saveAsCtrl.title}}"' +
                               '></model-instance>'+
                        '</div>',
                windowClass:'model-management-model-save'
            })
            function saveAsController($modalInstance){
                var self = this;
                self.title =$translate.instant('saveAsNewModel');
                jsonMethodService.getJson('json/models.json').then(
                    function (data) {
                        self.datasource = data;
                    });
                self.closeModal=closeModal;
                function closeModal(){
                    $modalInstance.close();
                }
            }
        }
        function setModels() {
            jsonMethodService.getJson('json/models.json').then(
                function (data) {
                    self.datasource = data;
                })
        }


        function showModelDetail(entity){
            var modelInstance = $modal.open({
                backdropClass:'model-management-model-backdrop',
                controller:['$modalInstance',showModelDetailController],
                controllerAs:'detailCtrl',
                template:'<div><span ng-click="detailCtrl.closeModal()" class="btn fa fa-remove fa-lg pull-right"></span><h1>'+entity.modelName+'</h1></div>',
                windowClass:'model-management-model-logic'

            })
            function showModelDetailController($modalInstance){
                var self = this;
                self.closeModal=closeModal;
                function closeModal(){
                    $modalInstance.close();
                }
            }
        }
    }
})();