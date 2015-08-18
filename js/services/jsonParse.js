(function () {
    angular.module('iNu')
        .service('jsonParseService', jsonParseService)
    function DataClass(name, value, array, prompt, href) {
        this.name = name;
        this.value = value;
        this.array = array;
        this.prompt = prompt;
        this.href = href;
    }

    function jsonParseService() {
        function findItemValueFromArray(arrayObj,findColumn,findValue){
            var result = {};
            arrayObj.some(function(obj){
                if (obj[findColumn].lastIndexOf(findValue) != -1){
                    result = obj;
                    return true;
                }
            })
            return result;
        }

        function getDatasFromCollectionJson(collectionJson) {
            var datas = new Array()
            angular.forEach(collectionJson.collection.items, function (item) {
                angular.forEach(item.data, function (detailItem) {
                    var data = new DataClass(detailItem.name, detailItem.value, detailItem.array, detailItem.prompt, item.href)
                    datas.push(data);
                });
            })
            return datas;
        }

        function getEditorLinkFromLinks(linkClass, callback) {
            return getRELTemplateValidate(linkClass, "edit", callback);
        }

        function getLinksObjFromLinks(links) {
            var result = {};
            angular.forEach(links, function (link) {
                var rel = link.rel;
                if (result[rel]) result[rel].push(link);
                else result[rel] = [link];
            })
            return result;
        }

        function getObjectMappingNameToValueFromDatas(datas, dataKey) {
            var result = {}
            if (!dataKey) dataKey = 'name'
            angular.forEach(datas, function (data) {
                result[data[dataKey]] = data;
            })
            return result;
        }

        function getRELTemplateValidate(linkList, validateRelName, callback) {
            var result = {}
            matchRELNameDoSomething(
                linkList
                , validateRelName
                , function (link) {
                    if (link) result = link
                }
            );
            if (callback)  callback(result)
            return result
        }

        function matchRELNameDoSomething(linkList, validateRelName, returnFunction) {
            var result
            var upperCaseCompareString = validateRelName.toUpperCase()
            angular.forEach(linkList, function (link) {
                if (link.rel) {
                    if (link.rel.toUpperCase() === upperCaseCompareString) {
                        result = link
                        return
                    }
                }
            })
            return returnFunction(result)
        }

        return{
            findItemValueFromArray: findItemValueFromArray,
            getDatasFromCollectionJson: getDatasFromCollectionJson,
            getEditorLinkFromLinks: getEditorLinkFromLinks,
            getLinksObjFromLinks: getLinksObjFromLinks,
            getObjectMappingNameToValueFromDatas: getObjectMappingNameToValueFromDatas,
            getRELTemplateValidate: getRELTemplateValidate
        };
    }
})();