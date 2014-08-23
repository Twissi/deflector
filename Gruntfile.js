
/*******************************************************************************

Add to ./.git/hooks/pre-commit (and chmod +x) to enable auto-linting/uglifying:

#!/bin/sh
grunt build
if [ $? -ne 0 ]; then
  exit 1
fi
git add boxer.min.js
exit 0

*******************************************************************************/

module.exports = function(grunt) {
    grunt.initConfig({
        connect: {
            main: {
                options: { base: '.', port: 9999 }
            }
        },
        jshint: {
            main: ['deflector.js', 'deflector.test.js', 'Gruntfile.js']
        },
        'saucelabs-qunit': {
            main: {
                options: {
                    testname: 'deflector tests',
                    tags: ['master'],
                    urls: ['http://127.0.0.1:9999/'],
                    build: process.env.TRAVIS_JOB_ID,
                    browsers: grunt.file.readJSON('browsers.json'),
                    tunnelTimeout: 5,
                    concurrency: 3
                }
            }
        },
        uglify: {
            main: {
                files: {
                    'deflector.min.js': 'deflector.js'
                }
            }
        },
        watch: {
            main: {
                files: ['deflector.js'],
                tasks: ['jshint']
            }
        }
    });

    for (var key in grunt.file.readJSON('package.json').devDependencies) {
        if (key !== 'grunt' && key.indexOf('grunt') === 0) {
            grunt.loadNpmTasks(key);
        }
    }
    grunt.registerTask('devel', ['connect', 'watch']);
    grunt.registerTask('build', ['jshint', 'uglify']);
    grunt.registerTask('test', ['build', 'connect', 'saucelabs-qunit']);
};