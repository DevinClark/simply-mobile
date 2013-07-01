module.exports = function(grunt) {

	grunt.initConfig({
		bower: {
			all: {
				dest: 'js/assets.js',
				exclude: "cordova",
				dependencies: {
					'jquery.hammer': 'jquery',
					'jquery.easing.min': 'jquery'
				}
			}
		},
		jshint: {
			all: ['js/app.js']
		},
		casperjs: {
			options: {},
			files: ['tests/*.js']
		},
		uglify: {
			assets: {
				files: {
					'js/assets.js': [
						'js/modernizr.js',
						'js/assets.js',
						'js/reveal-forked.js'
					]
				}
			}
		},
		cssmin: {
			build: {
				src: 'css/base.css',
				dest: 'css/base.min.css'
			}
		},
		shell: {
			docGeneration: {
				command: 'docco js/app.js',
				options: {
					stdout: true
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-bower-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-casperjs');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-css');
	grunt.loadNpmTasks('grunt-shell');

	grunt.registerTask('default', ['shell', 'jshint', 'bower', 'uglify', 'cssmin']);
	grunt.registerTask('test', ['shell', 'jshint']);
};