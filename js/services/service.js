(function(){
    angular.module('iNu')
        .service('structFormat',['$translate',structFormat])
        .service('URL', URL)
    function structFormat($translate){
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
        return {
            sectionItemFormat: sectionItemFormat
        }
    }
    function URL() {
        var self = this;
    }

    Object.defineProperty(URL.prototype, 'path', {
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
