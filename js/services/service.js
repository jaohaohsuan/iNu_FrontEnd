(function(){
    angular.module('iNu')
        .service('URL', URL)

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
