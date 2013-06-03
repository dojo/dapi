module.exports = function(grunt) {
//grunt.registerTask('default', ['jshint']);
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.registerTask('default', ['jshint']);
grunt.registerTask('travis', 'jshint');

  grunt.initConfig({
    jshint: {
      // define the files to lint
      files: ['Guntfile.js', 'app.js', 'spider.js', 'appConfig.js', 'lib/**/*.js', 'test/**/*.js', 'public/scripts/api.js', 'public/scripts/api/*.js'],
      jshintrc : "jshint.config",
      // configure JSHint (documented at http://www.jshint.com/docs/)
      options: {jshintrc: 'jshint.config'}
      }
   });
};
