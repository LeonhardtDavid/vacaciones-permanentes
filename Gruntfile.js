module.exports = function(grunt) {

  grunt.initConfig({

    wiredep: {
      task: {
        src: ['target/**/*.html']
      },
      options : {
       ignorePath : "../public" 
      }
    }
  });

  grunt.loadNpmTasks('grunt-wiredep');
  grunt.registerTask('default', ["wiredep"]);
};