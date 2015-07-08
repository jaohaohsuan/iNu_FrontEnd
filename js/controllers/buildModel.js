(function () {
    angular.module('iNu')
        .controller('buildModelController', ['$scope', '$timeout', '$translate', buildModelController])
        .controller('createModelController', ['$scope', 'jsonMethodService', 'jsonParseService', '$timeout', 'SweetAlert', '$translate', 'templateLocation', 'buildModelService', '$anchorScroll', '$location', createModelController])
        .controller('matchedReviewedController', ['$scope', 'jsonMethodService', 'jsonParseService', '$modal','buildModelService', matchedReviewedController])
        .controller('modelManagementController', ['$scope', 'jsonMethodService', 'jsonParseService', 'buildModelService', 'templateLocation', '$translate', '$modal', '$timeout', modelManagementController])


    function buildModelController($scope, $timeout, $translate) {
        var self = this;
        //self.modelBroadcast = modelBroadcast;
        self.removeTab = removeTab;
        self.tabIndex = 0;
        self.tabs = [ //頁籤標題
            {title: 'createModel', active: true},
            {title: 'matchedReview'},
            {title: 'modelManagement'},
            {title: 'modules'}
        ];

        self.tabClicked = tabClicked;
        $scope.$on('addTab', function (event, tab) { //接收增加頁籤的廣播
            self.tabs.splice(self.tabIndex + 1, 0, tab);
            self.tabIndex++;
        });

        function removeTab(tab) {
            $timeout(function () { //刪除tab 不知為何需要用timeout才不會讓網址跑掉
                self.tabIndex--;
                self.tabs.splice(self.tabs.indexOf(tab), 1);
                if (self.tabIndex === 0) {
                    self.tabs[self.tabIndex].active = true;
                }
            }, 0);
        }

        function tabClicked() {
            $scope.$broadcast('tabClicked');
        }
    }

    function createModelController($scope, jsonMethodService, jsonParseService, $timeout, SweetAlert, $translate, templateLocation, buildModelService, $anchorScroll, $location) {
        var modelGroupSelectedTimeout;
        var templateUrl = 'http://10.85.1.156:32772/_query/template';
        var self = this;
        self.addModelGroup = addModelGroup; //增加模型組
        self.addTab = addTab; //增加tab
        self.addToSectionFromSyntax = addToSectionFromSyntax;
        self.addToSectionFromComponent = addToSectionFromComponent;
        self.autoTips = autoTips;
        self.deleteModel = deleteModel;
        self.editBinding = {
            syntax: {
                syntaxIdentity: 'match',
                focus: true
            },
            component: {
                selected: []
            },
            configuration: {
                title: '',
                tags: []
            },
            expansion: {
                title: ''
            }
        };
        self.editCollection = {
            match: {},
            near: {},
            named: {}
        };
        self.enabledModel = enabledModel;
        self.isInstance = false;
        self.isRounded = isRounded;
        self.modelGroupsSelectedHandler = modelGroupsSelectedHandler;
        self.nextToDo = nextToDo;
        self.renameModel = renameModel;
        self.roles = [
            {'name': '角色：全部', 'content': 'ALL'},
            {'name': '角色：A', 'content': 'A'},
            {'name': '角色：B', 'content': 'B'}
        ];
        self.saveAs = saveAs;
        self.saveAsName = '';
        self.searchFromComponent = searchFromComponent;
        self.sections = [];
        self.sectionsClear = sectionsClear;
        self.sectionsDblclick = sectionsDblclick;
        self.showUndo = false;
        self.tabIndex = 0;
        self.temporaryCollection = {
            collection: {}
        };
        self.toggleSelection = toggleSelection;
        self.undo = undo;
        initial(templateLocation.path, templateUrl);
        $scope.$on('$destroy', destroyListener);
        $scope.$on('tabClicked', tabClicked);
        function addModelGroup() {
            SweetAlert.swal({
                    title: $translate.instant('newModelsName'), //讀取多語系key
                    type: 'input',
                    showCancelButton: true,
                    inputPlaceholder: $translate.instant('newModelsName'),
                    confirmButtonColor: '#1C84C6',
                    confirmButtonText: $translate.instant('sure'),
                    cancelButtonText: $translate.instant('cancel'),
                    closeOnConfirm: false,
                    closeOnCancel: true,
                    animation: false
                },
                function (inputValue) {
                    if (inputValue === false) return false;
                    if (inputValue === '' || !inputValue.trim().length) {
                        swal.showInputError('You need to write something!');
                        return false
                    }
                    swal('Nice!', 'You wrote: ' + inputValue, 'success');
                    self.modelDatasource.models.push({
                        'name': inputValue
                    })
                    $location.hash('models' + inputValue);
                    $anchorScroll('models' + inputValue);
                });


        }

        function addTab() {
            SweetAlert.swal({
                    title: $translate.instant('newComponentName'), //讀取多語系key
                    type: 'input',
                    showCancelButton: true,
                    inputPlaceholder: $translate.instant('newComponentName'),
                    confirmButtonColor: '#1C84C6',
                    confirmButtonText: $translate.instant('sure'),
                    cancelButtonText: $translate.instant('cancel'),
                    closeOnConfirm: false,
                    closeOnCancel: true,
                    animation: false
                },
                function (inputValue) {
                    if (inputValue === false) return false;
                    if (inputValue === '' || !inputValue.trim().length) {
                        swal.showInputError('You need to write something!');
                        return false
                    }
                    swal({
                        title: 'Nice!',
                        text: 'You wrote: ' + inputValue,
                        timer: 1000,
                        type: 'success',
                        showConfirmButton: false
                    });
                    $scope.$emit('addTab', {title: 'createModel', active: true, addable: true, tabName: inputValue});
                    templateLocation.path = inputValue; //設定URL Service的path變數
                });

        }

        function addToSectionFromSyntax(syntaxIdentity) {
            angular.forEach(self.editCollection[syntaxIdentity].template.data, function (data) { //從template取出資料後，一一做綁定
                if (data.name === 'query') data.value = self.editBinding.syntax[data.name].map(function (element) {
                    return element.text
                }).join(' ');
                else data.value = self.editBinding.syntax[data.name]
            })
            var href = self.editCollection[syntaxIdentity].href;
            var template = {template: angular.copy(self.editCollection[syntaxIdentity].template)};
            var occurrence = self.editBinding.syntax.occurrence;
            var successCallback = function () {
                syntaxInputClear();
            }
            buildModelService.addToCurrentSection(href, template, self.sections, occurrence, successCallback);
        }

        function addToSectionFromComponent() {
            var kvDatas = jsonParseService.getObjectMappingNameToValueFromDatas(self.editCollection.named.template.data, "name");
            kvDatas.occurrence.value = self.editBinding.component.occurrence;
            angular.forEach(self.editBinding.component.selected, function (component) {
                $timeout(function () {
                    var id = component.href.substr(component.href.lastIndexOf('/') + 1);
                    kvDatas.storedQueryId.value = id;
                    kvDatas.storedQueryTitle.value = component.title;
                    var template = {template: angular.copy(self.editCollection.named.template)};
                    var href = self.editCollection.named.href;
                    var occurrence = self.editBinding.component.occurrence;
                    var successCallback = function () {
                        component.checked = false;
                    }
                    buildModelService.addToCurrentSection(href, template, self.sections, occurrence, successCallback);
                })
            })

            self.editBinding.component.selected = [];
        }

        function autoTips(query) {
            var t = {
                'i': ['ibon', 'ipad', 'iphone1', 'iphone2'],
                'ib': ['ibon'],
                'ibo': ['ibon'],
                'ibon': ['ibon'],
                'ip': ['ipad', 'iphone1', 'iphone2'],
                'ipa': ['ipad'],
                'iph': ['iphone1', 'iphone2'],
                'ipad': ['ipad'],
                'ipho': ['iphone1', 'iphone2'],
                'iphon': ['iphone1', 'iphone2'],
                'iphone': ['iphone1', 'iphone2'],
                'iphone1': ['iphone1'],
                'iphone2': ['iphone2'],
                '不': ['不賠', '不會'],
                '不賠': ['不賠'],
                '不會': ['不會']

            }
            return t[query];
        }

        function deleteModel() {
            SweetAlert.swal({
                    title: $translate.instant('sureDelete'), //讀取多語系key
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#DD6B55',
                    confirmButtonText: $translate.instant('sure'),
                    cancelButtonText: $translate.instant('cancel'),
                    closeOnConfirm: false,
                    closeOnCancel: true
                },
                function (isConfirm) {
                    if (isConfirm) {
                        SweetAlert.swal('deleted', '', 'success');
                    }

                });
        }

        function enabledModel() {

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
            SweetAlert.swal('renamed', '', 'success');
        }


        function saveAs(condition) {
            if (self.editBinding.expansion.title.length <= 0) return;
            else {
                var next = {
                    'edit': function () {
                        buildModelService.saveAs(self.temporaryCollection.collection, self.editBinding.expansion.title, self.editBinding.configuration.tags, function (location) {
                            $timeout(function () {
                                $scope.$emit('addTab', {
                                    title: 'createModel',
                                    active: true,
                                    addable: true,
                                    tabName: self.editBinding.expansion.title
                                });
                            }, 1000)
                            templateLocation.path = location;
                        })
                    },
                    'online': function () {
                        alert('online!')
                    },
                    'save': function () {
                        buildModelService.saveAs(self.temporaryCollection.collection, self.editBinding.expansion.title, self.editBinding.configuration.tags, function (location) {
                            swal(
                                {   title: 'Success',timer: 1000, type: 'success',showConfirmButton: false }
                            );
                        })
                    }
                };
                return next[condition]();
            }
        }

        function searchFromComponent(text) {
            if (!text) text = '';
            var searchUrl = 'http://10.85.1.156:32772/_query/template/search?q=' + text
            jsonMethodService.get(searchUrl).then(function (collectionjson) {
                angular.forEach(collectionjson.collection.items, function (item) {
                    angular.forEach(item.data, function (data) {
                        item[data.name] = data.value;
                    })
                    delete item.data;
                })
                self.editBinding.component.items = collectionjson.collection.items;
                self.editBinding.component.selected = [];
            })
        }

        function sectionsClear(section, item) {
            var itemHref = item.href;
            jsonMethodService.DELETE(itemHref).then(function (data) {
                if (section == item) section.items.length = 0;
                else {
                    var idx = section.items.indexOf(item);
                    section.items.splice(idx, 1);
                }
            }, function (data) {
            })
        }

        function sectionsDblclick(item) {
            alert('editable');
        }


        function toggleSelection(selectedItems, item) {
            var idx = selectedItems.indexOf(item);
            if (idx != -1) selectedItems.splice(idx, 1);
            else selectedItems.push(item);
        }

        function undo() {
            self.showUndo = false;
        }

//////////////////不綁定區//////////////////
        function destroyListener(event) {
            $timeout.cancel(modelGroupSelectedTimeout);
        }

        function initial(locationUrl, templateUrl) {
            if (!locationUrl)//location不存在代表為首頁template
            {
                buildModelService.setTemplate(templateUrl, self.temporaryCollection,self.sections, self.editCollection, self.editBinding);

            } else {//設定Temporary
                buildModelService.setTemporary(locationUrl,self.temporaryCollection,self.sections, self.editCollection, self.editBinding);
                self.isInstance = true;

            }
            searchFromComponent();
        }

        function syntaxInputClear() {
            self.editBinding.syntax.syntaxIdentity = 'match';
            self.editBinding.syntax.query = [];
            self.editBinding.syntax.focus = true;
        }

        function tabClicked() {
            self.editBinding.syntax.focus = false;
            $timeout(function () {
                self.editBinding.syntax.focus = true;
            })
        }
    }

    function matchedReviewedController($scope, jsonMethodService, jsonParseService, $modal,buildModelService) {
        var self = this;
        self.buildSections=[];
        self.modelTitle=''; //顯示模型邏輯詞區的title
        self.datasource = [];
        self.dropdownAutoSize = false;
        self.filterModelGroup = filterModelGroup;
        self.gridOptions = {
            columnDefs: [
                {
                    name: 'test'
                }
            ]
        };
        self.isShowModelDetail=false
        self.modelKeyword = '';
        self.models = [];
        self.selectedItems = [];
        self.showModelDetail = showModelDetail;
        $scope.$on('minimalizaSidebar', setInputSize);
        setModels();
        function filterModelGroup(selectedItems,text) {
           if (!text) text = '';
            var searchUrl = 'http://10.85.1.156:32772/_query/template/search?q=' + text
            jsonMethodService.get(searchUrl).then(function (collectionjson) {
                angular.forEach(collectionjson.collection.items, function (item) {
                    angular.forEach(item.data, function (data) {
                        item[data.name] = data.value;
                    })
                    delete item.data;
                })
                self.models = collectionjson.collection.items;
            })
        }

        function showModelDetail(entity) {
            if(self.buildSections.length>0) self.buildSections.length=0;
            buildModelService.setTemporary(entity.href,null, self.buildSections);
            self.isShowModelDetail=true;
            self.modelTitle=entity.title;
        }

        ////////////////////不綁定區//////////////

        function setModels() {
            jsonMethodService.get('json/models.json').then(
                function (data) {
                    self.datasource = data;
                })
        }


        function setInputSize() {
            var parentWidth = $('input.matched-review-keyword-text').parent().innerWidth();
            console.log(parentWidth)
            console.log($('input.matched-review-keyword-text').innerWidth())
            //$('input.matched-review-keyword-text').innerWidth(parentWidth)
        }
    }

    function modelManagementController($scope, jsonMethodService, jsonParseService, buildModelService, templateLocation, $translate, $modal, $timeout) {

        var self = this;
        $scope.changeModelStatus = changeModelStatus; //使用$scope綁定grid裡面
        $scope.checkOnline = checkOnline;
        self.datasource = [];
        $scope.editModel = editModel;
        self.filterModel = filterModel;
        self.gridOptions = {
            columnDefs: [
                {

                    field: 'modelName',
                    displayName: '{{"modelName"|translate}}',
                    headerCellClass: 'model-management-grid-header',
                    headerCellFilter: 'translate',
                    cellTemplate: '<a ng-click="grid.appScope.showModelDetail(row.entity)" class="btn  btn-block">{{row.entity.modelName}}</a>',
                    enableColumnMenu: false,
                    enableHiding: false
                },
                {

                    field: 'role',
                    displayName: '{{"role"|translate}}',
                    headerCellFilter: 'translate',
                    headerCellClass: 'model-management-grid-header',
                    enableColumnMenu: false
                },
                {

                    field: 'creator',
                    displayName: '{{"creator"|translate}}',
                    headerCellFilter: 'translate',
                    headerCellClass: 'model-management-grid-header',
                    enableColumnMenu: false
                },
                {

                    field: 'lastModifiedTime',
                    displayName: '{{"lastModifiedTime"|translate}}',
                    headerCellFilter: 'translate',
                    headerCellClass: 'model-management-grid-header',
                    enableColumnMenu: false
                },
                {

                    field: 'lastModifiedBy',
                    displayName: '{{"lastModifiedBy"|translate}}',
                    headerCellFilter: 'translate',
                    headerCellClass: 'model-management-grid-header',
                    enableColumnMenu: false
                },
                {

                    field: 'status',
                    displayName: '{{"status"|translate}}',
                    headerCellFilter: 'translate',
                    headerCellClass: 'model-management-grid-header',
                    cellTemplate: '   <div class="switch"><div class="onoffswitch"><input disabled type="checkbox" ng-checked="row.entity.enabled" class="onoffswitch-checkbox" ><label style="cursor: default" class="onoffswitch-label"><span class="onoffswitch-inner"></span></label></div></div>',
                    enableColumnMenu: false,
                    enableSorting: false
                },
                {

                    name: '{{"management"|translate}}',
                    displayName: '{{"management"|translate}}',
                    enableHiding: false,
                    enableColumnMenu: false,
                    enableSorting: false,
                    headerCellFilter: 'translate',
                    headerCellClass: 'model-management-grid-header',
                    cellTemplate: '<div class="model-management-grid">' +
                        '<a ng-click="grid.appScope.changeModelStatus(row.entity)">{{grid.appScope.checkOnline(row.entity)}}</a>' + //之後改成綁定後端給的狀態
                        '<a ng-click="grid.appScope.editModel(row.entity)">{{"edit"|translate}}</a>' +
                        '<a ng-click="grid.appScope.saveAsModel(row.entity)">{{"saveAs"|translate}}</a>' +
                        '</div>',
                    minWidth: 120
                }
            ],
            exporterMenuPdf: false,
            enableGridMenu: true,
            gridMenuTitleFilter: translateCol,
            paginationPageSize: 8,
            paginationPageSizes: [8, 20, 30]
        };
        $scope.isModelOnline = false; //之後讀取API時需判斷此模型的上下線狀態
        $scope.onlineClass = 'online';
        $scope.offlineClass = 'offline';
        $scope.saveAsModel = saveAsModel;
        self.selectedItems = [];
        $scope.showModelDetail = showModelDetail;
        setModels();


        function checkOnline(entity) { //顯示管理欄位裡面是上線或下線
            var returnText = {
                'online': function () { //如果是上線，管理欄位裡面要顯示下線
                    return $translate.instant('offline');
                },
                'offline': function () { //如果是下線，管理欄位裡面要顯示上線
                    return $translate.instant('online');
                }
            };
            var status = entity.enabled === true ? "online" : "offline";
            if (typeof returnText[status] !== 'function') { //如果不再上列的狀態
                return 'no status';
            }
            return returnText[status]();
        }

        function changeModelStatus(entity) { //變更上下線，可直接變更該一列的資料
            var returnText = {
                'online': function () {
                    entity.enabled = false;
                    //do API
                },
                'offline': function () {
                    entity.enabled = true;
                    //do API
                }
            };
            var status = entity.enabled === true ? "online" : "offline";
            return returnText[status]();
        }


        function editModel(entity) { //另開頁籤編輯模型
            $scope.$emit('addTab', {
                title: 'createModel',
                active: true,
                addable: true,
                tabName: entity.modelName
            });
            templateLocation.path = entity.href;
        }

        function filterModel(selectedItems, modelKeyword) {
            console.log(selectedItems)
            if (self.gridOptions.data)  self.gridOptions.data.length = 0;
            if(!modelKeyword) modelKeyword='';
            var searchUrl = 'http://10.85.1.156:32772/_query/template/search?q=' + modelKeyword;
            jsonMethodService.get(searchUrl).then(function (collectionjson) {
                if (collectionjson.collection.items) {
                    angular.forEach(collectionjson.collection.items, function (item) {
                        var data = setGridData(item);
                        self.gridOptions.data.push(data);
                    })
                }
            })
        }

        function saveAsModel(entity) { //打開modal另存模型
            var modelInstance = $modal.open({
                backdropClass: 'model-management-model-backdrop', //打開modal後背景的CSS
                controller: ['$modalInstance', '$timeout', saveAsController],
                controllerAs: 'saveAsCtrl',
                size: 'sm',
                templateUrl: 'views/buildModel_modelManagement_saveAsModel_modal.html',
                windowClass: 'model-management-modal-save' //modal頁的CSS
            })

            function saveAsController($modalInstance, $timeout) {
                var modelGroupSelectedTimeout;
                var self = this;
                self.modelGroupsSelectedHandler = modelGroupsSelectedHandler;
                self.saveModel = saveModel;
                self.title = $translate.instant('saveAsNewModel')
                self.editBinding = {
                    configuration: {
                        title: '',
                        tags: []
                    }
                };
                self.temporaryCollection = {
                    collection: {}
                }
                buildModelService.setTemporary(entity.href,self.temporaryCollection, null, null, self.editBinding);

                self.closeModal = closeModal;
                function closeModal() {
                    $modalInstance.close();
                }

                function modelGroupsSelectedHandler(selectedModelGroups) {
                    if (modelGroupSelectedTimeout) $timeout.cancel(modelGroupSelectedTimeout);
                    modelGroupSelectedTimeout = $timeout(function () {
                        console.log(selectedModelGroups)
                    }, 1000); // delay 1000 ms
                }

                function saveModel(type) {
                    buildModelService.saveAs(self.temporaryCollection.collection, self.editBinding.configuration.title, self.editBinding.configuration.tags, function (location) {
                        swal(
                            {   title: "Success",timer: 1000, type: 'success',showConfirmButton: false }
                        );
                        $modalInstance.close();
                    })
                }
            }
        }


        function showModelDetail(entity) { //打開modal顯示模型邏輯詞曲
            var modelInstance = $modal.open({
                backdropClass: 'model-management-model-backdrop',
                controller: ['$modalInstance','title', showModelDetailController],
                controllerAs: 'detailCtrl',
                templateUrl: 'views/buildModel_modelManagement_modelDetailModal.html',
                windowClass: 'model-management-modal-logic',
                resolve:{
                    title:function(){
                        return entity.modelName;
                    }
                }
            });

            function showModelDetailController($modalInstance,title) {
                var self = this;
                self.closeModal = closeModal;
                self.titlePrpperty = 'name';
                self.itemProperty = 'items';
                self.itemInfoEditable = 'itemInfo.editable';
                self.sections = [];
                self.title =title;
                buildModelService.setTemporary(entity.href,null, self.sections);
                function closeModal() {
                    $modalInstance.close();
                }
            }
        }

/////////////////////////////////////////不綁定區//////////////////////////////////

        function setGridData(items) {

            var datas = jsonParseService.getObjectMappingNameToValueFromDatas(items.data, 'name')
            var href = items.href;
            var status = $translate.instant(datas.status.value);
            var title = datas.title.value;
            var enabled = (datas.status.value === 'enabled' ? true : false)
            var gridDatas = {'href': href, 'modelName': title, 'role': 'A', 'status': status, 'enabled': enabled}
            return gridDatas;
        }

        function setModels() {
            jsonMethodService.get('json/models.json').then(
                function (data) {
                    self.datasource = data;
                })
        }

        function translateCol(title) {
            return $translate.instant(title)
        }

    }
})();