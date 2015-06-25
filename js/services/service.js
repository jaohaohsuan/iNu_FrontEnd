(function(){
    angular.module('iNu')
        .service('textFormat',['$translate',textFormat])
        .service('URL', URL)
    function textFormat($translate){
        function buildSectionFormat(datas){
            var textList = [];
            datas.forEach(function(data){
                var value = data.value;
                var name = data.name;
                if (["query","storedQueryTitle"].indexOf(name) != -1){
                    textList.push(value);
                }else if (name === "inOrder"){
                    if (value) textList.push($translate.instant(name))
                    textList.push($translate.instant("AND"));
                }else if (name === "operator"){
                    textList.push($translate.instant(value));
                }else if (name === "slop"){
                    textList.push($translate.instant('distance'));
                    textList.push(value);
                }
            })
            return textList.join(' ');
        }
        return {
            buildSectionFormat: buildSectionFormat
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
