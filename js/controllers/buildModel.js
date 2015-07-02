(function () {
    angular.module('iNu')
        .controller('buildModelController', ['$scope', '$timeout', '$translate', buildModelController])
        .controller('createModelController', ['$scope', 'jsonMethodService', 'jsonParseService', '$timeout', 'SweetAlert', '$translate', 'URL', 'structFormat', '$anchorScroll', '$location', createModelController])
        .controller('modelManagementController', ['$scope', 'jsonMethodService', 'jsonParseService', 'structFormat', '$translate', '$modal', '$timeout', modelManagementController])


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
        ]

        self.tabClicked = tabClicked;
        $scope.$on('addTab', function (event, tab) { //接收增加頁籤的廣播
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

    function createModelController($scope, jsonMethodService, jsonParseService, $timeout, SweetAlert, $translate, URL, structFormat, $anchorScroll, $location) {
        var modelGroupSelectedTimeout;
        var refreshTimeout;
        var self = this;
        self.addModelGroup = addModelGroup; //增加模型組
        self.addTab = addTab; //增加tab
        self.addToSectionFromSyntax = addToSectionFromSyntax;
        self.addToSectionFromComponent = addToSectionFromComponent;
        self.autoTips = autoTips;
        self.deleteModel = deleteModel;
        self.editBinding = {
            syntax: {
                syntaxIdentity: 'match'
            },
            component: {
                selected: []
            }
        };
        self.editCollection = {};
        self.isInstance = true;
        self.isRounded = isRounded;
        self.modelDatasource = {
            models: []
        };
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
        self.toggleSelection = toggleSelection;
        self.undo = undo;
        syntaxInitSetting();
        setModels();
        setTemplate('http://10.85.1.156:32772/_query/template');
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
                    URL.path = inputValue; //設定URL Service的path變數
                });

        }

        function addToSectionFromSyntax(syntaxIdentity) {
            angular.forEach(self.editCollection[syntaxIdentity].template.data, function (data) { //從template取出資料後，一一做綁定
                var name = data.name;
                if (name === 'query') data.value = self.editBinding.syntax[data.name].map(function (element) {
                    return element.text
                }).join(' ');
                else data.value = self.editBinding.syntax[data.name]
            })
            var template = {template: self.editCollection[syntaxIdentity].template};

            jsonMethodService.post(self.editCollection[syntaxIdentity].href, template).then(function (data) {
                var section = jsonParseService.findItemValueFromArray(self.sections, 'href', self.editBinding.syntax.occurrence);
                refreshModelSection(section, 1000);
                syntaxInitSetting();
            })
        }

        function addToSectionFromComponent() {
            var kvDatas = jsonParseService.getObjectMappingNameToValueFromDatas(self.editCollection.named.template.data, "name");

            angular.forEach(self.editBinding.component.selected, function (component) {
                $timeout(function () {
                    kvDatas.storedQueryTitle.value = component.name;
                    kvDatas.occurrence.value = self.editBinding.component.occurrence;
                    var template = {template: self.editCollection.named.template};
                    jsonMethodService.post(self.editCollection.named.href, template).then(function () {
                        component.checked = false;
                    }).then(function () {
                    })
                })
            })
            var section = jsonParseService.findItemValueFromArray(self.sections, 'href', self.editBinding.component.occurrence);
            refreshModelSection(section, 1000);
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

        function searchFromComponent(text){
            if (!text) text = '';
            var searchUrl = 'http://10.85.1.156:32772/_query/template/search?q=' + text
            jsonMethodService.get(searchUrl).then(function(collectionjson){
                setItemsBinding(collectionjson.collection.items);
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
            }).then(function (data) {
            })
        }

        function sectionsDblclick(item) {
            alert("editable")
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

        function syntaxInitSetting() {
            if (URL.path) {
                self.editBinding.query.push({text: URL.path});
                console.log(JSON.stringify(self.keywords))
            }
            self.editBinding.syntax.syntaxIdentity = 'match';
            self.editBinding.syntax.query = [];
            self.syntaxInputFocus = true;
        }

        function refreshModelSection(section, millisecond, callback) {
            refreshTimeout = $timeout(function () {
                jsonMethodService.get(section.href).then(function (collectionjson) {
                    section.items = collectionjson.collection.items;
                    angular.forEach(section.items, function (item) {
                        item.itemInfo = structFormat.sectionItemFormat(item.data, 'query', 'logic', 'distance', 'editable');
                    })
                    if (typeof callback === 'function') callback();
                })
            }, millisecond)
        }

        function setEditBinding(bindGroup, datas) {
            angular.forEach(datas, function (data) {
                if (data.name == 'query') {
                    self.editBinding[bindGroup].query = data.value.split('\\s');
                } else {
                    self.editBinding[bindGroup][data.name] = data.value;
                }
            })
        }

        function setEditTemporary(editLinks) {
            angular.forEach(editLinks, function (editlink) {
                jsonMethodService.get(editlink.href).then(function (collectionjson) {
                    var syntaxIdentity = editlink.href.match(/(match|near|named)/g)[0];
                    var bindGroup;
                    if (!syntaxIdentity) return;
                    if (['match', 'near'].indexOf(syntaxIdentity) != -1) bindGroup = 'syntax';
                    else if (syntaxIdentity == 'named') bindGroup = 'component';
                    setEditBinding(bindGroup, collectionjson.collection.template.data);
                    self.editCollection[syntaxIdentity] = collectionjson.collection;
                })
            })
        }

        function setItemsBinding(items) {
            angular.forEach(items, function (item) {
                angular.forEach(item.data, function (data) {
                    item[data.name] = data.value;
                })
                delete item['data'];
            })
            self.editBinding.component.items = items;
            self.editBinding.component.selected = [];
        }

        function setModels() {
            jsonMethodService.get('json/models.json').then(
                function (data) {
                    self.modelDatasource.models = data;
                })
        }


        function setModelSections() {
            angular.forEach(self.sections, function (section) {
                refreshModelSection(section)
            })
        }

        function setTemplate(href) { //由_query/template取得樣板或剛模型 section 與 edit的template
            jsonMethodService.get(href).then(function (collectionjson) {
                var editLink = jsonParseService.getEditorLinkFromLinks(collectionjson.collection.links); //取得edit的href
                jsonMethodService.get(editLink.href).then(function (collectionjson) {
                    angular.forEach(collectionjson.collection.items, function (item) {
                        var linksObj = jsonParseService.getLinksObjFromLinks(item.links,'rel'); //將items裡面的links用rel分類
                        var editLinks = linksObj['edit'];//用來顯示查詢條件的(must must_not should)
                        self.sections = linksObj['section'];//用來增加查詢條件的(match near named)
                        setModelSections();//設定如何顯示三個條件裡面的資料
                        setEditTemporary(editLinks);//設定binding的資料是詞區還是公用組件
                    })
                })
                setItemsBinding(collectionjson.collection.items);//公用組件列表
            })
        }

        function tabClicked() {
            self.syntaxInputFocus = false;
            $timeout(function () {
                self.syntaxInputFocus = true;
            })
        }
    }

    function modelManagementController($scope, jsonMethodService, jsonParseService, structFormat, $translate, $modal, $timeout) {

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
            ]
        };
        $scope.isModelOnline = false; //之後讀取API時需判斷此模型的上下線狀態

        $scope.saveAsModel = saveAsModel;
        self.selectedItems = [];
        $scope.showModelDetail = showModelDetail;
        setModels();


        function checkOnline(status) { //顯示管理欄位裡面是上線或下線

            var returnText = {
                'online': function () { //如果是上線，管理欄位裡面要顯示下線
                    return $translate.instant('offline')
                },
                'offline': function () { //如果是下線，管理欄位裡面要顯示上線
                    return $translate.instant('online')
                }
            };
            if (typeof returnText[status] !== 'function') { //如果不再上列的狀態
                return 'no status';
            }
            return returnText[status]();
        }

        function changeModelStatus(entity) { //變更上下線，可直接變更該一列的資料
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

        function editModel(entity) { //另開頁籤編輯模型
            $scope.$emit('addTab', {
                title: 'createModel',
                active: true,
                addable: true,
                tabName: entity.modelName
            });
        }

        function filterModel() {
            self.gridOptions.data = [
                {'modelName': 'Abc', 'role': 'A', 'status': 'online'},
                {'modelName': 'Def', 'role': 'B', 'status': 'offline'}
            ]
        }

        function saveAsModel(entity) { //打開modal另存模型
            var modelInstance = $modal.open({
                backdropClass: 'model-management-model-backdrop', //打開modal後背景的CSS
                controller: ['$modalInstance', '$timeout', saveAsController],
                controllerAs: 'saveAsCtrl',
                size: 'sm',
                template: '<div class="ibox"><div class="ibox-content"><span ng-click="saveAsCtrl.closeModal()" class="btn text-danger fa fa-remove fa-lg pull-right"></span>' +
                    '<model-instance datasource="saveAsCtrl.datasource"  is-management="true"  selected-eventhandler="saveAsCtrl.modelGroupsSelectedHandler" ' +
                    'title="{{::saveAsCtrl.title}}" save-model="saveAsCtrl.saveModel"' +
                    '></model-instance>' +
                    '</div></div>',
                windowClass: 'model-management-model-save' //modal頁的CSS
            })

            function saveAsController($modalInstance, $timeout) {
                var modelGroupSelectedTimeout;
                var self = this;
                self.modelGroupsSelectedHandler = modelGroupsSelectedHandler;
                self.saveModel = saveModel;
                self.title = $translate.instant('saveAsNewModel');
                jsonMethodService.get('json/models.json').then(
                    function (data) {
                        self.datasource = data;
                    });
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
                    alert(type)
                }
            }
        }


        function showModelDetail(entity) { //打開modal顯示模型邏輯詞曲
            var modelInstance = $modal.open({
                backdropClass: 'model-management-model-backdrop',
                controller: ['$modalInstance', showModelDetailController],
                controllerAs: 'detailCtrl',
                template: '<div><span ng-click="detailCtrl.closeModal()" class="btn text-danger fa fa-remove fa-lg pull-right"></span>' +
                    '<build-section datasource="detailCtrl.sections" items-property="{{::detailCtrl.itemProperty}}"' +
                    'item-editable-property="{{::detailCtrl.itemInfoEditable}}">' +
                    '<item-template>{{item.itemInfo.query}}&nbsp;{{item.itemInfo.logic}}&nbsp;{{item.itemInfo.distance}}</item-template>' +
                    '</build-section> ' +
                    '</div>',
                windowClass: 'model-management-model-logic'

            })

            function showModelDetailController($modalInstance) {
                var self = this;
                self.closeModal = closeModal;
                self.itemProperty = 'items';
                self.itemInfoEditable = 'itemInfo.editable';
                self.sections = [];
                setTemplate('http://10.85.1.156:32772/_query/template');

                function closeModal() {
                    $modalInstance.close();
                }

                function setTemplate(href) {
                    jsonMethodService.get(href).then(function (collectionjson) {
                        var editLink = jsonParseService.getEditorLinkFromLinks(collectionjson.collection.links);
                        jsonMethodService.get(editLink.href).then(function (collection) {
                            angular.forEach(collection.collection.items, function (item) {
                                var linksObj = jsonParseService.getLinksObjFromLinks(item.links);
                                self.sections = linksObj['section'];
                                setModelSections();
                            })
                        })
                    })
                }

                function refreshModelSection(section, millisecond, callback) {
                    refreshTimeout = $timeout(function () {
                        jsonMethodService.get(section.href).then(function (collectionjson) {
                            section.items = collectionjson.collection.items;
                            angular.forEach(section.items, function (item) {
                                item.itemInfo = structFormat.sectionItemFormat(item.data, 'query', 'logic', 'distance', 'editable');
                            })
                            if (typeof callback === 'function') callback();
                        })
                    }, millisecond)
                }

                function setModelSections() {
                    angular.forEach(self.sections, function (section) {
                        refreshModelSection(section)
                    })
                }
            }
        }

/////////////////////////////////////////不綁定區//////////////////////////////////
        function setModels() {
            jsonMethodService.get('json/models.json').then(
                function (data) {
                    self.datasource = data;
                })
        }


    }
})();