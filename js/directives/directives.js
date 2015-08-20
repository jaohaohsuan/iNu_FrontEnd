( function () {
  function buildSection() {
    var directive = {
      restrict: 'E',
      required: '^buildSection',
      scope: {
        datasource: '=',
        titleProperty: '@',
        clearAllText: '@',
        clear: '=',
        itemsProperty: '@',
        itemEditableProperty: '@',
        itemDblclick: '='
      },
      transclude: true,
      templateUrl: 'views/directives/buildSection.html',
      controller: buildSectionController,
      controllerAs: 'buildSectionCtrl',
      bindToController: true
    }

    function buildSectionController() {
      var self = this;
      self.deepFind = deepFind;
      self.itemDoubleClick = itemDoubleClick;
      self.setClass = setClass;

      function deepFind( obj, path ) {
        var paths = path.split( '.' ),
          current = obj,
          i;
        for ( i = 0; i < paths.length; ++i ) {
          if ( current[ paths[ i ] ] == undefined ) return undefined;
          else current = current[ paths[ i ] ];
        }
        return current;
      }

      function itemDoubleClick( section, item ) {
        var editable = deepFind( item, self.itemEditableProperty );
        if ( editable === false || !self.itemDblclick ) return;
        self.itemDblclick( section, item );
      }

      function setClass( index ) {
        var className = [ 'panel panel-primary', 'panel panel-danger', 'panel panel-warning', 'panel panel-info' ];
        return className[ index % className.length ];
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

    function confirmClickLink( scope, element, attrs ) {
      var msg = attrs.confirmClick || "Are you sure";
      var clickAction = scope.confirmedClick;
      element.bind( 'click', function ( event ) {
        if ( window.confirm( msg ) ) {
          scope.$eval( clickAction );
        }
      } );
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

    function componentInstanceController( $scope ) {
      var self = this;
      self.change = change;
      self.changeText = 'changeConfig'; //button顯示名稱，多語系son的key
      self.disableEdit = true;
      self.required = false;

      function change() {

        if ( self.changeText === 'changeConfig' ) {
          self.changeText = 'finished';
          self.disableEdit = false;

        } else {

          if ( !self.textName || !self.textName.length )
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


  function focus( $parse, $timeout ) {
    return {
      link: function ( scope, element, attrs ) {
        var model = $parse( attrs.focus );

        scope.$watch( model, function ( value ) {
          if ( value === true ) {
            $timeout( function () {
              element[ 0 ].focus();
              element.find( 'input' )
                .focus();
            } );
          }
        } );
        element.bind( 'blur', function () {
          scope.$apply( model.assign( scope, false ) );
        } );
      }
    };
  }


  function inject() {
    return {
      restrict: 'A',
      link: function ( scope, element, attrs, ctrl, transcludeFn ) { //目的使transclude的內容使用到isolate-scope,e.g{{item}}
        if ( !transcludeFn ) return;
        transcludeFn( scope, function ( clone ) {
          element.empty();
          element.append( clone );
        } );
      }
    };
  }

  function itemTemplate( $compile ) {
    return {
      restrict: "E",
      transclude: true,
      scope: {},
      template: '<div ng-transclude ></div>',
      link: function ( scope, iElement, iAttr, ctrl, transcludeFn ) {
        var transcludetHtml = iElement.children()
          .html();
        var injectHtml = transcludetHtml.replace( /<([a-z].*?)>/g, '<$1  unselectable="on">' );
        var linkFn = $compile( injectHtml );
        var compileContent = linkFn( scope.$parent );
        compileContent.addClass( 'section-content' );
        iElement.empty();
        iElement.append( compileContent );
      }
    };
  }

  function itemPicker() {
    var directive = {
      restrict: 'E',
      scope: {
        datasource: '='
      },
      templateUrl: 'views/directives/itemPicker.html',
      controller: [ '$scope', itemPickerController ],
      controllerAs: 'itemPickerCtrl',
      bindToController: true
    }

    function itemPickerController( $scope ) {
      var self = this;
      self.matchables = [];
      self.matcheds = [];
      angular.forEach( self.datasource, function ( data ) {
        if ( data.matched === true ) self.matcheds.push( data );
        else self.matchables.push( data );
      } )
    }
    return directive;
  }

  function matchedPreviewGrid() {
    var directive = {
      restrict: 'E',
      scope: {
        datasource: '=',
        playAudio: '=',
        showAudioDetail: '='
      },
      template: '<div ui-grid="matchedReviewGridCtrl.gridOptions" ui-grid-selection ui-grid-auto-resize ui-grid-resize-columns ui-grid-pagination class="matched-review-grid">' + '<h4 ng-show="matchedReviewGridCtrl.datasource.count>0" class="pull-right">{{"matchedCount"|translate}}:{{matchedReviewGridCtrl.datasource.count}}</h4></div>',
      controller: [ '$scope', '$modal', '$translate', matchedReviewGridController ],
      controllerAs: 'matchedReviewGridCtrl',
      bindToController: true

    }
    function matchedReviewGridController( $scope, $modal, $translate ) {
      var self = this;
      self.gridOptions = {
        columnDefs: [
          {
            displayName: '{{"datasourceName"|translate}}',
            field: 'datasourceName',
            headerCellFilter: 'translate',

                    },
          {
            displayName: '{{"serialNumber"|translate}}',
            headerCellFilter: 'translate',
            field: 'serialNumber',
                    },
          {
            displayName: '{{"matchedKeywords"|translate}}',
            headerCellFilter: 'translate',
            field: 'matchedKeywords',
            minWidth: 120
                    },
          {
            displayName: '{{"advanceOperation"|translate}}',
            headerCellFilter: 'translate',
            field: 'advanceOperation',
            cellTemplate: '<div class="matched-view-advance-operation-div"><a class="fa fa-music" ng-click="grid.appScope.playAudio(row.entity)" title="{{grid.appScope.playbackTitle}}"></a><a class="fa fa-file-text" ng-click="grid.appScope.showAudioDetail(row.entity)" title="{{grid.appScope.lookOverTitle}}"></a></div>',
            minWidth: 60

                    }
                ],
        data: self.datasource.items,
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        noUnselect: true,
        paginationPageSize: 10,
        paginationPageSizes: [ 10, 20, 30 ],
        useExternalPagination: true

      };
      $scope.lookOverTitle = $translate.instant( "lookOver" )
      $scope.playAudio = playAudio;
      $scope.playbackTitle = $translate.instant( "playback" )
      $scope.showAudioDetail = showAudioDetail;

      function playAudio( entity ) {
        var modalInstance = $modal.open( {
          backdropClass: 'modal-backdrop',
          controller: [ 'audioHref', 'vttHref', 'highlightKeywords', playVideoController ],
          controllerAs: 'playAudioCtrl',
          size: 'lg',
          template: '<play-audio-file audio-href="playAudioCtrl.audioHref" vtt-href=" playAudioCtrl.vttHref" player="playAudioCtrl.player" keywords="playAudioCtrl.keywords"></play-audio-file>',
          resolve: {
            audioHref: function () {
              return '';
            },
            vttHref: function () {
              return entity.vttHref;
            },
            highlightKeywords: function () {
              return entity.highlight;
            }
          }
        } );

        function playVideoController( audioHref, vttHref, highlightKeywords ) {
          var self = this;
          self.audioHref = audioHref;

          self.keywords = []; //改成由API取得
          setKeywords();

          function setKeywords() {
            var keywordsMap = {};
            angular.forEach( highlightKeywords, function ( highlightKeyword ) {
              var keywords = highlightKeyword.split( /\s+/ ); //以空白切割字串
              var timespan = keywords.shift(); //第一個項目為timespan
              if ( keywordsMap[ timespan ] ) { //以時間當作群組存放關鍵字
                keywordsMap[ timespan ] = keywordsMap[ timespan ].concat( keywords );
              } else {
                keywordsMap[ timespan ] = keywords;
              }
            } )
            Object.keys( keywordsMap )
              .map( function ( timespan ) {
                var uniqueKeywords = keywordsMap[ timespan ].reduce( function ( p, c ) {
                  if ( p.indexOf( c ) < 0 ) p.push( c );
                  return p;
                }, [] ); //去除重複
                var keywordObjArr = uniqueKeywords.map( function ( value ) {
                  return {
                    'keyword': value,
                    'time': timespan
                  };
                } )
                self.keywords = self.keywords.concat( keywordObjArr );
              } )
            self.keywords.sort( function ( a, b ) { //依時間排序關鍵字
              return ( ( a.time <= b.time ) ? -1 : ( a.time > b.time ) ? 1 : 0 );
            } )
          }
          //self.keywords.push({ 'keyword': 'Last2', 'time': '00:07:17.20' })
          //self.keywords.push({ 'keyword': 'Last', 'time': '00:07:18.20' })
          self.vttHref = vttHref;
          modalInstance.result.then( '', modalClosing ); //當modal被關掉時
          function modalClosing() { //modal關閉後清空Wavesurfer
            self.player.empty();
            self.player.destroy();
          }
        }

      }

      function showAudioDetail( entity ) {
        var modalInstance = $modal.open( {
          backdropClass: 'modal-backdrop',
          size: 'lg',
          template: '<h1>123</h1>'
        } )
      }
    }
    return directive
  }

  function modelFilter() { //需修改
    var directive = {
      restrict: 'E',
      scope: {
        datasource: '=',
        tagDisplayProperty: '@',
        tagsPlaceholder: "@",
        queryPlaceholder: '@',
        autoSize: '=',
        doFilter: '='
      },
      templateUrl: 'views/directives/modelFilter.html',
      controller: [ '$element', '$window', '$scope', '$timeout', modelFilterController ],
      controllerAs: 'modelFilterCtrl',
      bindToController: true

    };

    function modelFilterController( $element, $window, $scope, $timeout ) {
      var doFilterTimer;
      var self = this;
      self.filterClick = filterClick;
      self.selectedItems = [];
      self.selectedText = self.tagsPlaceholder;
      self.itemClicked = itemClicked;
      self.modelKeyword = '';
      $scope.$on( '$destroy', destroyListener );

      function changeSelectedText( selectedItems ) {
        if ( selectedItems.length <= 0 ) self.selectedText = self.tagsPlaceholder;
        else {
          self.selectedText = selectedItems.map( function ( elem ) {
              return elem.name;
            } )
            .join( "," );
        }

      }

      function destroyListener( event ) {
        if ( doFilterTimer ) $timeout.cancel( doFilterTimer );
      }

      function filterClick( datasource ) {
        if ( doFilterTimer ) $timeout.cancel( doFilterTimer );
        doFilterTimer = $timeout( function () {
          if ( self.doFilter ) self.doFilter( datasource );
        }, 500 )
      }

      function itemClicked( item ) {
        var idx = self.selectedItems.indexOf( item );
        if ( idx != -1 ) self.selectedItems.splice( idx, 1 );
        else self.selectedItems.push( item );
        if ( self.selectedItems.length > ( $element.parent()
            .width() / 80 ) ) {
          self.selectedText = 'selectedModels';
          //self.overWidth = true;
        } else {
          changeSelectedText( self.selectedItems );
          //self.overWidth = false;
        }

      }

    }

    return directive;
  }

  function modelInstance() {
    var directive = {
      restrict: 'E',
      scope: {
        addTags: '=',
        datasource: '=',
        deleteModel: '=',
        enableModel: '=', //上下線
        isInstance: '=', //是否是實例模式
        isManagement: '=', //是否是模型管理下
        modelName: '=', //另存模型名稱
        doSave: '=', //變更
        doSaveAs: '=', //另存
        selectedEventhandler: '=',
        title: '@'
      },
      templateUrl: 'views/directives/modelInstance.html',
      controller: [ '$scope', '$timeout', modelInstanceController ],
      controllerAs: 'modelInstanceCtrl',
      bindToController: true
    };

    function modelInstanceController( $scope, $timeout ) {
      var selectedTimeout;
      var saveTimeout;
      var self = this;
      self.add = add;
      self.saveConfiguration = saveConfiguration;
      self.changeText = 'changeConfig';
      self.isDisabled = true;
      self.tagClicked = tagClicked;
      self.required = false;
      $scope.$on( '$destroy', destroyListener );

      function add( datasource ) {
        self.isDisabled = false;
        if ( self.addTags ) self.addTags( function () {
          var elem = document.getElementById( 'modelInstanceTags' );
          elem.scrollTop = elem.scrollHeight;
        } );

      }

      function destroyListener( event ) {
        $timeout.cancel( saveTimeout, selectedTimeout );
      }

      function saveConfiguration( datasource ) {
        self.isDisabled = true;
        if ( saveTimeout ) $timeout.cancel( saveTimeout );
        saveTimeout = $timeout( function () { //延遲500毫秒，避免短時間進行儲存動作
          self.doSave( datasource );
        }, 500 )
      }

      function tagClicked( datasource ) {
        self.isDisabled = false;
        if ( selectedTimeout ) $timeout.cancel( selectedTimeout );
        if ( self.selectedEventhandler ) {
          selectedTimeout = $timeout( function () {
            self.selectedEventhandler( datasource );
          } );
        }
      }
    }

    return directive;
  }

  function ngEnter() {
    var directive = function ( scope, element, attrs ) {
      element.bind( 'keydown keypress', function ( event ) {
        if ( event.which === 13 ) {

          scope.$eval( attrs.ngEnter );

          event.preventDefault();
        }
      } );
    };
    return directive;
  }

  function ngRepeatEnd( $timeout ) {
    var directive = function ( scope, ele, att ) {
      if ( scope.$last ) {
        $timeout( function () {
          scope.$emit( 'ngRepeatEnd' )
        } )
      }
    };
    return directive;
  }

  function nestedScroll() {
    var directive =
      function ( scope, element ) {
        element.on( 'mousewheel DOMMouseScroll', function ( e ) {
          var e0 = e.originalEvent || e,
            delta = e0.wheelDelta || -e0.deltaY || -1;
          this.scrollTop += ( delta < 0 ? 1 : -1 ) * 30;
          e.preventDefault();
        } );
      }
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
      template: '<div class="number-picker"><input type="text" size="{{size||2}}" ng-model="number" ng-change="setInt(number)" value="0"  class="number-input  text-center" onkeypress="return event.charCode >= 48 && event.charCode <= 57"/><div class="number-arrow"><span><a href="javascript: void(0)" ng-click="up()" class="fa fa-caret-up fa-2x"></a></span><span><a href="javascript: void(0)" ng-click="down()" class="fa fa-caret-down fa-2x"></a></span></div></div>'

    };

    function numberPickerController( $scope, $element ) {
      $scope.down = down;
      $scope.setInt = setInt;
      $scope.up = up;
      $element.bind( "mousewheel", function ( event, delta ) {
        if ( delta > 0 ) up();
        else down();
        $scope.$apply();
        return false;
      } );

      function down() {
        if ( $scope.number > 0 ) $scope.number--;
      }

      function setInt( number ) {
        $scope.number = parseInt( number );
      }

      function up() {
        $scope.number++;
      }
    }

    return directive;
  }

  function playAudioFile() {
    var directive = {
      restrict: 'E',
      templateUrl: 'views/directives/playAudioFile.html',
      scope: {
        audioHref: '=', //音檔位置
        vttHref: '=', //VTT位置
        player: '=', //讓player可以對外
        keywords: '=' //音檔關鍵字
      },
      controller: [ '$scope', '$http', '$translate', '$q', '$timeout', '$element', playAudioFileController ],
      controllerAs: 'playAudioFileCtrl',
      bindToController: true
    }

    function playAudioFileController( $scope, $http, $translate, $q, $timeout, $element ) {
      var cuesId = []; //存放cuesId的陣列
      var cueDiv; //.cue-div element
      var floorDecimalPlaces = 2; //小數點後N位，前端固定無條件捨去到小數點第二位。
      var maxStartTimeSeconds = {}; //存放字幕起始時間中，相同秒數的最大值
      var preSecond = -1; //紀錄播放中的上一秒
      var speed = 1; //播放速度
      var tempVolume; //存放調靜音時的temp音量
      var track; //track element
      var volume = 1; //播放音量
      var self = this;
      self.autoScroll = true;
      self.changeCue = changeCue; //點下cue後(字幕)
      self.cues = [];
      self.currentCue = true;
      self.goBackward = goBackward; //倒帶
      self.goBackwardFast = goBackwardFast; //減速
      self.goDownVolume = goDownVolume; //降音量
      self.goForward = goForward; //快轉
      self.goForwardFast = goForwardFast; //加速
      self.goUpVolume = goUpVolume; //增音量
      self.mute = mute; //靜音
      self.pannerValue = 0;
      self.perWidthSecond = 0;
      self.playPause = playPause; //暫停或播放
      self.playPauseText = $translate.instant( 'play' );
      self.playing = false;
      self.seekTo = seekTo; //點擊音波切換時間
      self.setHtmltoCue = setHtmltoCue; //將cue換成HTML
      self.setPanner = setPanner; //設定左右聲道
      self.showAudioContoller = false; //show按鈕區塊
      self.showSpeed = false; //show 速度狀態


      $scope.$on( 'wavesurferInit', getWavesurfer ); //當wavesurfer準備好後
      $scope.$on( 'ngRepeatEnd', setKeywordsPosition ) //keywords repeat完後
      function changeCue( cue ) {
        self.player.seekTo( cue.startTime / self.player.getDuration() )
      }

      function floorDecimal( num, places ) { //無條件捨去小數點N位
        var deciman = Math.pow( 10, places );
        return Math.floor( num * deciman ) / deciman;
      }

      function goBackward() {
        self.player.skipBackward();
        self.showSpeed = true;
      }

      function goBackwardFast( value ) {
        speed = speed - value < 0.1 ? 0.1 : speed - value
        self.player.setPlaybackRate( speed.toFixed( 1 ) );
      }

      function goDownVolume( value ) {
        volume = volume - value < 0.1 ? 0 : volume - value;
        self.player.setVolume( volume )
      }

      function goForward() {
        self.player.skipForward();
        if ( self.player.getCurrentTime() === self.player.getDuration() || self.player.getCurrentTime() === 0 ) {
          if ( self.player.isPlaying() ) {
            self.player.play();
          } else {
            self.player.seekTo( 0 );
          }
        }
      }

      function goForwardFast( value ) {
        if ( speed >= 0.1 ) {
          speed = speed + value;
          self.player.setPlaybackRate( speed.toFixed( 1 ) );
          self.showSpeed = true;
        }
      }

      function goUpVolume( value ) {
        volume = volume + value > 1 ? 1 : volume + value;
        self.player.setVolume( volume )
      }




      function mute() {

        if ( volume === 0 ) { //當靜音時恢復原本的音量
          self.player.setVolume( tempVolume );
          volume = tempVolume;
        } else {
          self.player.setVolume( 0 );
          tempVolume = volume; //暫存原本的音量
          volume = 0;
        }
      }

      function playPause() {
        if ( self.player.isPlaying() ) { //當播放時
          self.playPauseText = $translate.instant( 'play' );
          self.player.pause();
          self.playing = false;
        } else {
          self.playPauseText = $translate.instant( 'pause' );
          self.player.play();
          self.playing = true;
        }
      }

      function seekTo( second ) {
        second = hmsfToSeconds( second );
        self.player.seekTo( second / self.player.getDuration() ); //切換
      }

      function setPanner() { //設定左右聲道
        var xDeg = parseInt( self.pannerValue );
        var zDeg = xDeg + 90;
        if ( zDeg > 90 ) {
          zDeg = 180 - zDeg;
        }
        var x = Math.sin( xDeg * ( Math.PI / 180 ) );
        var z = Math.sin( zDeg * ( Math.PI / 180 ) );
        //var source = self.player.backend.ac.createBufferSource();
        var panner = self.player.backend.ac.createPanner();
        panner.setPosition( x, 0, z );
        self.player.backend.setFilter( panner );
      }

      function setHtmltoCue( index, cue ) {

        var incue = angular.element( '#cue' + index ); //由ID取得當前repeat到的
        if ( incue[ 0 ].innerText == '' ) { //如果有取到且裡面的內容是空白
          //console.log(cue.getCueAsHTML())
          $( incue )
            .append( cue.getCueAsHTML() ); //就將目前的cue的內容加進去

          cuesId.push( incue[ 0 ].id );
        }
      }

      /////////////不綁定區///////////////
      function getVtt( vttHref ) {
        var deferred = $q.defer();
        var cues = [];
        $http.get( vttHref )
          .success( function ( data, status, headers, config ) { //取得VTT內容
            var parser = new WebVTT.Parser( window, WebVTT.StringDecoder() );
            parser.oncue = function ( cue ) {
              cues.push( cue );
            };
            parser.parse( data );
            parser.flush();
            maxStartTimeSeconds = {};
            angular.forEach( cues, function ( cue ) {
              var startTimeSecond = Math.floor( cue.startTime ); //取出字幕起始時間的秒數
              if ( !maxStartTimeSeconds[ startTimeSecond ] ) { //以秒數當key進行初始化
                maxStartTimeSeconds[ startTimeSecond ] = -1;
              }
              if ( floorDecimal( cue.startTime, floorDecimalPlaces ) > maxStartTimeSeconds[ startTimeSecond ] ) { //以無條件捨去N位當作判斷依據
                maxStartTimeSeconds[ startTimeSecond ] = floorDecimal( cue.startTime, floorDecimalPlaces ); //無條件捨去到小數點2位
              }
            } )


            deferred.resolve( cues );


          } )
          .error( function ( data, status, headers, config ) {
            deferred.reject( data );
          } )
        return deferred.promise;
      }

      function getScrollHeight( index ) { //當前cue的index
        var scrollHeight = 0;
        if ( index > 0 ) {
          for ( var i = 0; i < index; i++ ) {
            var currentCueElementHeight = $( '#' + cuesId[ i ] )
              .outerHeight(); //取得當前綁定cue的element的高度
            scrollHeight += currentCueElementHeight + 10; //+10 為加上 上下的間距
          }
        }
        return Math.ceil( scrollHeight ) - 50; //讓字幕不會固定在第一行
        //return Math.ceil(scrollHeight -  ((tempHeight - perScrollHeight < 0 ? 0 : tempHeight - perScrollHeight) * count));
        //return perScrollHeight * 7 * ((index + 1) / 8);

      }

      function getWavesurfer( e, wavesurfer ) { //接收到wavesurfer廣播後
        self.player = wavesurfer; //指定Wavesurfer
        cueDiv = document.getElementsByClassName( 'cue-div' ); //取到cue存放的div
        if ( !self.audioHref ) {
          $timeout( getVtt( self.vttHref )
            .then( function ( data ) {
              self.cues = data;
              if ( !self.audioHref ) { //如果沒有音檔來源，則以字幕的最後時間點產生假音檔
                var audioContext = self.player.backend.ac;
                var bufferSize = self.cues[ self.cues.length - 1 ].endTime * audioContext.sampleRate,
                  noiseBuffer = audioContext.createBuffer( 1, bufferSize, audioContext.sampleRate ),
                  output = noiseBuffer.getChannelData( 0 );
                for ( var i = 0; i < bufferSize; i++ ) {
                  output[ i ] = 0;
                }
                var source = audioContext.createBufferSource(); //創建來源
                source.buffer = noiseBuffer; //設定產生出來的buffer
                self.player.backend.buffer = noiseBuffer;
                self.player.backend.ac = audioContext;
                self.insideKeywords = angular.copy( self.keywords )
                self.player.empty();
                self.player.drawBuffer();
                self.perWidthSecond = self.player.drawer.width / self.player.getDuration();
                self.showAudioContoller = true;
              }
            }, function ( data ) {} ) );
        }
        self.player.setVolume( volume );
        self.player.setPlaybackRate( speed );
        self.player.on( 'ready', onReady ); //Wavesurfer ready後綁定字幕
        self.player.on( 'finish', onFinish ); //當播放完畢時
        self.player.on( 'seek', onSeek ); //當點選音波時
        self.player.on( 'audioprocess', onAudioProcess ); //當檔處理時

      }

      function hmsfToSeconds( str ) {
        var p = str.split( ':' ),
          result = 0,
          seconds = 1;

        while ( p.length > 0 ) {
          result += seconds * p.pop();
          seconds *= 60;
        }
        return result;
      }

      function markedhighlight( cues, currentTime ) { //標記highlight
        //                if (!currentTime) return;

        $timeout( function () {
          currentTime = currentTime.toFixed( floorDecimalPlaces ) //無條件捨去到小數點N位
          if ( currentTime <= cues[ 0 ].startTime ) { //目前時間小於cues的第一筆時，將scroll top 拉到最前面
            if ( cueDiv[ 0 ] ) {
              cueDiv[ 0 ].scrollTop = 0;
            }
          }
          var search = {
            searched: false
          };
          for ( var idx = cues.length - 1; idx >= 0; idx-- ) { //由後往前搜尋並標記
            var cue = cues[ idx ];
            cue.highlight = false; //尚未搜尋到之前都將highlight設為false
            if ( !search.searched ) {
              if ( currentTime >= floorDecimal( cue.startTime, floorDecimalPlaces ) ) { //目前時間 >= cue的起始時間代表已搜尋到
                search.searched = true;
                if ( self.autoScroll ) $( cueDiv )
                  .animate( {
                    scrollTop: getScrollHeight( idx )
                  } )
              }
            }
            if ( search.searched ) cue.highlight = true; //已經搜尋到的cues之後都標記highlight
          }
        } )

      }

      function onAudioProcess( time ) {
        var currentSecond = Math.floor( time ); //取得秒數
        var maxStartTime = maxStartTimeSeconds[ currentSecond ]; //根據秒為單位，取得該秒內最大值
        //判斷前一秒與這一秒不相同時且取該秒內最大值進行highlight
        if ( maxStartTime && preSecond != currentSecond && time >= maxStartTime ) {
          markedhighlight( self.cues, self.player.getCurrentTime() );
          preSecond = currentSecond;
        }
      }

      function onFinish() {
        self.playing = false;
        self.player.stop();
        markedhighlight( self.cues, self.player.getCurrentTime() );
        resetCueDivScrollTop();
        $scope.$apply();
      }

      function onReady() {
        //track = $('#track').get(0).track;
        self.perWidthSecond = self.player.drawer.width / self.player.getDuration();
        self.insideKeywords = angular.copy( self.keywords )


        getVtt( self.vttHref )
          .then( function ( data ) {
            self.cues = data;
          }, function ( data ) {} )

        self.showAudioContoller = true;
        if ( !$scope.$$phase ) {
          $scope.$apply();
        }
      }

      function onSeek() {
        markedhighlight( self.cues, self.player.getCurrentTime() );
      }

      function resetCueDivScrollTop() {
        if ( self.autoScroll ) {
          cueDiv[ 0 ].scrollTop = 0;
        }
      }

      function setKeywordsPosition() {

        var videoKeywordDivName = '#video-keywords';
        var maxPosition = -1;
        var lastPosition = 0;
        var inSameCueCount = 1; //同一段裡面的關鍵字數量
        var inWaveKeywordSpan = [];
        var overWaveKeywordSpan = [];
        var currentTime = 0;
        var keywordReplaceCount = 0;
        for ( var i = 0; i < self.keywords.length; i++ ) {
          var keyword = self.keywords[ i ];
          var currentSpan = $( videoKeywordDivName + i ); //取得目前div內的span元素
          var appendDiv = $( videoKeywordDivName + ( i - 1 ) ); //根據appendId取得div
          var leftPosition = hmsfToSeconds( keyword.time ) * self.perWidthSecond; //計算關鍵字起始位置
          //if (hmsfToSeconds(keyword.time) === currentTime) {
          //    keywordReplaceCount++;
          //    currentSpan.css({ top: currentSpan.outerHeight() * keywordReplaceCount});//設定正確位置
          //    currentSpan.css({ left: leftPosition });//設定正確位置
          //} else {
          if ( lastPosition == leftPosition + currentSpan.outerWidth() ) {
            inSameCueCount++;
          } else {
            inSameCueCount = 1;
          }
          if ( leftPosition + ( currentSpan.outerWidth() * inSameCueCount ) > self.player.drawer.width ) { //當關鍵字超出音坡時 鎖在音波範圍內
            leftPosition -= currentSpan.outerWidth()
            overWaveKeywordSpan.push( currentSpan ); //紀錄超出音波的關鍵字
          } else if ( leftPosition < lastPosition ) { //如果重複時
            leftPosition = lastPosition + 1;
            inWaveKeywordSpan.push( currentSpan );
          } else {
            inWaveKeywordSpan.push( currentSpan );
          }
          currentSpan.css( {
            left: leftPosition
          } ); //設定正確位置
          //}

          lastPosition = leftPosition + currentSpan.outerWidth()
          currentTime = hmsfToSeconds( keyword.time );
          //if (maxPosition < lastPosition) maxPosition = lastPosition;//設定長度最長的位置
        }

        if ( overWaveKeywordSpan.length > 0 ) {
          for ( var j = overWaveKeywordSpan.length - 1; j >= 0; j-- ) {
            if ( j - 1 >= 0 ) {
              var overWaveLeftPosition = $( overWaveKeywordSpan[ j ] )
                .position()
                .left //取得倒數第j個的left
              var overWaveLastPosition = $( overWaveKeywordSpan[ j - 1 ] )
                .position()
                .left + $( overWaveKeywordSpan[ j - 1 ] )
                .outerWidth(); //取得倒數第j-1個left+width
              if ( overWaveLastPosition > overWaveLeftPosition ) { //當有重疊時
                $( overWaveKeywordSpan[ j - 1 ] )
                  .css( {
                    left: overWaveLeftPosition - ( $( overWaveKeywordSpan[ j - 1 ] )
                      .outerWidth() + 5 )
                  } ) //設定倒數第j-1個的left
              }

            }
          }
          if ( inWaveKeywordSpan.length > 0 ) {
            var inWaveLastPosition = $( inWaveKeywordSpan[ inWaveKeywordSpan.length - 1 ] )
              .position()
              .left;
            for ( var k = inWaveKeywordSpan.length - 1; k >= 0; k-- ) {
              var inWaveLeftPosition = $( inWaveKeywordSpan[ k ] )
                .position()
                .left + $( inWaveKeywordSpan[ k ] )
                .outerWidth();
              var lastOutWaveKeywordSpanPosition = $( overWaveKeywordSpan[ 0 ] )
                .position()
                .left;
              if ( inWaveLeftPosition > lastOutWaveKeywordSpanPosition ) {
                $( inWaveKeywordSpan[ k ] )
                  .css( {
                    left: $( overWaveKeywordSpan[ 0 ] )
                      .position()
                      .left - $( overWaveKeywordSpan[ 0 ] )
                      .outerWidth() + 2
                  } );
              }
              inWaveLastPosition = $( overWaveKeywordSpan[ 0 ] )
                .position()
                .left;
            }
          }

        }


      }


    }
    return directive;
  }

  function setClassWithWidth() {
    var directive = {
      scope: {
        baseWidth: '@',
        moreWidthClass: '@',
        lessWidthClass: '@'
      },
      link: setClassWithWidthLink
    }

    function setClassWithWidthLink( scope, ele ) {
      scope.$watch( function () {
        return window.innerWidth;
      }, function ( innerWidth ) {
        setClass( innerWidth )
      } )

      function setClass( innerWidth ) {
        ele.removeClass()
        if ( innerWidth >= scope.baseWidth ) {
          ele.addClass( scope.moreWidthClass )
        } else {
          ele.addClass( scope.lessWidthClass )

        }
      }

    }

    return directive;
  }

  function singleRadioSelect() {
    var directive = {
      restrict: 'E',
      scope: {
        datasource: '=',
        selectedItem: '='
      },
      templateUrl: 'views/directives/singleModelGroupSelect.html',
      controller: singleModelGroupSelectController,
      controllerAs: 'singleModelGroupSelectCtrl',
      bindToController: true
    }

    function singleModelGroupSelectController() {
      var self = this;
    }
    return directive;
  }

  function wavesurfer() {
    var direcvive = {
      restrict: 'E',
      //scope: {
      //    onSeek: '=',
      //    onReady:'=',
      //    player: '='
      //},
      link: wavesurferLink
    }

    function wavesurferLink( scope, ele, att ) {
      ele.css( 'display', 'block' );

      var options = angular.extend( {
        container: ele[ 0 ],
        waveColor: 'violet',
        progressColor: 'purple'
      }, att );
      var wavesurfer = WaveSurfer.create( options );
      if ( att.url ) {
        wavesurfer.load( att.url, att.data || null );
      }
      scope.$emit( 'wavesurferInit', wavesurfer );
      //scope.player = wavesurfer;
      //
      //wavesurfer.on('ready', function () {
      //    scope.$eval(scope.onReady);
      //})
      //wavesurfer.on('seek', function (e) {
      //    scope.$eval(scope.onSeek);
      //    //var lowpass = wavesurfer.backend.ac.createBiquadFilter();
      //    //console.log(lowpass)
      //    //wavesurfer.backend.setFilter(lowpass);
      //})
    }

    return direcvive;
  }

  function wavesurferTimeLine() {
    var directive = {
      restrict: 'E',
      scope: {
        wavesurfer: '='
      },
      link: wavesurferTimeLineLink
    }

    function wavesurferTimeLineLink( scope, ele, att ) {
      var timeline = Object.create( WaveSurfer.Timeline );
      timeline.init( {
        wavesurfer: scope.wavesurfer,
        container: ele[ 0 ]
      } );
    }
    return directive;
  }
  ///////////////////////////////////////////////////////////////
  function pageTitle( $rootScope, $translate ) {
    var directive = {
      link: function ( scope, ele ) {
        var listener = function ( event, toState, toParams, fromState, fromParams ) {
          var title = 'INU';
          $translate( title )
            .then( function ( translate ) {
              title = translate;
              ele.text( title );
            } );
          if ( toState.data && toState.data.title ) {
            $translate( toState.data.title )
              .then( function ( translate ) { //?t?X?h?y?t
                title = translate;
                ele.text( title );
              } );
          }
        };
        $rootScope.$on( '$stateChangeStart', listener );
        $rootScope.$on( '$translateChangeSuccess', listener );
      }
    };
    return directive;
  }

  /**
   * sideNavigation - Directive for run metsiMenu on sidebar navigation
   */
  function sideNavigation( $timeout ) {
    return {
      restrict: 'A',
      link: function ( scope, element ) {
        // Call the metsiMenu plugin and plug it to sidebar navigation
        $timeout( function () {
          element.metisMenu();

        } );
      }
    };
  };

  /**
   * responsibleVideo - Directive for responsive video
   */
  function responsiveVideo() {
    return {
      restrict: 'A',
      link: function ( scope, element ) {
        var figure = element;
        var video = element.children();
        video
          .attr( 'data-aspectRatio', video.height() / video.width() )
          .removeAttr( 'height' )
          .removeAttr( 'width' )

        //We can use $watch on $window.innerWidth also.
        $( window )
          .resize( function () {
            var newWidth = figure.width();
            video
              .width( newWidth )
              .height( newWidth * video.attr( 'data-aspectRatio' ) );
          } )
          .resize();
      }
    }
  }

  /**
   * iboxTools - Directive for iBox tools elements in right corner of ibox
   */
  function iboxTools( $timeout ) {
    return {
      restrict: 'A',
      scope: true,
      templateUrl: 'views/common/ibox_tools.html',
      controller: function ( $scope, $element ) {
        // Function for collapse ibox
        $scope.showhide = function () {
            var ibox = $element.closest( 'div.ibox' );
            var icon = $element.find( 'i:first' );
            var content = ibox.find( 'div.ibox-content' );
            content.slideToggle( 200 );
            // Toggle icon from up to down
            icon.toggleClass( 'fa-chevron-up' )
              .toggleClass( 'fa-chevron-down' );
            ibox.toggleClass( '' )
              .toggleClass( 'border-bottom' );
            $timeout( function () {
              ibox.resize();
              ibox.find( '[id^=map-]' )
                .resize();
            }, 50 );
          },
          // Function for close ibox
          $scope.closebox = function () {
            var ibox = $element.closest( 'div.ibox' );
            ibox.remove();
          }
      }
    };
  };

  /**
   * minimalizaSidebar - Directive for minimalize sidebar
   */
  function minimalizaSidebar( $timeout ) {
    return {
      restrict: 'A',
      template: '<a class="navbar-minimalize minimalize-styl-2 btn btn-primary " href="" ng-click="minimalize()"><i class="fa fa-bars"></i></a>',
      controller: function ( $rootScope, $scope, $element ) {

        $scope.minimalize = function () {
          $rootScope.$broadcast( 'minimalizaSidebar' )
          $( "body" )
            .toggleClass( "mini-navbar" );
          if ( !$( 'body' )
            .hasClass( 'mini-navbar' ) || $( 'body' )
            .hasClass( 'body-small' ) ) {
            // Hide menu in order to smoothly turn on when maximize menu
            $( '#side-menu' )
              .hide();
            // For smoothly turn on menu
            setTimeout(
              function () {
                $( '#side-menu' )
                  .fadeIn( 500 );
              }, 100 );
          } else if ( $( 'body' )
            .hasClass( 'fixed-sidebar' ) ) {
            $( '#side-menu' )
              .hide();
            setTimeout(
              function () {
                $( '#side-menu' )
                  .fadeIn( 500 );
              }, 300 );
          } else {
            // Remove all inline style from jquery fadeIn function to reset menu state
            $( '#side-menu' )
              .removeAttr( 'style' );
          }
        }

        if ( window.innerWidth < 1025 ) {
          $scope.minimalize();
        }
      }
    };
  };


  function closeOffCanvas() {
    return {
      restrict: 'A',
      template: '<a class="close-canvas-menu" ng-click="closeOffCanvas()"><i class="fa fa-times"></i></a>',
      controller: function ( $scope, $element ) {
        $scope.closeOffCanvas = function () {
          $( "body" )
            .toggleClass( "mini-navbar" );
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
      link: function ( scope, element, attrs ) {
        element.vectorMap( {
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
                scale: [ "#1ab394", "#22d6b1" ],
                normalizeFunction: 'polynomial'
                            }
                        ]
          }
        } );
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
      link: function ( scope, element, attrs ) {
        scope.$watch( scope.sparkData, function () {
          render();
        } );
        scope.$watch( scope.sparkOptions, function () {
          render();
        } );
        var render = function () {
          $( element )
            .sparkline( scope.sparkData, scope.sparkOptions );
        };
      }
    }
  };

  /**
   * icheck - Directive for custom checkbox icheck
   */
  function icheck( $timeout ) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function ( $scope, element, $attrs, ngModel ) {
        return $timeout( function () {
          var value;
          value = $attrs[ 'value' ];

          $scope.$watch( $attrs[ 'ngModel' ], function ( newValue ) {
            $( element )
              .iCheck( 'update' );
          } )

          return $( element )
            .iCheck( {
              checkboxClass: 'icheckbox_square-green',
              radioClass: 'iradio_square-green'

            } )
            .on( 'ifChanged', function ( event ) {
              if ( $( element )
                .attr( 'type' ) === 'checkbox' && $attrs[ 'ngModel' ] ) {
                $scope.$apply( function () {
                  return ngModel.$setViewValue( event.target.checked );
                } );
              }
              if ( $( element )
                .attr( 'type' ) === 'radio' && $attrs[ 'ngModel' ] ) {
                return $scope.$apply( function () {
                  return ngModel.$setViewValue( value );
                } );
              }
            } );
        } );
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
      link: function ( scope, elem, attrs ) {
        elem.ionRangeSlider( scope.rangeOptions );
      }
    }
  }

  /**
   * dropZone - Directive for Drag and drop zone file upload plugin
   */
  function dropZone() {
    return function ( scope, element, attrs ) {
      element.dropzone( {
        url: "/upload",
        maxFilesize: 100,
        paramName: "uploadfile",
        maxThumbnailFilesize: 5,
        init: function () {
          scope.files.push( {
            file: 'added'
          } );
          this.on( 'success', function ( file, json ) {} );
          this.on( 'addedfile', function ( file ) {
            scope.$apply( function () {
              alert( file );
              scope.files.push( {
                file: 'added'
              } );
            } );
          } );
          this.on( 'drop', function ( file ) {
            alert( 'file' );
          } );
        }
      } );
    }
  }

  /**
   * chatSlimScroll - Directive for slim scroll for small chat
   */
  function chatSlimScroll( $timeout ) {
    return {
      restrict: 'A',
      link: function ( scope, element ) {
        $timeout( function () {
          element.slimscroll( {
            height: '234px',
            railOpacity: 0.4
          } );

        } );
      }
    };
  }

  /**
   * customValid - Directive for custom validation example
   */
  function customValid() {
    return {
      require: 'ngModel',
      link: function ( scope, ele, attrs, c ) {
        scope.$watch( attrs.ngModel, function () {

          // You can call a $http method here
          // Or create custom validation

          var validText = "Inspinia";

          if ( scope.extras == validText ) {
            c.$setValidity( 'cvalid', true );
          } else {
            c.$setValidity( 'cvalid', false );
          }

        } );
      }
    }
  }


  /**
   * fullScroll - Directive for slimScroll with 100%
   */
  function fullScroll( $timeout ) {
    return {
      restrict: 'A',
      link: function ( scope, element ) {
        $timeout( function () {
          element.slimscroll( {
            height: '100%',
            railOpacity: 0.9
          } );

        } );
      }
    };
  }

  /**
   *
   * Pass all functions into module
   */
  angular
    .module( 'iNu' )
    .directive( 'pageTitle', pageTitle )
    .directive( 'sideNavigation', sideNavigation )
    .directive( 'iboxTools', iboxTools )
    .directive( 'minimalizaSidebar', minimalizaSidebar )
    .directive( 'vectorMap', vectorMap )
    .directive( 'sparkline', sparkline )
    .directive( 'icheck', icheck )
    .directive( 'ionRangeSlider', ionRangeSlider )
    .directive( 'dropZone', dropZone )
    .directive( 'responsiveVideo', responsiveVideo )
    .directive( 'chatSlimScroll', chatSlimScroll )
    .directive( 'customValid', customValid )
    .directive( 'fullScroll', fullScroll )
    .directive( 'closeOffCanvas', closeOffCanvas )
    .directive( 'numberPicker', numberPicker )
    .directive( 'focus', focus )
    .directive( 'buildSection', buildSection ) //查詢條件區塊
    .directive( 'componentInstance', componentInstance ) //組件實例視窗
    .directive( 'confirmClick', confirmClick ) //刪除確認視窗
    .directive( 'modelFilter', modelFilter ) //下拉多選
    .directive( 'inject', inject )
    .directive( 'itemTemplate', itemTemplate )
    .directive( 'modelInstance', modelInstance ) //模型實例視窗
    .directive( 'ngEnter', ngEnter )
    .directive( 'nestedScroll', nestedScroll )
    .directive( 'setClassWithWidth', setClassWithWidth )
    .directive( 'wavesurfer', wavesurfer ) //音波圖
    .directive( 'wavesurferTimeLine', wavesurferTimeLine ) //音波圖時間軸
    .directive( 'ngRepeatEnd', [ '$timeout', ngRepeatEnd ] )
    .directive( 'playAudioFile', playAudioFile ) //播放音檔內容
    .directive( 'matchedPreviewGrid', matchedPreviewGrid ) //瀏覽音檔Grid
    .directive( 'itemPicker', itemPicker )
    .directive( 'singleRadioSelect', singleRadioSelect )
} )();
