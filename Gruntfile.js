module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-shell');
    grunt.registerTask('default', ['jshint']);
    grunt.registerTask('travis', 'jshint');
    grunt.registerTask('devTasks', ['shell']); // i.e. grunt devTasks:installAPIExampleData
    grunt.initConfig({
        jshint: {
            // define the files to lint
            files: ['Guntfile.js', 'app.js', 'spider.js', 'config.js', 'lib/**/*.js', 'test/**/*.js', 'public/scripts/api.js', 'public/scripts/api/*.js'],
            // configure JSHint (documented at http://www.jshint.com/docs/)
            options: {jshintrc: '.jshintrc'}
        },
        shell: {                                // Task
            installAPIExampleData: {                   // Target
                options: {                      // Options
                    stdout: true
                },
                command: ['rm -r -f ./public/data', 'git clone https://github.com/lbod/dojo-api-data.git public/data'].join(';')
            }
        }
    });
};
