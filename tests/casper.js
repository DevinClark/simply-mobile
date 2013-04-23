var casper = require('casper').create({
		clientScripts: [
				'js/assets.js',
				'js/app.js'
		],
		logLevel: "info",
		viewportSize: {
			width: 320,
			height: 480
		},
		onError: function(self, m) {
				console.log('FATAL:' + m);
				self.exit();
		},
		pageSettings: {
				loadImages:  true,
				loadPlugins: false
		}
});

casper.start("http://localhost.dev/simply-mobile", function() {
	//casper.test.assert(SimplyMobile.LocalStorage.set("test", value), "Setting a LocalStorage property");
});

casper.run();