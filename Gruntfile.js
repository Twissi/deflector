
/*******************************************************************************

Add to .git/hooks/pre-commit (and chmod +x) to enable auto-linting/uglifying:

#!/bin/sh
grunt build
if [ $? -ne 0 ]; then
  exit 1
fi
git add deflector.min.js
exit 0

*******************************************************************************/

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        connect: {
            all: { options: { base: '.', port: 9999 }}
        },
        jshint: {
            all: ['deflector.js', 'deflector.test.js', 'Gruntfile.js']
        },
        qunit: {
            all: ['index.html']
        },
        'saucelabs-qunit': {
            all: {
                options: {
                    testname: '<%= pkg.name %> tests',
                    tags: ['master'],
                    urls: ['http://127.0.0.1:9999/'],
                    build: process.env.TRAVIS_JOB_ID,
                    browsers: [
                        { browserName: "internet explorer", version: "11" },
                        { browserName: "android", version: "4.4" },
                        { browserName: "iphone", version: "7.1" }
                    ],
                    tunnelTimeout: 5,
                    concurrency: 3
                }
            }
        },
        uglify: {
            all: { files: { 'deflector.min.js': 'deflector.js' }}
        },
        watch: {
            all: { 
                files: ['deflector.js', 'deflector.test.js'],
                tasks: ['build']
            }
        }
    });

    for (var key in grunt.file.readJSON('package.json').devDependencies) {
        if (key !== 'grunt' && key.indexOf('grunt') === 0) {
            grunt.loadNpmTasks(key);
        }
    }
    grunt.registerTask('build', ['jshint', 'uglify', 'qunit']);
    grunt.registerTask('test', ['build', 'connect', 'saucelabs-qunit']);
    grunt.registerTask('default', ['build', 'connect', 'watch']);
};