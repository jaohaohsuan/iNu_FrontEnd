(function () {
    angular.module('iNu')
        .service('buildModelService', ['jsonMethodService', 'jsonParseService', '$translate', buildModelService])
        .service('templateLocation', templateLocation)
    function buildModelService(jsonMethodService, jsonParseService, $translate) {
        function addToCurrentSection(href, template, sections, occurrence, successCallback, errorCallback) {
            jsonMethodService.post(href, template).then(
                function (response) {
                    var currentSection = jsonParseService.findItemValueFromArray(sections, 'href', occurrence);
                    var location = response.headers('Location');
                    var item = {
                        href: location,
                        itemInfo: sectionItemFormat(template.template.data, 'query', 'syntax', 'slop', 'editable')//格式化前端需顯示的文字
                    };
                    currentSection.items.push(item);
                    if (successCallback) successCallback();
                }, function (response) {
                    if (errorCallback) errorCallback(response);
                })
        }

        function saveAs(temporaryCollection, title, tags, successCallback, errorCallback) {
            var href = jsonParseService.findItemValueFromArray(temporaryCollection.items, "href", "temporary").href;
            var kvTemplate = jsonParseService.getObjectMappingNameToValueFromDatas(temporaryCollection.template.data);
            kvTemplate.title.value = title;
            kvTemplate.tags.value = tags.map(function (tag) {
                if (!tag.enabled) return tag.name;
            }).join(' ');
            var template = {template: angular.copy(temporaryCollection.template)};
            console.log(JSON.stringify(template))
            jsonMethodService.post(href, template).then(
                function (response) {
                    if (successCallback) successCallback(response.headers('Location'));
                }, function (response) {
                    if (errorCallback) errorCallback(response);
                })
        }

        function setConfigurationTemporary(datas, editBinding) {//配置區塊資料綁定
            angular.forEach(datas, function (data) {
                if (data.name === 'tags') {
                    var splitTags = data.value.split('\\s').map(function (e) {
                        return {"name": e}
                    });
                    if (splitTags.length >= 0) editBinding.configuration.tags.concat(splitTags)
                    data.value = editBinding.configuration.tags;
                }
                else if (data.name === 'status' && data.value === 'enabled') {//啟用狀態
                    editBinding.configuration['isOnline'] = true;
                    editBinding.configuration.tags.some(function (tag) {
                        if (tag.name === 'online') {
                            tag.enabled = true;
                            tag.selected = true;
                            return true;
                        }
                    })
                }
                editBinding.configuration[data.name] = data.value;
            })
        }

        function setDefaultTags(editBinding, successCallback, errorCallback) {
            jsonMethodService.get('json/defaultTags.json').then(
                function (defaultTags) {
                    editBinding.configuration.tags = defaultTags;
                    if (successCallback) successCallback();
                }, function () {
                    if (errorCallback) errorCallback();
                });
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

        function setTemplate(href, sections, editCollection, editBinding) {
            jsonMethodService.get(href).then(function (collectionjson) {
                var temporaryUrl = jsonParseService.findItemValueFromArray(collectionjson.collection.links, "href", "temporary").href;//由links內取得temporary的href
                setTemporary(temporaryUrl, sections, editCollection, editBinding);//設定temporary結構
            })
        }

        function setTemporary(href, sections, editCollection, editBinding) {
            jsonMethodService.get(href).then(function (collectionjson) {
                if (editCollection) editCollection["temporary"] = collectionjson;
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
                        setDefaultTags(editBinding, function () {
                            setConfigurationTemporary(item.data, editBinding);//設定配置區塊的資料綁定
                        })
                    }
                })

            }, function () {
                setDefaultTags(editBinding);//設定預設標籤
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

        return{
            addToCurrentSection: addToCurrentSection,
            saveAs: saveAs,
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
