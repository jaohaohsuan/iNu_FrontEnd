(function () {
    angular.module('iNu')
        .service('buildModelService', ['jsonMethodService', 'jsonParseService', '$translate', '$timeout', buildModelService])
        .service('previewService', ['jsonMethodService','jsonParseService',previewService])
        .service('templateLocation', templateLocation)
    function buildModelService(jsonMethodService, jsonParseService, $translate, $timeout) {

        function addNewComponent(templateCollection,title,successCallback,errorCallback){
            templateCollection = angular.copy(templateCollection);
            var href = templateCollection.collection.href;
            var kvTemplate = jsonParseService.getObjectMappingNameToValueFromDatas(templateCollection.collection.template.data);
            kvTemplate.title.value = title;
            var template = {template: angular.copy(templateCollection.collection.template)};
            jsonMethodService.post(href,template).then(
                function(response){
                    if (successCallback) successCallback(response.headers('Location'));
                },
                function(response){
                    if (errorCallback) errorCallback(response);
                }
            )
        }

        function addToCurrentSection(href, template, sections, occurrence, successCallback, errorCallback) {
            jsonMethodService.post(href, template).then(
                function (response) {
                    var currentSection = jsonParseService.findItemValueFromArray(sections, 'href', occurrence);//從sections內搜尋正確的section
                    var location = response.headers('Location');
                    var item = {
                        href: location,
                        itemInfo: sectionItemFormat(template.template.data, 'query', 'syntax', 'slop', 'editable', 'field')//格式化前端需顯示的文字
                    };
                    if (!currentSection.items) currentSection.items = [];
                    currentSection.items.push(item);//post成功後前端加入格式化後的item
                    if (successCallback) successCallback();
                }, function (response) {
                    if (errorCallback) errorCallback(response);
                })
        }

        function markedSelectedTags(allTags, selectedTags) {
            angular.forEach(allTags, function (tag) {
                selectedTags.some(function (selectedTag) {
                    if (IsSelfAttrsEqObjX(tag, selectedTag)) {//比較共同欄位值，進行標記selected
                        tag.selected = true;
                        return true;
                    }
                })
            })
            return angular.copy(allTags);
        }

        function saveAs(temporaryCollection, title, tags, successCallback, errorCallback) {
            var href = jsonParseService.findItemValueFromArray(temporaryCollection.items, "href", "template").href;
            var kvTemplate = jsonParseService.getObjectMappingNameToValueFromDatas(temporaryCollection.template.data);
            kvTemplate.title.value = title;
            kvTemplate.tags.value = tagsJoinBySelected(tags);
            var template = { template: angular.copy(temporaryCollection.template) };
            jsonMethodService.post(href, template).then(
                function (response) {
                    if (successCallback) successCallback(response.headers('Location'));
                }, function (response) {
                    if (errorCallback) errorCallback(response);
                })
        }

        function saveConfiguration(temporaryCollection, configuration, successCallback, errCallback) {//儲存配置
            configuration = angular.copy(configuration);
            configuration.tags = tagsJoinBySelected(configuration.tags);
            angular.forEach(temporaryCollection.collection.template.data, function (data) {
                data.value = configuration[data.name];
            })
            var template = { template: angular.copy(temporaryCollection.collection.template) };
            jsonMethodService.put(configuration.href, template).then(function (response) {
                if (successCallback) successCallback(response);
            })
        }

        function searchByQueries(templateCollection, queryBinding, rel, successCallback, errorCallback) {
            var queries = angular.copy(templateCollection.collection.queries);
            queryBinding = angular.copy(queryBinding);
            if (queryBinding.tags) {
                queryBinding.tags = tagsJoinBySelected(queryBinding.tags);
            }
            var searchHref = '';
            queries.some(function (query) {
                if (query.rel === rel) {//匹配到指定的rel進行搜尋的url參數設定
                    searchHref = query.href + '?';
                    angular.forEach(query.data, function (data) {
                        data.prompt = queryBinding[data.name];
                        if (data.prompt.length > 0) searchHref += data.name + '=' + data.prompt + '&'//當有查詢資料再進行參數的設定
                    })
                    return true;
                }
            })
            jsonMethodService.get(searchHref).then(function (collectionjson) {
                angular.forEach(collectionjson.collection.items, function (item) {
                    angular.forEach(item.data, function (data) {//將每個item內的data[]轉換成key/value的形式以利綁定
                        item[data.name] = data.value;
                    })
                })
                if (successCallback) successCallback(angular.copy(collectionjson.collection.items));
            }, function () {
                if (errorCallback) errorCallback();
            })
        }
        function IsSelfAttrsEqObjX(self, ObjX) {//比較共同欄位
            var isequal = false;
            for (var thisKey in self) {
                if (!ObjX[thisKey] || thisKey == '$$hashKey') continue;
                if (self[thisKey] != ObjX[thisKey]) {
                    isequal = false;
                    break;
                }
                isequal = true;
            }
            return isequal;
        }

        function setConfigurationTemporary(href, datas, configurationBinding,allTags) {//配置區塊資料綁定
            configurationBinding.href = href;
            datas = angular.copy(datas);
            allTags = angular.copy(allTags);
            angular.forEach(datas, function (data) {
                if (data.name === 'tags') {
                    var selectedTags = tagsToArrayObject(data.value);
                    if (allTags) {
                        data.value = markedSelectedTags(allTags, selectedTags);
                    } else data.value = selectedTags;
                }
                configurationBinding[data.name] = data.value;
            })
        }

        function setEditBinding(editBinding, bindGroup, datas) {
            angular.forEach(datas, function (data) {
                if (data.name.indexOf('query') != -1) {
                    editBinding[bindGroup][data.name] = data.value.split(/\s+/);
                } else if (data.name.indexOf('field') != -1) {
                    editBinding[bindGroup].fields = data.prompt.split(/\s+/);
                    editBinding[bindGroup][data.name] = data.value;
                }
                else {
                    editBinding[bindGroup][data.name] = data.value;
                }
            })
        }

        function setEditTemporary(editLinks, editCollection, editBinding) {
            angular.forEach(editLinks, function (editlink) {
                jsonMethodService.get(editlink.href).then(function (collectionjson) {
                    var syntaxIdentity = editlink.href.match(/(match|near|named)/g)[0];
                    var bindGroup;
                    if (!syntaxIdentity) return;
                    if (['match', 'near'].indexOf(syntaxIdentity) != -1) bindGroup = 'syntax';
                    else if (syntaxIdentity == 'named') bindGroup = 'component';
                    setEditBinding(editBinding, bindGroup, collectionjson.collection.template.data);
                    editCollection[syntaxIdentity] = collectionjson.collection;
                })
            })
        }

        function setItemsBinding(items,bindingMethod){
            angular.forEach(items,function(item){
                if (bindingMethod) bindingMethod(item);
            })
        }

        function setModelSections(sectionLinks,sections) {
            if (sections){
                sections.length = 0;
                angular.forEach(sectionLinks,function(sectionLink){
                    sections.push(sectionLink);
                })
            }
            angular.forEach(sections, function (section) {
                    jsonMethodService.get(section.href).then(function (collectionjson) {
                        section.items = collectionjson.collection.items;
                        section.name = $translate.instant(section.name);
                        angular.forEach(section.items, function (item) {
                            item.itemInfo = sectionItemFormat(item.data, 'query', 'syntax', 'slop', 'editable', 'field');//格式化成前端顯示文字
                        })
                    })
            })
        }

        function setQueriesBinding(href, templateCollection, queriesBinding, successCallback) {
            jsonMethodService.get(href).then(function (collectionjson) {
                if (templateCollection) templateCollection.collection = angular.copy(collectionjson.collection);
                angular.forEach(collectionjson.collection.queries, function (query) {
                    angular.forEach(query.data, function (data) {
                        query[data.name] = data.prompt;
                    })
                    delete query.data;
                    query.q = '';
                    query.tags = tagsToArrayObject(query.tags);
                    queriesBinding[query.rel] = query;

                })
                if (successCallback) successCallback(queriesBinding);
            })
        }

        function setTemporary(href,temporaryCollection,successCallback,errorCallback){//將collection內的links轉成linksObj進行分類
            jsonMethodService.get(href).then(function (collectionjson) {
                if (!temporaryCollection) temporaryCollection = {};
                temporaryCollection.collection = angular.copy(collectionjson.collection);
                angular.forEach(temporaryCollection.collection.items, function (item) {
                    var linksObj = jsonParseService.getLinksObjFromLinks(item.links, 'rel'); //將items裡面的links用rel分類
                    item.linksObj = linksObj;
                    delete item.links;
                })
                if (successCallback) successCallback(temporaryCollection.collection.items);
            })
        }

        function setTemporaryLocation(templateUrl,successCallback){
            jsonMethodService.get(templateUrl).then(function (collectionjson) {
                var temporaryUrl = jsonParseService.findItemValueFromArray(collectionjson.collection.links, "href", "temporary").href;//由links內取得temporary的href
                if (successCallback) successCallback(temporaryUrl);
            })
        }

        function sectionItemFormat(datas, queryProperty, syntaxProperty, slopProperty, editableProperty, fieldProperty) {
            var itemInfoStruct = {};
            itemInfoStruct[editableProperty] = true;
            datas.forEach(function (data) {
                var value = data.value;
                var name = data.name;
                var mappingDefine = {
                    "query": function () {
                        itemInfoStruct[queryProperty] = { display: value, value: value }
                    },
                    "storedQueryTitle": function () {
                        itemInfoStruct[queryProperty] = { display: value, value: value };
                        itemInfoStruct[editableProperty] = false;
                    },
                    "inOrder": function () {
                        var text = "";
                        if (value) {
                            text = $translate.instant(name);
                        }
                        text += $translate.instant("AND");
                        itemInfoStruct[syntaxProperty] = {display:text,value:value};
                    },
                    "operator": function () {//AND OR
                        itemInfoStruct[syntaxProperty] ={display: $translate.instant(value),value:value};
                    },
                    "slop": function () {
                        itemInfoStruct[slopProperty] = { display: $translate.instant(slopProperty) + "(" + value + ")", value: value };
                    },
                    "field": function () {
                        itemInfoStruct[fieldProperty] = {display:value, value:value};
                    }
                }
                if (!mappingDefine.hasOwnProperty(name)) {
                    return;
                }
                mappingDefine[name]();
            })
            return itemInfoStruct;
        }

        function tagsJoinBySelected(tagsArrayObject) {//將arrayObject格式的tags轉換回空白隔開字串
            return tagsArrayObject.map(function (tag) {
                if (tag.selected == true) return tag.name;
            }).join(' ').trim();
        }

        function tagsToArrayObject(tags) {//將tags以空白切割，重組成arrayObject讓view綁定
            if (tags.length > 0) {
                return tags.trim().split(/\s+/).map(function (e) {
                    return { "name": e }
                });
            } else return [];
        }

        return {
            addNewComponent: addNewComponent,
            addToCurrentSection: addToCurrentSection,
            saveAs: saveAs,
            saveConfiguration: saveConfiguration,
            setConfigurationTemporary: setConfigurationTemporary,
            setEditTemporary: setEditTemporary,
            setItemsBinding: setItemsBinding,
            setModelSections: setModelSections,
            searchByQueries: searchByQueries,
            setQueriesBinding: setQueriesBinding,
            setTemporary: setTemporary,
            setTemporaryLocation: setTemporaryLocation
        }
    }

    function previewService(jsonMethodService,jsonParseService) {
        var self = this;
        self.setPreviewGridData = setPreviewGridData //設定匹配預覽要用的gridData
        function setPreviewGridData(temporaryCollection, gridData,successCallBack,errorCallBack) {
            if (gridData.length > 0) gridData.length = 0;
            var rndSource = ['Log8000', 'QQ', 'Line']; //demo用之後要拿掉
            angular.forEach(temporaryCollection.collection.items,function(temporaryItems){
                var previewLinks = temporaryItems.linksObj.preview;
                angular.forEach(previewLinks, function (previewLink) {
                    jsonMethodService.get(previewLink.href).then(function(collectionjson){
                        angular.forEach(collectionjson.collection.items,function(item){
                            var previewObj = jsonParseService.getObjectMappingNameToValueFromDatas(item.data);
                            var datasourceName = rndSource[Math.round(Math.random() * 2)];
                            gridData.push(
                                { 'datasourceName': datasourceName, 'matchedKeywords': previewObj.keywords.value, 'vttHref': item.href, 'highlight': previewObj.highlight.array }
                            );
                        })
                        if (successCallBack) successCallBack();
                    })
                })
            })

        }
    }
    function templateLocation() {
        var self = this;
    }

    Object.defineProperty(templateLocation.prototype, 'path', {
        configurable: false,
        get: function () {
            return this._path;
        },
        set: function (val) {
            if (val !== this._path) {
                this._path = val;
            }
        }
    })
})();
