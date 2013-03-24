module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      dist: {
        src: ['src/main.js', 'src/router.js', 'src/controller.js', 'src/model.js', 'src/modelCollection.js', 'src/eventBus.js', ],
        dest: 'build/jmvc.js'
      }
    },
    uglify: {
      options: {
        compress: true,
        banner: '/* JMVC (https://github.com/rbpinheiro/jmvc) */\n'
      },
      my_target: {
        files: {
          'build/jmvc.js': ['build/jmvc.js']
        }
      }
    }
    
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['concat', 'uglify']);

};