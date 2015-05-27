/**
 * Created by will on 2015/5/25.
 */
(function(){
    angular.module('iNu')
        .controller('loginController',['$state',function($state){
            var self = this;
            self.login = function(){
                var account = self.account;
                var password = self.password;
                if (account == 'admin' && password == 'admin')
                {
                    console.log('Login')
                    $state.go('main');
                    self.errorMsg = null;
                }
                else
                {
                    self.account = '';
                    self.password = '';
                    self.errorMsg = "帳號或密碼錯誤";
                }
            }
        }])
})()