module.exports = function(grunt) {
//grunt.registerTask('default', ['jshint']);
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.registerTask('default', ['jshint']);
grunt.registerTask('travis', 'jshint');

  grunt.initConfig({
    jshint: {
      // define the files to lint
      files: ['Guntfile.js', 'app.js', 'lib/**/*.js', 'test/**/*.js'],
      jshintrc : "jshint.config",
      // configure JSHint (documented at http://www.jshint.com/docs/)
      options: {jshintrc: 'jshint.config'
        }
      }
   })
      
};
