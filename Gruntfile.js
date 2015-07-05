module.exports = function (grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        karma: {
            unit: {
                configFile: 'karma.config.js'
            }
        },

        protractor: {
            options: {
                configFile: 'protractorConf.js',//"node_modules/protractor/example/conf.js", // Default config file
                keepAlive: false, // If false, the grunt process stops when the test fails.
                noColor: false, // If true, protractor will not use colors in its output.
                args: {
                    // Arguments passed to the command
                }
            },
            all: {   // Grunt requires at least one target to run so you can simply put 'all: {}' here too.
                options: {
                    // configFile: "e2e.conf.js", // Target-specific config file
                    args: {} // Target-specific arguments
                }
            }
        },

        clean: {
            build: {
                dot: true,
                src: [ 'public/javascripts/app.js' ]
            }
        },

        wiredep: {
            task: {
                src: ['views/*.ejs']
            },
            options: {
                ignorePath: "../public",
                exclude: [
                    'public/lib/bootstrap/',
                    'public/lib/angular-google-places-autocomplete/dist/autocomplete.min.js',
                    'public/lib/angular-google-places-autocomplete/dist/autocomplete.min.css'
                ]
            }
        },

        concat: {
            js: {
                //options: {
                //    separator: '\n'
                //},
                src: ['public/javascripts/*.js'],
                dest: 'public/javascripts/app.js'
            }
        },

        jshint: {
            all: ['*.js', 'public/javascripts/*', 'routes/*', 'models/*', 'config/*']
        }

    });

    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-protractor-runner');
    grunt.loadNpmTasks('grunt-wiredep');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('test', ['karma']);
    grunt.registerTask('generate', ['clean', 'jshint', 'wiredep', 'concat']);
    grunt.registerTask('default', ['generate', 'test']);

};
