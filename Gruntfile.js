module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks('grunt-jsdoc-to-markdown');
    grunt.loadNpmTasks('grunt-upcoming');

    grunt.initConfig({

        // used by the changelog task
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            options: {
                node: true
            },
            all: ['*.js','./modules/*.js']
        },

        shell: {
            publish: {
                command: 'npm publish'
            },
            pubinit: {
                // command: 'npm publish --access public'
                command: [
                    'npm publish --access public',
                    'git tag v0.1.0',
                    'git push origin --tags',
                  ].join('&&')
            },
        },

        // To test: grunt bump --dry-run

        bump: {
            options: {

                commit: true,
                createTag: true,
                push: true,
                pushTo: 'origin',

                updateConfigs: ['pkg'],
                commitFiles: ['package.json']
            }
        },


        browserify: {
            dist: {
                options: {
                    browserifyOptions: {
                        // dashes will be converted to caps in actual name 
                        // i.e.: -test-zeta becomes TestZeta
                        standalone: 'MitchAllen.-marchio-lambda-put'
                        // standalone: 'mitchallen.-marchio-lambda-put'
                    },
                    transform: [['babelify', {presets: ['es2015']}]],
                    plugin: [[ "browserify-derequire" ]]
                },
                files: {
                   // if the source file has an extension of es6 then
                   // we change the name of the source file accordingly.
                   // The result file's extension is always .js
                   "./dist/marchio-lambda-put.js": ["./modules/index.js"]
                   // For non-standalone, use ./browser.js instead.
                   // "./dist/marchio-lambda-put.js": ["./browser.js"]
                }
            }
        },

        uglify: {
            my_target: {
                files: {
                    './dist/marchio-lambda-put.min.js': ['./dist/marchio-lambda-put.js']
                }
            }
        },

        watch: {
             scripts: {
                files: ['*.js','./modules/*.js'],
                tasks: ['jshint','browserify','uglify']
             }
        },

        jsdoc2md: {
              oneOutputFile: {
                src: 'modules/*.js',
                dest: 'DOC-API.md'
              }
              // separateOutputFilePerInput: {
              //   files: [
              //     { src: 'src/jacket.js', dest: 'api/jacket.md' },
              //     { src: 'src/shirt.js', dest: 'api/shirt.md' }
              //   ]
              // },
              // withOptions: {
              //   options: {
              //     'no-gfm': true
              //   },
              //   src: 'src/wardrobe.js',
              //   dest: 'api/with-index.md'
              // }
        },

        upcoming: {
            default: {
                files: [
                    { src: 'package.json', dest: ['upcoming-info.json'] }
                ]
            }
        }

    });

    grunt.registerTask('default', ['upcoming:patch','build']);
    grunt.registerTask('monitor', ['jshint','watch']);
    grunt.registerTask('build-doc', ['jsdoc2md']);
    grunt.registerTask("build",   ['jshint','build-doc','browserify','uglify']);
    grunt.registerTask('pubinit', ['build','shell:pubinit']);
    grunt.registerTask('publish', ['upcoming:patch','build','bump','shell:publish']);
    grunt.registerTask('pubminor', ['upcoming:minor','build','bump:minor','shell:publish']);
    grunt.registerTask('pubmajor', ['upcoming:major','build','bump:major','shell:publish']);
};
