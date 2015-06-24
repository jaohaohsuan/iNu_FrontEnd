(function () {
    function buildSection() {
        var directive = {
            restrict: 'E',
            scope: {
                datasource: '=',
                clear: '='
            },
            templateUrl: 'views/directives/buildSection.html',
            controller: buildSectionController,
            controllerAs: 'self',
            bindToController: true
        }

        function buildSectionController() {
            var self = this;
            self.setClass = setClass;
            function setClass(index) {
                var className = ['panel panel-primary', 'panel panel-danger', 'panel panel-warning', 'panel panel-info'];
                return className[index % className.length];
            }
        }

        return directive;
    }

    function confirmClick() {
        var directive = {
            link: confirmClickLink,
            scope: {
                confirmedClick: '='
            }
        }

        function confirmClickLink(scope, element, attrs) {
            var msg = attrs.confirmClick || "Are you sure";
            var clickAction = scope.confirmedClick;
            element.bind('click', function (event) {
                if (window.confirm(msg)) {
                    scope.$eval(clickAction);
                }
            });
        }

        return directive;
    }

    function componentInstance() {
        var directive = {
            restrict: 'E',
            scope: {
                datasource: '=',
                renameComponent: '=',
                deleteComponent: '='
            },
            templateUrl: 'views/directives/componentInstance.html',
            controller: componentInstanceController,
            controllerAs: 'componentInstanceCtrl',
            bindToController: true


        };

        function componentInstanceController($scope) {
            var self = this;
            self.change = change;
            self.changeText = 'changeConfig'; //button顯示名稱，多語系son的key
            self.disableEdit = true;
            self.required = false;

            function change() {

                if (self.changeText === 'changeConfig') {
                    self.changeText = 'finished';
                    self.disableEdit = false;

                }
                else {

                    if (!self.textName || !self.textName.length)
                        self.required = true;
                    else {
                        self.disableEdit = true;
                        self.changeText = 'changeConfig';
                        self.renameComponent(); //在完成的時候給前端控制
                    }

                }
            }
        }

        return directive;
    }

    function focus($parse, $timeout) {
        return {
            link: function (scope, element, attrs) {
                var model = $parse(attrs.focus);

                scope.$watch(model, function (value) {
                    if (value === true) {
                        $timeout(function () {
                            element[0].focus();
                            element.find('input').focus();
                        });
                    }
                });
                element.bind('blur', function () {
                    scope.$apply(model.assign(scope, false));
                });
            }
        };
    }

    function modelInstance() {
        var directive = {
            restrict: 'E',
            scope: {
                addModelGroup: '=',
                datasource: '=',
                deleteModel: '=',
                isInstance: '=', //是否是實例模式
                isManagement: '=', //是否是模型管理下
                onlineModel: '=',
                renameModel: '=',
                saveModel: '=',
                saveModelAndOnline: '=',
                selectedEventhandler: '=',
                title: '='
            },
            templateUrl: 'views/directives/modelInstance.html',
            controller: modelInstanceController,
            controllerAs: 'modelInstanceCtrl',
            bindToController: true
        };

        function modelInstanceController($scope) {
            var self = this;
            self.changeModelName = changeModelName;
            self.changeText = 'changeConfig';
            self.modelName = "Test";
            self.modelClicked = modelClicked;
            self.selectedModelGroups = [];
            self.required = false;
            function changeModelName() {

                if (!self.modelName || !self.modelName.length)
                    self.required = true;
                else {
                    self.renameModel(); //在完成的時候給前端控制
                }

            }

            function modelClicked(model) {
                if (!self.selectedEventhandler) return;
                var idx = self.selectedModelGroups.indexOf(model);
                if (idx != -1) self.selectedModelGroups.splice(idx, 1);
                else self.selectedModelGroups.push(model);
                self.selectedEventhandler(self.selectedModelGroups);
            }
        }

        return directive;
    }

    function nestedScroll() {
        var directive =
          function(scope,element){
              element.on('mousewheel DOWMouseScroll',function(e){
                  var e0 = e.originalEvent || e,
                      delta = e0.wheelDelta || -e0.delta;
                  this.scrollTop += (delta<0?1:-1)*30;
                  e.preventDefault();
              });
          };
            return directive;
    }

    function numberPicker() {
        var directive = {
            restrict: 'E',
            scope: {
                number: '=',
                size: '='
            },
            controller: numberPickerController,
            template: '<div class="number-picker"><input type="text" size="{{size||2}}" ng-model="number" value="0"  class="number-input  text-center" onkeypress="return event.charCode >= 48 && event.charCode <= 57"/><div class="number-arrow"><span><a href="javascript: void(0)" ng-click="up()" class="fa fa-caret-up fa-2x"></a></span><span><a href="javascript: void(0)" ng-click="down()" class="fa fa-caret-down fa-2x"></a></span></div></div>'

        };

        function numberPickerController($scope, $element) {
            $scope.down = down;
            $scope.up = up;
            $element.bind("mousewheel", function (event, delta) {
                if (delta > 0) up();
                else down();
                $scope.$apply();
                return false;
            });
            function down() {
                if ($scope.number > 0)$scope.number--;
            }

            function up() {
                $scope.number++;
            }
        }

        return directive;
    }

///////////////////////////////////////////////////////////////
    function pageTitle($rootScope, $translate) {
        var directive = {
            link: function (scope, ele) {
                var listener = function (event, toState, toParams, fromState, fromParams) {
                    var title = 'iNu';
                    $translate(title).then(function (translate) {
                        title = translate;
                        ele.text(title);
                    });
                    if (toState.data && toState.data.title) {
                        $translate(toState.data.title).then(function (translate) { //?t?X?h?y?t
                            title = translate;
                            ele.text(title);
                        });
                    }
                };
                $rootScope.$on('$stateChangeStart', listener);
                $rootScope.$on('$translateChangeSuccess', listener);
            }
        };
        return directive;
    }

    /**
     * sideNavigation - Directive for run metsiMenu on sidebar navigation
     */
    function sideNavigation($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                // Call the metsiMenu plugin and plug it to sidebar navigation
                $timeout(function () {
                    element.metisMenu();

                });
            }
        };
    };

    /**
     * responsibleVideo - Directive for responsive video
     */
    function responsiveVideo() {
        return {
            restrict: 'A',
            link: function (scope, element) {
                var figure = element;
                var video = element.children();
                video
                    .attr('data-aspectRatio', video.height() / video.width())
                    .removeAttr('height')
                    .removeAttr('width')

                //We can use $watch on $window.innerWidth also.
                $(window).resize(function () {
                    var newWidth = figure.width();
                    video
                        .width(newWidth)
                        .height(newWidth * video.attr('data-aspectRatio'));
                }).resize();
            }
        }
    }

    /**
     * iboxTools - Directive for iBox tools elements in right corner of ibox
     */
    function iboxTools($timeout) {
        return {
            restrict: 'A',
            scope: true,
            templateUrl: 'views/common/ibox_tools.html',
            controller: function ($scope, $element) {
                // Function for collapse ibox
                $scope.showhide = function () {
                    var ibox = $element.closest('div.ibox');
                    var icon = $element.find('i:first');
                    var content = ibox.find('div.ibox-content');
                    content.slideToggle(200);
                    // Toggle icon from up to down
                    icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
                    ibox.toggleClass('').toggleClass('border-bottom');
                    $timeout(function () {
                        ibox.resize();
                        ibox.find('[id^=map-]').resize();
                    }, 50);
                },
                    // Function for close ibox
                    $scope.closebox = function () {
                        var ibox = $element.closest('div.ibox');
                        ibox.remove();
                    }
            }
        };
    };

    /**
     * minimalizaSidebar - Directive for minimalize sidebar
     */
    function minimalizaSidebar($timeout) {
        return {
            restrict: 'A',
            template: '<a class="navbar-minimalize minimalize-styl-2 btn btn-primary " href="" ng-click="minimalize()"><i class="fa fa-bars"></i></a>',
            controller: function ($scope, $element) {
                $scope.minimalize = function () {
                    $("body").toggleClass("mini-navbar");
                    if (!$('body').hasClass('mini-navbar') || $('body').hasClass('body-small')) {
                        // Hide menu in order to smoothly turn on when maximize menu
                        $('#side-menu').hide();
                        // For smoothly turn on menu
                        setTimeout(
                            function () {
                                $('#side-menu').fadeIn(500);
                            }, 100);
                    } else if ($('body').hasClass('fixed-sidebar')) {
                        $('#side-menu').hide();
                        setTimeout(
                            function () {
                                $('#side-menu').fadeIn(500);
                            }, 300);
                    } else {
                        // Remove all inline style from jquery fadeIn function to reset menu state
                        $('#side-menu').removeAttr('style');
                    }
                }
            }
        };
    };


    function closeOffCanvas() {
        return {
            restrict: 'A',
            template: '<a class="close-canvas-menu" ng-click="closeOffCanvas()"><i class="fa fa-times"></i></a>',
            controller: function ($scope, $element) {
                $scope.closeOffCanvas = function () {
                    $("body").toggleClass("mini-navbar");
                }
            }
        };
    }

    /**
     * vectorMap - Directive for Vector map plugin
     */
    function vectorMap() {
        return {
            restrict: 'A',
            scope: {
                myMapData: '='
            },
            link: function (scope, element, attrs) {
                element.vectorMap({
                    map: 'world_mill_en',
                    backgroundColor: "transparent",
                    regionStyle: {
                        initial: {
                            fill: '#e4e4e4',
                            "fill-opacity": 0.9,
                            stroke: 'none',
                            "stroke-width": 0,
                            "stroke-opacity": 0
                        }
                    },
                    series: {
                        regions: [
                            {
                                values: scope.myMapData,
                                scale: ["#1ab394", "#22d6b1"],
                                normalizeFunction: 'polynomial'
                            }
                        ]
                    }
                });
            }
        }
    }


    /**
     * sparkline - Directive for Sparkline chart
     */
    function sparkline() {
        return {
            restrict: 'A',
            scope: {
                sparkData: '=',
                sparkOptions: '='
            },
            link: function (scope, element, attrs) {
                scope.$watch(scope.sparkData, function () {
                    render();
                });
                scope.$watch(scope.sparkOptions, function () {
                    render();
                });
                var render = function () {
                    $(element).sparkline(scope.sparkData, scope.sparkOptions);
                };
            }
        }
    };

    /**
     * icheck - Directive for custom checkbox icheck
     */
    function icheck($timeout) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function ($scope, element, $attrs, ngModel) {
                return $timeout(function () {
                    var value;
                    value = $attrs['value'];

                    $scope.$watch($attrs['ngModel'], function (newValue) {
                        $(element).iCheck('update');
                    })

                    return $(element).iCheck({
                        checkboxClass: 'icheckbox_square-green',
                        radioClass: 'iradio_square-green'

                    }).on('ifChanged', function (event) {
                        if ($(element).attr('type') === 'checkbox' && $attrs['ngModel']) {
                            $scope.$apply(function () {
                                return ngModel.$setViewValue(event.target.checked);
                            });
                        }
                        if ($(element).attr('type') === 'radio' && $attrs['ngModel']) {
                            return $scope.$apply(function () {
                                return ngModel.$setViewValue(value);
                            });
                        }
                    });
                });
            }
        };
    }

    /**
     * ionRangeSlider - Directive for Ion Range Slider
     */
    function ionRangeSlider() {
        return {
            restrict: 'A',
            scope: {
                rangeOptions: '='
            },
            link: function (scope, elem, attrs) {
                elem.ionRangeSlider(scope.rangeOptions);
            }
        }
    }

    /**
     * dropZone - Directive for Drag and drop zone file upload plugin
     */
    function dropZone() {
        return function (scope, element, attrs) {
            element.dropzone({
                url: "/upload",
                maxFilesize: 100,
                paramName: "uploadfile",
                maxThumbnailFilesize: 5,
                init: function () {
                    scope.files.push({file: 'added'});
                    this.on('success', function (file, json) {
                    });
                    this.on('addedfile', function (file) {
                        scope.$apply(function () {
                            alert(file);
                            scope.files.push({file: 'added'});
                        });
                    });
                    this.on('drop', function (file) {
                        alert('file');
                    });
                }
            });
        }
    }

    /**
     * chatSlimScroll - Directive for slim scroll for small chat
     */
    function chatSlimScroll($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                $timeout(function () {
                    element.slimscroll({
                        height: '234px',
                        railOpacity: 0.4
                    });

                });
            }
        };
    }

    /**
     * customValid - Directive for custom validation example
     */
    function customValid() {
        return {
            require: 'ngModel',
            link: function (scope, ele, attrs, c) {
                scope.$watch(attrs.ngModel, function () {

                    // You can call a $http method here
                    // Or create custom validation

                    var validText = "Inspinia";

                    if (scope.extras == validText) {
                        c.$setValidity('cvalid', true);
                    } else {
                        c.$setValidity('cvalid', false);
                    }

                });
            }
        }
    }


    /**
     * fullScroll - Directive for slimScroll with 100%
     */
    function fullScroll($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                $timeout(function () {
                    element.slimscroll({
                        height: '100%',
                        railOpacity: 0.9
                    });

                });
            }
        };
    }

    /**
     *
     * Pass all functions into module
     */
    angular
        .module('iNu')
        .directive('pageTitle', pageTitle)
        .directive('sideNavigation', sideNavigation)
        .directive('iboxTools', iboxTools)
        .directive('minimalizaSidebar', minimalizaSidebar)
        .directive('vectorMap', vectorMap)
        .directive('sparkline', sparkline)
        .directive('icheck', icheck)
        .directive('ionRangeSlider', ionRangeSlider)
        .directive('dropZone', dropZone)
        .directive('responsiveVideo', responsiveVideo)
        .directive('chatSlimScroll', chatSlimScroll)
        .directive('customValid', customValid)
        .directive('fullScroll', fullScroll)
        .directive('closeOffCanvas', closeOffCanvas)
        .directive('numberPicker', numberPicker)
        .directive('focus', focus)
        .directive('buildSection', buildSection)
        .directive('componentInstance', componentInstance) //組件實例視窗
        .directive('modelInstance', modelInstance) //模型實例視窗
        .directive('confirmClick', confirmClick) //刪除確認視窗
        .directive('nestedScroll',nestedScroll)
})();