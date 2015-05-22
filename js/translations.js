/**
 * INSPINIA - Responsive Admin Theme
 * Copyright 2015 Webapplayers.com
 *
 */
function config($translateProvider) {


    $translateProvider.useStaticFilesLoader({
        prefix:'../language/locale-',
        suffix:'.json'
    });
    $translateProvider.preferredLanguage('en');
    //$translateProvider.translations('en', translateEn);
    //$translateProvider.translations('ch', translateCh);
    //$translateProvider.preferredLanguage('en');
    //$translateProvider.fallbackLanguage('Ch');
    $translateProvider.registerAvailableLanguageKeys(['en','ch'],{
        'en_US':'en',
        'zh_TW':'ch',
        'zh_CN':'ch'
    });
}

angular
    .module('iNu')
    .config(config)
