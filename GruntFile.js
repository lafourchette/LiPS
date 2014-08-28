module.exports = function(grunt) {

    grunt.initConfig({
        jsdoc : grunt.file.readJSON('grunt/jsdoc.json')
    });

    grunt.loadNpmTasks('grunt-jsdoc');

    grunt.registerTask('default', ['jsdoc']);
};