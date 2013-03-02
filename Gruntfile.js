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
				"hammer.js": '',
				"jquery.foundation.reveal": "",
				"jquery.easing.1.3": ""
			},
		}
	});

	grunt.loadNpmTasks('grunt-bowerful');

	grunt.registerTask('default', ['bowerful']);
};