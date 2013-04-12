var casper = require('casper').create({
		clientScripts:  [
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
				loadImages:  false,
				loadPlugins: false
		}
});

casper.start("http://localhost.dev/simply-mobile", function() {
	this.wait(1000, function() {
		this.mouseEvent('click', '.bottom-bar a[data-view="test"]');
		this.captureSelector('page1.png', 'html');
	});

	this.wait(1000, function() {
		this.mouseEvent('click', '.bottom-bar a[data-view="fruit"]');
		this.captureSelector('page2.png', 'html');
	});

	this.wait(1000, function() {
		this.mouseEvent('click', '.bottom-bar a[data-view="styleguide"]');
		this.captureSelector('page3.png', 'html');
	});

});

casper.run();