(function () {
    angular.module('iNu')
        .controller('recordListController', ['jsonMethodService', '$scope', recordListController])

    function recordListController(jsonMethodService, $scope) {
        var self = this;
        self.perItemHeight = 32;
        self.listOptions = {
            enableSorting: true,
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            expandableRowTemplate: 'views/recordListGrdTemplate.html',
            expandableRowHeight: 160,
            expandableRowScope: {
                subGridVariable: 'subGridScopeVariable'
            },
            multiSelect: false,
            columnDefs: [
                {name: '任務流水號', field: 'taskFlow'},
                {"name": '業務模型', field: 'model', cellTemplate: '<span>自訂樣板</span>'},
                {"name": '通話時長(秒)', field: 'callRange'},
                {"name": '靜音時長(秒)', field: 'muteRange'},
                {"name": '語速', field: 'callSpeed'},
                {"name": '靜音點比', field: 'mutePercentage'},
                {"name": '座席工號', field: 'sitNumber'},
                {"name": '座席班組', field: 'sitGroup'},
                {"name": '通話時間', field: 'callTime'},
                {"name": '受理號碼', field: 'acceptedNumber'},
                {"name": '來電原因', field: 'callReason'}
//                    {"name": '用戶品牌',field: 'userBrand'},
//                    {"name": '客戶等級',field: 'customerRating'},
//                    {"name": '滿意度',field: 'satisfaction'},
//                    {"name": '所屬區域',field: 'area'},
//                    {"name": '情緒得分',field: 'gameType'},
//                    {"name": '客服班組',field: 'agentTeamNumber'},
//                    {"name": '數據源',field: 'source'}

            ],
            data: 'callListData',

        };
        self.maxExpandedHeight = 0;//grid擴展最大高度


        doService();
        function doService() {
            jsonMethodService.getJson('json/callList.json').then(
                function (data) {//success
                    $scope.callListData = data
                }, function (data) {//error
                }
            );
        }
    }
})()