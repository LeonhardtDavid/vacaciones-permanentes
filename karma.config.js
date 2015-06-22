module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],


        // list of files / patterns to load in the browser
        files: [
            'https://maps.googleapis.com/maps/api/js?libraries=places&sensor=false',
            'public/lib/jquery/dist/jquery.js',
            'public/lib/angular/angular.js',
            'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
            'public/lib/angular-ui-router/release/angular-ui-router.js',
            'public/lib/moment/moment.js',
            'public/lib/angular-moment/angular-moment.js',
            'public/lib/angular-ui-bootstrap-datetimepicker/datetimepicker.js',
            'public/lib/angular-google-places-autocomplete/src/autocomplete.js',
            'public/lib/lodash/lodash.js',
            'public/lib/angular-google-maps/dist/angular-google-maps.js',
            'public/lib/angular-i18n/angular-locale_es.js',
            'public/javascripts/app.js',

            'public/lib/angular-mocks/angular-mocks.js',
            'specs/**/*.js'
        ],


        // list of files to exclude
        exclude: [],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {},


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['PhantomJS'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true
    });
};