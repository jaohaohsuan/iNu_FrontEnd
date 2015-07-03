(function(){
    angular.module('iNu')
        .service('buildModelService',['jsonMethodService','jsonParseService','$translate',buildModelService])
        .service('templateLocation', templateLocation)
    function buildModelService(jsonMethodService,jsonParseService,$translate){
        function addToCurrentSection(href,template,sections,occurrence,successCallback,errorCallback){
            jsonMethodService.post(href, template).then(function (response) {
                var section = jsonParseService.findItemValueFromArray(sections, 'href', occurrence);
                var location = response.headers('Location');
                var item = {
                    href: location,
                    itemInfo: sectionItemFormat(template.template.data, 'query', 'logic', 'distance', 'editable')
                };
                section.items.push(item);
                if (successCallback) successCallback();
            }).then(function (response) {
                if (errorCallback) errorCallback(response);
            })
        }
        function setEditBinding(editBinding,bindGroup, datas) {
            angular.forEach(datas, function (data) {
                if (data.name == 'query') {
                    editBinding[bindGroup].query = data.value.split('\\s');
                } else {
                    editBinding[bindGroup][data.name] = data.value;
                }
            })
        }
        function setEditTemporary(editLinks,editCollection,editBinding) {
            angular.forEach(editLinks, function (editlink) {
                jsonMethodService.get(editlink.href).then(function (collectionjson) {
                    var syntaxIdentity = editlink.href.match(/(match|near|named)/g)[0];
                    var bindGroup;
                    if (!syntaxIdentity) return;
                    if (['match', 'near'].indexOf(syntaxIdentity) != -1) bindGroup = 'syntax';
                    else if (syntaxIdentity == 'named') bindGroup = 'component';
                    if (editBinding)setEditBinding(editBinding,bindGroup, collectionjson.collection.template.data);
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
                        item.itemInfo = sectionItemFormat(item.data, 'query', 'logic', 'distance', 'editable');//格式化成前端顯示文字
                    })
                })
            })
        }
        function setTemplate(href,sections,editCollection,editBinding) {
            jsonMethodService.get(href).then(function(collectionjson){
                var temporaryUrl = jsonParseService.findItemValueFromArray(collectionjson.collection.links,"href","temporary").href;//由links內取得temporary的href
                setTemporary(temporaryUrl,sections,editCollection,editBinding);//設定temporary結構
            })
        }

        function setTemporary(href,sections,editCollection,editBinding) {
            jsonMethodService.get(href).then(function (collectionjson) {
                angular.forEach(collectionjson.collection.items, function (item) {
                    var linksObj = jsonParseService.getLinksObjFromLinks(item.links, 'rel'); //將items裡面的links用rel分類
                    var editLinks = linksObj['edit'];//用來顯示查詢條件的(must must_not should)
                    var tmpSections = linksObj['section'];//用來增加查詢條件的(match near named)
                    angular.forEach(tmpSections,function(section){
                        sections.push(section);
                    })
                    setModelSections(sections);//設定如何顯示三個條件裡面的資料
                    if (editCollection) setEditTemporary(editLinks,editCollection,editBinding);//設定binding的資料是詞區還是公用組件
                })
            })
        }

        function sectionItemFormat(datas,queryProperty,logicProperty,distanceProperty,editableProperty){
            var itemInfoStruct = {};
            itemInfoStruct[editableProperty] = true;
            datas.forEach(function(data){
                var value = data.value;
                var name = data.name;
                var mappingDefine = {
                    "query": function(){
                        itemInfoStruct[queryProperty] = value
                    },
                    "storedQueryTitle": function(){
                        itemInfoStruct[queryProperty] = value;
                        itemInfoStruct[editableProperty] = false;
                    },
                    "inOrder": function(){
                        var text = "";
                        if (value) text =  $translate.instant(name);
                        text += $translate.instant("AND");
                        itemInfoStruct[logicProperty] = text;
                    },
                    "operator": function(){
                        itemInfoStruct[logicProperty] = $translate.instant(value);
                    },
                    "slop": function(){
                        itemInfoStruct[distanceProperty] = $translate.instant('distance') + "(" + value + ")";
                    }
                }
                if (!mappingDefine.hasOwnProperty(name)) {return;}
                mappingDefine[name]();
            })
            return itemInfoStruct;
        }
        return{
            addToCurrentSection: addToCurrentSection,
            sectionItemFormat: sectionItemFormat,
            setTemplate:  setTemplate,
            setTemporary: setTemporary
        }
    }
    function templateLocation() {
        var self = this;
    }

    Object.defineProperty(templateLocation.prototype, 'path', {
        configurable:false,
        get :function (){
            return this._path;
        },
        set : function (val) {
            if(val!==this._path){
                this._path=val;
            }
        }
    })
})();
