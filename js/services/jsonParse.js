(function () {
    angular.module('iNu')
        .service('jsonParseService', jsonParseService)
    function DataClass(name, value,array, prompt, href) {
        this.name = name;
        this.value = value;
        this.array = array;
        this.prompt = prompt;
        this.href = href;
    }
    function jsonParseService() {
        function getDatasFromCollectionJson(collectionJson) {
            var datas = new Array()
            angular.forEach(collectionJson.collection.items, function (item) {
                angular.forEach(item.data, function (detailItem) {
                    var data = new DataClass(detailItem.name, detailItem.value,detailItem.array, detailItem.prompt, item.href)
                    datas.push(data);
                });
            })
            return datas;
        }
        function getObjectMappingNameToValueFromDatas(datas,dataKey) {
            var result = {}
            if (!dataKey) dataKey = 'name'
            angular.forEach(datas,function (data) {
                result[data[dataKey]] = data;
            })
            return result;
        }
        function getRelTemplate(links,rel){
            var result = [];
            angular.forEach(links,function(link){
                if (link.rel == rel) result.push(link);
            })
            return result;
        }
        return{
            getDatasFromCollectionJson: getDatasFromCollectionJson,
            getRelTemplate: getRelTemplate,
            getObjectMappingNameToValueFromDatas:getObjectMappingNameToValueFromDatas
        };
    }
})();