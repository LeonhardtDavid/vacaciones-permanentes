module.exports = function (grunt) {

    grunt.initConfig({

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

    grunt.loadNpmTasks('grunt-wiredep');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks( 'grunt-contrib-clean' );
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['clean', 'jshint', 'wiredep', 'concat']);

};