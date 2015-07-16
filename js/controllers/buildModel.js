(function () {
    angular.module('iNu')
        .controller('buildModelController', ['$scope', '$timeout', '$translate', buildModelController])
        .controller('createModelController', ['$scope', 'jsonMethodService', 'jsonParseService', '$timeout', 'SweetAlert', '$translate', 'templateLocation', 'buildModelService', 'API_PATH', createModelController])
        .controller('matchedReviewedController', ['$scope', 'jsonMethodService', 'jsonParseService', '$modal', 'buildModelService', 'API_PATH', matchedReviewedController])
        .controller('modelManagementController', ['$scope', 'jsonMethodService', 'jsonParseService', 'buildModelService', 'templateLocation', '$translate', '$modal', '$timeout', 'SweetAlert', 'API_PATH', modelManagementController])


    function buildModelController($scope, $timeout, $translate) {
        var self = this;
        //self.modelBroadcast = modelBroadcast;

        self.removeTab = removeTab;
        self.pagingIndex = 0;
        self.tabIndex = 0;
        self.tabs = [ //頁籤標題
            {title: 'createModel', active: true},
            {title: 'matchedReview'},
            {title: 'modelManagement'},
            {title: 'modules'}
        ];
        self.tabClicked = tabClicked;
        $scope.$on('addTab', addTab);
        $scope.$on('changeTabName', changeTabName);

        function addTab(event, tab) { //接收增加頁籤的廣播
            if (tab) {
                self.tabs.splice(++self.pagingIndex, 0, tab);
                self.tabIndex = self.pagingIndex;
            }
        }

        function changeTabName(event, title) {
            if (title) {
                self.tabs[self.tabIndex].tabName = title;
            }
        }

        function removeTab(tab) {
            $timeout(function () { //刪除tab 不知為何需要用timeout才不會讓網址跑掉
                self.pagingIndex--;
                self.tabs.splice(self.tabs.indexOf(tab), 1);
                if (self.pagingIndex === 0) {
                    self.tabs[self.pagingIndex].active = true;
                }
                self.tabIndex = self.pagingIndex;
            }, 0);
        }

        function tabClicked(tab) {
            var index = self.tabs.indexOf(tab);
            self.tabIndex = index;
            $scope.$broadcast('tabClicked');
        }
    }

    function createModelController($scope, jsonMethodService, jsonParseService, $timeout, SweetAlert, $translate, templateLocation, buildModelService, API_PATH) {
        var modelGroupSelectedTimeout;
        var templateUrl = API_PATH + '_query/template';
        var self = this;

        self.addTags = addTags; //增加模型組
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
        self.filterModelGroup = filterModelGroup;
        self.isInstance = false;
        self.isRounded = isRounded;
        self.modelInstanceSelected = modelInstanceSelected;
        self.nextToDo = nextToDo;
        self.queriesCollection = {
            queries: []
        };
        self.queriesBinding = {
            search: {}
        };
        self.resetTitle = resetTitle;
        self.roles = [
            {'name': '角色：全部', 'content': 'ALL'},
            {'name': '角色：A', 'content': 'A'},
            {'name': '角色：B', 'content': 'B'}
        ];
        self.saveConfiguration = saveConfiguration;
        self.saveAs = saveAs;
        self.saveAsName = '';
        self.sections = [];
        self.sectionsClear = sectionsClear;
        self.sectionsDblclick = sectionsDblclick;
        self.selectedNestingItems = [];
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
        function addTags(successCallback) {
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
                    self.editBinding.configuration.tags.push({
                        name: inputValue,
                        selected: true
                    })
                    buildModelService.saveConfiguration(self.temporaryCollection, self.editBinding.configuration, function () {
                        swal('Nice!', 'You wrote: ' + inputValue, 'success');
                        self.queriesBinding.search.tags = angular.copy(self.editBinding.configuration.tags);
                        self.queriesBinding.search.tags = self.queriesBinding.search.tags.map(function (tag) {
                            return {name: tag.name}
                        })
                        if (successCallback) successCallback();
                    })
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

        function enabledModel(data) {
            var title = data.isOnline ? $translate.instant('onlineModel') : $translate.instant('offlineModel');
            SweetAlert.swal({
                title: title,
                type: 'info',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: $translate.instant('sure'),
                cancelButtonText: $translate.instant('cancel'),
                closeOnConfirm: true,
                closeOnCancel: true,
                customClass: 'sweetAlert'
            }, function (sure) {
                if (!sure) {
                    data.isOnline = !data.isOnline;
                    console.log(data)
                }
                else {
                    console.log(data)
                }
            });
        }

        function filterModelGroup(queriesBinding) {//需修改
            buildModelService.searchByQueries(self.queriesCollection, queriesBinding, 'search', function (items) {
                self.editBinding.component.items = items;
                self.editBinding.component.selected = [];
            })
        }

        function isRounded() {
            return window.innerWidth < 768
        }

        function modelInstanceSelected(configuration) {
            if (!self.isInstance) buildModelService.saveConfiguration(self.temporaryCollection, configuration);
        }

        function nextToDo() {
            self.nextView = true;
            self.saveAsNameInputFocus = true;
        }

        function resetTitle(e) { //讓input內容恢復binding的資料
            if (e.keyCode === 27) {
                $scope.nextView.modelTile.$rollbackViewValue(); //formName.inputName
            }
        };
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
                                {title: 'Success', timer: 1000, type: 'success', showConfirmButton: false}
                            );
                        })
                    }
                };
                return next[condition]();
            }
        }

        function saveConfiguration(configuration) {
            buildModelService.saveConfiguration(self.temporaryCollection, configuration, function () {
                $scope.$emit('changeTabName', configuration.title);
                SweetAlert.swal('saved', '', 'success');
            });

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
            buildModelService.setQueriesBinding(templateUrl + '/search', self.queriesCollection, self.queriesBinding, function () {
                self.editBinding.configuration.allTags = angular.copy(self.queriesBinding.search.tags);
                if (!locationUrl)//location不存在代表為首頁template
                {
                    buildModelService.setTemplate(templateUrl, self.temporaryCollection, self.sections, self.editCollection, self.editBinding);

                } else {//設定Temporary
                    buildModelService.setTemporary(locationUrl, self.temporaryCollection, self.sections, self.editCollection, self.editBinding);
                    self.isInstance = true;

                }
                buildModelService.searchByQueries(self.queriesCollection, self.queriesBinding.search, 'search', function (items) {
                    self.editBinding.component.items = items;
                    self.editBinding.component.selected = [];
                })
            });
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

    function matchedReviewedController($scope, jsonMethodService, jsonParseService, $modal, buildModelService, API_PATH) {

        var self = this;

        self.buildSections = [];
        self.modelTitle = ''; //顯示模型邏輯詞區的title
        self.datasource = [];
        self.dropdownAutoSize = false;
        self.filterModelGroup = filterModelGroup;
        self.gridOptions = {
            columnDefs: [
                {
                    name: 'name',
                    field: 'name',
                    cellTemplate: '<div><a class="btn" ng-click="grid.appScope.play()">{{row.entity.name}}</a></div>'
                }
            ]
        };
        self.isShowModelDetail = false;
        self.modelKeyword = '';
        self.models = [];
        self.queriesBinding = {
            search: {}
        }

        $scope.play = playVideo;

        self.queriesCollection = {
            queries: []
        }

        self.selectedItems = [];
        self.showModelDetail = showModelDetail;


        buildModelService.setQueriesBinding(API_PATH + '_query/template/search', self.queriesCollection, self.queriesBinding);
        function filterModelGroup(queriesBinding) {
            buildModelService.searchByQueries(self.queriesCollection, queriesBinding, 'search', function (items) {
                self.models = items;
            })
        }

        function playVideo() {

            var modalInstance = $modal.open({
                controller: ['$scope',  playVideoController],
                controllerAs: 'playVideoCtrl',
                templateUrl: 'views/buildModel_matchedReview_video_modal.html'
            });

            function playVideoController($scope) {
                var audio;
                var cuesId;
                var track;
                var self = this;
                self.changeCue = changeCue;
                self.currentCue = true;
                self.init = init;
                self.onSeek = onSeek;
                self.playPause = playPause;
                self.setHtmltoCue = setHtmltoCue;
                modalInstance.result.then('', modalClosing); //當modal被關掉時
                $scope.$on('wavesurferInit', getWavesurfer); //當wavesurfer準備好後
                function changeCue(cue) {
//                    console.log(cue.text)
//                    console.log(self.player)
                    audio.currentTime = cue.startTime;
                    self.player.seekTo(cue.startTime / audio.duration)
                    markedhighlight([cue]);
                }


                function getWavesurfer(e, wavesurfer) {
                    self.player = wavesurfer; //指定Wavesurfer
                    self.player.on('ready', function () { //Wavesurfer ready後綁定字幕

                        self.cues = track.cues;
                        $scope.$apply();
                        console.log(typeof self.cues)
                    });

                    self.player.on('seek', onSeek); //當點選音波時
                }

                function init() {
                    audio = $('audio').get(0);
                    track = $('#track').get(0).track;
                    cuesId = [];
                    $(track).on('cuechange', function () { //當當前字幕改變時
                        markedhighlight(track.activeCues);
                        $scope.$apply();
                    })
                }

                function markedhighlight(activeCues){//標記highlight
                    var search = {searched: false};
                    for (var idx = self.cues.length - 1;idx >= 0;idx--){//由後往前搜尋並標記
                       var cue = self.cues[idx];
                        cue.highlight = false;//尚未搜尋到之前都將highlight設為false
                       if (activeCues && !search.searched){//與目前的cues進行startTime的比對
                           angular.forEach(activeCues,function(activeCue){
                               if (cue.startTime == activeCue.startTime){
                                   search.searched = true;
                               }
                           })
                       }
                        if (search.searched) cue.highlight = true;//已經搜尋到的cues之後都標記highlight
                    }
                }

                function modalClosing() { //modal關閉後清空Wavesurfer
                    self.player.empty()
                }

                function onSeek() {
                    audio.currentTime = self.player.getCurrentTime();
                    console.log(audio.currentTime);
                    console.log(audio);
                    console.log(self.cues);


                }

                function playPause() {

                    self.player.playPause();
                    self.player.setVolume(0);
                    if (audio.paused) {
                        audio.play();
                    }
                    else {
                        audio.pause();
                    }

                }

                function setHtmltoCue(index, cue) {
                    var incue = angular.element('#cue' + index); //由ID取得當前repeat到的
                    //console.log(incue)
                    if (incue[0].innerText == '') { //如果有取到且裡面的內容是空白
                        $(incue).append(cue.getCueAsHTML()); //就將目前的cue的內容加進去
                        console.log(incue[0].id)
                        cuesId.push(incue[0].id);
                    }
                }
            }
        }

        function showModelDetail(entity) {
            if (self.buildSections.length > 0) self.buildSections.length = 0;
            buildModelService.setTemporary(entity.href, null, self.buildSections);
            self.isShowModelDetail = true;
            self.modelTitle = entity.title;
            self.gridOptions.data.push(
                {'name': '123'}
            )
        }

        ////////////////////不綁定區//////////////

    }

    function modelManagementController($scope, jsonMethodService, jsonParseService, buildModelService, templateLocation, $translate, $modal, $timeout, SweetAlert, API_PATH) {

        var enableModelTimeout;
        var self = this;

        $scope.changeModelStatus = changeModelStatus; //使用$scope綁定grid裡面
        self.datasource = [];
        $scope.editModel = editModel;
        self.filterModel = filterModel;
        self.gridOptions = {
            columnDefs: [

                {

                    field: 'modelName',
                    displayName: '{{"modelName"|translate}}',
                    cellClass: 'model-management-grid-cell',
                    headerCellClass: 'model-management-grid-header',
                    headerCellFilter: 'translate',
                    cellTemplate: 'views/buildModel_modelManagement_modelName_grid.html',
                    enableColumnMenu: false,
                    enableHiding: false,
                    minWidth: 200

                },
                {

                    field: 'role',
                    displayName: '{{"role"|translate}}',
                    headerCellFilter: 'translate',
                    cellClass: 'model-management-grid-cell',
                    headerCellClass: 'model-management-grid-header',
                    enableColumnMenu: false
                },
                {

                    field: 'history',
                    displayName: '{{"history"|translate}}',
                    headerCellFilter: 'translate',
                    headerCellClass: 'model-management-grid-header',
                    cellClass: 'model-management-grid-cell',
                    enableColumnMenu: false
                },
                {

                    field: 'status',
                    displayName: '{{"status"|translate}}',
                    headerCellFilter: 'translate',
                    headerCellClass: 'model-management-grid-header',
                    cellClass: 'model-management-grid-cell',
                    cellTemplate: '<div class="switch-instance inline-block"><div class="onoffswitch"><input type="checkbox" ng-checked="row.entity.enabled" ng-model="row.entity.enabled"  ng-click="grid.appScope.changeModelStatus(row.entity)" class="onoffswitch-checkbox" id="modelManagent{{row.entity.modelName}}"><label class="onoffswitch-label" for="modelManagent{{row.entity.modelName}}"><span class="onoffswitch-inner"></span><span class="onoffswitch-switch"></span></label></div></div>',
                    enableColumnMenu: false,
                    enableSorting: false,
                    maxWidth: 120
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
        self.queriesBinding = {
            search: {}
        }
        self.queriesCollection = {
            queries: []
        }
        $scope.saveAsModel = saveAsModel;
        self.selectedItems = [];
        $scope.showModelDetail = showModelDetail;
        buildModelService.setQueriesBinding(API_PATH + '_query/template/search', self.queriesCollection, self.queriesBinding);//需修改


        function changeModelStatus(entity) { //變更上下線，可直接變更該一列的資料
            //entity.enabled=!entity.enabled;
            // if(enableModelTimeout) $timeout.cancel(enableModelTimeout);
            //enableModelTimeout=$timeout(function(){
            //do API

            //
            //},1000);
            var title = entity.enabled ? $translate.instant('onlineModel') : $translate.instant('offlineModel');
            SweetAlert.swal({
                title: title,
                type: 'info',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: $translate.instant('sure'),
                cancelButtonText: $translate.instant('cancel'),
                closeOnConfirm: true,
                closeOnCancel: true,
                customClass: 'sweetAlert'
            }, function (sure) {
                if (!sure) {
                    entity.enabled = !entity.enabled;
                    console.log(entity)
                }
                else {
                    console.log(entity)
                }
            });
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

        function filterModel(queriesBinding) {
            if (self.gridOptions.data)  self.gridOptions.data.length = 0;
            buildModelService.searchByQueries(self.queriesCollection, queriesBinding, 'search', function (items) {
                angular.forEach(items, function (item) {
                    var data = setGridData(item);
                    self.gridOptions.data.push(data);
                })
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
                var modalGroupSelectedTimeout;
                var self = this;
                self.addTags = addTags;
                self.saveModel = saveModel;
                self.title = $translate.instant('saveAsNewModel')
                self.editBinding = {
                    configuration: {
                        title: '',
                        tags: [],
                        allTags: []
                    }
                };
                self.queryBinding = {
                    search: {
                        q: '',
                        tags: []
                    }
                }
                self.temporaryCollection = {
                    collection: {}
                }
                buildModelService.setQueriesBinding(API_PATH + '_query/template/search', null, self.queryBinding, function () {
                    self.editBinding.configuration.allTags = angular.copy(self.queryBinding.search.tags);
                    buildModelService.setTemporary(entity.href, self.temporaryCollection, null, null, self.editBinding);
                })


                self.closeModal = closeModal;
                function closeModal() {
                    $modalInstance.close();
                }

                function addTags(successCallback) {
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

                            self.editBinding.configuration.tags.push({
                                name: inputValue,
                                selected: true
                            })
                            buildModelService.saveConfiguration(self.temporaryCollection, self.editBinding.configuration, function () {
                                swal('Nice!', 'You wrote: ' + inputValue, 'success');
                                if (successCallback) successCallback();
                            })
                        });

                }

                function saveModel(type) {
                    alert(type)
                    buildModelService.saveAs(self.temporaryCollection.collection, self.editBinding.configuration.title, self.editBinding.configuration.tags, function (location) {
                        swal(
                            {title: "Success", timer: 1000, type: 'success', showConfirmButton: false}
                        );
                        $modalInstance.close();
                    })
                }
            }
        }


        function showModelDetail(entity) { //打開modal顯示模型邏輯詞曲
            var modalInstance = $modal.open({
                backdropClass: 'model-management-model-backdrop',
                controller: ['$modalInstance', 'title', showModelDetailController],
                controllerAs: 'detailCtrl',
                templateUrl: 'views/buildModel_modelManagement_modelDetailModal.html',
                windowClass: 'model-management-modal-logic',
                resolve: {
                    title: function () {
                        return entity.modelName;
                    }
                }
            });

            function showModelDetailController($modalInstance, title) {
                var self = this;
                self.closeModal = closeModal;
                self.titlePrpperty = 'name';
                self.itemProperty = 'items';
                self.itemInfoEditable = 'itemInfo.editable';
                self.sections = [];
                self.title = title;
                buildModelService.setTemporary(entity.href, null, self.sections);
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