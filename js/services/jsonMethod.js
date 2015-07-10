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
            function post(href, data) {
                var deferred = $q.defer();
                var urlToGo = href;
                $http(
                    {
                        method: "POST",
                        data: data,
                        url: urlToGo,
                        headers: {'Content-Type': 'application/vnd.collection+json'}
                    }
                )
                    .success(function (data,status,headers) {
                        var response = {};
                        response.data = data;
                        response.status = status;
                        response.headers = headers;
                        deferred.resolve(response);
                    }).success(function (response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            }
            function put(href, data) {
                var deferred = $q.defer();
                var urlToGo =  href;
                $http(
                    {
                        method: "PUT", data: data,
                        url: urlToGo,
                        headers: {'Content-Type': 'application/vnd.collection+json'}
                    }
                )
                    .success(function (response) {
                        deferred.resolve(response);
                    }).error(function (response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            }
            return{
                DELETE: DELETE,
                get: get,
                post: post,
                put: put
            };
        })
})();