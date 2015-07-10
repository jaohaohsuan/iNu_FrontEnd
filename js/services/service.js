(function () {
    angular.module('iNu')
        .service('buildModelService', ['jsonMethodService', 'jsonParseService', '$translate', buildModelService])
        .service('templateLocation', templateLocation)
    function buildModelService(jsonMethodService, jsonParseService, $translate) {
        function addToCurrentSection(href, template, sections, occurrence, successCallback, errorCallback) {
            jsonMethodService.post(href, template).then(
                function (response) {
                    var currentSection = jsonParseService.findItemValueFromArray(sections, 'href', occurrence);//從sections內搜尋正確的section
                    var location = response.headers('Location');
                    var item = {
                        href: location,
                        itemInfo: sectionItemFormat(template.template.data, 'query', 'syntax', 'slop', 'editable')//格式化前端需顯示的文字
                    };
                    if (!currentSection.items) currentSection.items = [];
                    currentSection.items.push(item);//post成功後前端加入格式化後的item
                    if (successCallback) successCallback();
                }, function (response) {
                    if (errorCallback) errorCallback(response);
                })
        }
        function save(temporaryCollection,configuration,successCallback,errCallback){
            configuration = angular.copy(configuration);
            configuration.tags = tagsJoinBySelected(configuration.tags);
            angular.forEach(temporaryCollection.collection.template.data,function(data){
                data.value = configuration[data.name];
            })
            var template = {template: angular.copy(temporaryCollection.collection.template)};
            jsonMethodService.put(configuration.href,template).then(function(response){
                console.log(response);
            })
            console.log(configuration)
        }

        function saveAs(temporaryCollection, title, tags, successCallback, errorCallback) {
            var href = jsonParseService.findItemValueFromArray(temporaryCollection.items, "href", "template").href;
            var kvTemplate = jsonParseService.getObjectMappingNameToValueFromDatas(temporaryCollection.template.data);
            kvTemplate.title.value = title;
            kvTemplate.tags.value = tagsJoinBySelected(tags);
            var template = {template: angular.copy(temporaryCollection.template)};
            jsonMethodService.post(href, template).then(
                function (response) {
                    if (successCallback) successCallback(response.headers('Location'));
                }, function (response) {
                    if (errorCallback) errorCallback(response);
                })
        }

        function searchByQueries(queriesCollection,queryBinding,rel,successCallback,errorCallback){
            queryBinding = angular.copy(queryBinding);
            if (queryBinding.tags){
                queryBinding.tags = tagsJoinBySelected(queryBinding.tags);
            }
            var searchHref = '';
            queriesCollection.queries.some(function(query){
                if (query.rel === rel){//匹配到指定的rel進行搜尋的url參數設定
                    searchHref = query.href + '?';
                    angular.forEach(query.data,function(data){
                        data.prompt = queryBinding[data.name];
                        if (data.prompt.length > 0) searchHref += data.name + '=' + data.prompt + '&'
                    })
                    return true;
                }
            })

            jsonMethodService.get(searchHref).then(function(collectionjson){
                angular.forEach(collectionjson.collection.items, function (item) {
                    angular.forEach(item.data, function (data) {//將每個item內的data[]轉換成key/value的形式以利綁定
                        item[data.name] = data.value;
                    })
                })
                if (successCallback) successCallback(angular.copy(collectionjson.collection.items));
            },function(){
                if (errorCallback) errorCallback();
            })
        }
        function setConfigurationTemporary(datas, editBinding) {//配置區塊資料綁定
            angular.forEach(datas, function (data) {
                if (data.name === 'tags') {
                    data.value = tagsToArrayObject(data.value);
                }
                editBinding.configuration[data.name] = data.value;
            })
        }

        function setEditBinding(editBinding, bindGroup, datas) {
            angular.forEach(datas, function (data) {
                if (data.name == 'query') {
                    editBinding[bindGroup].query = data.value.split('\\s');
                } else {
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

        function setModelSections(sections) {
            angular.forEach(sections, function (section) {
                jsonMethodService.get(section.href).then(function (collectionjson) {
                    section.items = collectionjson.collection.items;
                    section.name = $translate.instant(section.name);
                    angular.forEach(section.items, function (item) {
                        item.itemInfo = sectionItemFormat(item.data, 'query', 'syntax', 'slop', 'editable');//格式化成前端顯示文字
                    })
                })
            })

        }

        function setQueriesBinding(href,queriesCollection, queriesBinding,successCallback) {
            jsonMethodService.get(href).then(function(collectionjson){
                queriesCollection.queries = angular.copy(collectionjson.collection.queries);
                angular.forEach(collectionjson.collection.queries, function (query) {
                    angular.forEach(query.data, function (data) {
                        query[data.name] = data.prompt;
                    })
                    delete query.data;
                    query.q = '';
                    query.tags = tagsToArrayObject(query.tags,'name');
                    queriesBinding[query.rel] = query;
                })
                if (successCallback) successCallback();
            })
        }

        function setTemplate(href, temporaryCollection, sections, editCollection, editBinding) {
            jsonMethodService.get(href).then(function (collectionjson) {
                var temporaryUrl = jsonParseService.findItemValueFromArray(collectionjson.collection.links, "href", "temporary").href;//由links內取得temporary的href
                setTemporary(temporaryUrl, temporaryCollection, sections, editCollection, editBinding);//設定temporary結構
            })
        }

        function setTemporary(href, temporaryCollection, sections, editCollection, editBinding) {
            jsonMethodService.get(href).then(function (collectionjson) {
                if (temporaryCollection) temporaryCollection.collection = angular.copy(collectionjson.collection);
                angular.forEach(collectionjson.collection.items, function (item) {
                    var linksObj = jsonParseService.getLinksObjFromLinks(item.links, 'rel'); //將items裡面的links用rel分類
                    var editLinks = linksObj['edit'];//用來顯示查詢條件的(must must_not should)
                    var tmpSections = linksObj['section'];//用來增加查詢條件的(match near named)
                    if (sections) {
                        angular.forEach(tmpSections, function (section) {
                            sections.push(section);
                        })
                        setModelSections(sections);//設定查詢條件的綁定
                    }
                    if (editCollection) setEditTemporary(editLinks, editCollection, editBinding);//設定邏輯詞組及公用組件的綁定
                    if (editBinding) {
                        setConfigurationTemporary(item.data, editBinding);//設定配置區塊的資料綁定
                    }
                })
            }, function () {
            })
        }

        function sectionItemFormat(datas, queryProperty, syntaxProperty, slopProperty, editableProperty) {
            var itemInfoStruct = {};
            itemInfoStruct[editableProperty] = true;
            datas.forEach(function (data) {
                var value = data.value;
                var name = data.name;
                var mappingDefine = {
                    "query": function () {
                        itemInfoStruct[queryProperty] = value
                    },
                    "storedQueryTitle": function () {
                        itemInfoStruct[queryProperty] = value;
                        itemInfoStruct[editableProperty] = false;
                    },
                    "inOrder": function () {
                        var text = "";
                        if (value) text = $translate.instant(name);
                        text += $translate.instant("AND");
                        itemInfoStruct[syntaxProperty] = text;
                    },
                    "operator": function () {
                        itemInfoStruct[syntaxProperty] = $translate.instant(value);
                    },
                    "slop": function () {
                        itemInfoStruct[slopProperty] = $translate.instant(slopProperty) + "(" + value + ")";
                    }
                }
                if (!mappingDefine.hasOwnProperty(name)) {
                    return;
                }
                mappingDefine[name]();
            })
            return itemInfoStruct;
        }

        function tagsJoinBySelected(tagsArrayObject) {
            return tagsArrayObject.map(function (tag) {
                if (tag.selected) return tag.name;
            }).join(' ').trim();
        }

        function tagsToArrayObject(tags){
            if (tags.length > 0){
                return tags.trim().split(/\s+/).map(function (e) {
                    return {"name": e}
                });
            }else return [];
        }

        return{
            addToCurrentSection: addToCurrentSection,
            save: save,
            saveAs: saveAs,
            searchByQueries: searchByQueries,
            setQueriesBinding: setQueriesBinding,
            setTemplate: setTemplate,
            setTemporary: setTemporary
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
