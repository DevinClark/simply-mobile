module.exports = function(grunt) {

	grunt.initConfig({
		bower: {
			all: {
				dest: 'js/assets.js',
				exclude: "cordova.ios",
				dependencies: {
					'jquery.hammer': 'jquery',
					'jquery.easing.1.3': 'jquery'
				}
			}
		},
		jshint: {
			all: ['js/app.js']
		},
		uglify: {
			assets: {
				files: {
					'js/assets.js': [
						'js/assets.js',
						'js/reveal-forked.js'
					]
				}
			},
			build: {
				files: {
					'js/app.min.js': [
						'js/modernizr.js',
						'js/assets.js',
						'js/app.js'
					]
				}
			}
		},
		cssmin: {
			build: {
				src: 'css/base.css',
				dest: 'css/base.min.css'
			}
		}
	});

	grunt.loadNpmTasks('grunt-bower-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-css');

	grunt.registerTask('default', ['bower', 'uglify', 'cssmin', 'jshint']);
};