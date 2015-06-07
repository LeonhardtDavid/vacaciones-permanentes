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
                ignorePath: "..",
                exclude: [
                    'bower_components/bootstrap/',
                    'bower_components/angular-google-places-autocomplete/dist/autocomplete.min.js',
                    'bower_components/angular-google-places-autocomplete/dist/autocomplete.min.css'
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
            all: ['Gruntfile.js', 'public/javascripts/*']
        }

    });

    grunt.loadNpmTasks('grunt-wiredep');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks( 'grunt-contrib-clean' );
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['clean', 'jshint', 'wiredep', 'concat']);

};