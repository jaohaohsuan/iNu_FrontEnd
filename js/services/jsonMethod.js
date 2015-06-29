(function(){
    angular.module('iNu')
        .service('jsonMethodService',function($q,$http){
            function DELETE(href){//delete為關鍵字故用大寫替代
                var deferred = $q.defer();
                var urlToGo = href;
                $http(
                    {
                        method: "DELETE", url: urlToGo
                    }
                ).success(function (responsedata) {
                        deferred.resolve(responsedata);
                    }).error(function (responsedata) {
                        deferred.reject(responsedata);
                    });
                return deferred.promise;
            }
            function get (href){
                var deferred = $q.defer();
                $http.get(href).success(function(data,status, headers, config){
                    deferred.resolve(data);
                }).error(function (data, status, headers, config){
                    deferred.reject(data);
                });
                return deferred.promise;
            }
            return{
                DELETE: DELETE,
                get: get
            };
        })
})();