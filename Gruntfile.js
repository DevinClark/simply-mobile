module.exports = function(grunt) {

	grunt.initConfig({
		bowerful: {
			/**
				store (optional) -> path where components are installed. defaults
				to 'components'
			*/
			store: 'components',

			/**
				dest (optional) -> directory where files will be merged. Merged
				files take the form:

					assets[.extension] = { merged files of extension type }

				e.g. all JS from bower packages will end up in assets.js; all css in assets.css

				Files are merged according to dependency rules, such that a file is
				concatenated after files upon which it depends.
			*/
			dest: 'js',

			/**
				@packages (required) -> object of `package name: package version`
				key/value pairs. Version can be left blank.
			*/
			packages: {
				"jquery": '',
				"jquery.hammer": '',
				"jquery.easing.1.3": "",
				"fastclick": ""
			},
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

	grunt.loadNpmTasks('grunt-bowerful');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-css');

	grunt.registerTask('default', ['bowerful', 'uglify', 'cssmin', 'jshint']);
};