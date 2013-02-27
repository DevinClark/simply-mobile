"use strict";
var Modernizr = Modernizr;

var OrientationCheck = {
	init: function() {
		$("body").addClass("landscape");
		OrientationCheck.check();
		OrientationCheck.resize();
	},
	check: function() {
		if(window.innerWidth > window.innerHeight)
			$("body").addClass("landscape").removeClass("portrait");
		else
			$("body").addClass("portrait").removeClass("landscape");
	},
	resize: function() {
		window.addEventListener("resize", function() {
			OrientationCheck.check();
		}, false);
	}
};

var LocalStorage = {
	settings: {
		supports: (Modernizr.localstorage) ? true : false,
		prefix: "sm-" // include separator
	},
	get: function(key) {
		if(!this.settings.supports || key === "") {
			return false;
		}
		try {
			return JSON.parse(localStorage.getItem(this.settings.prefix + key));
			return true;
		} catch(e) {
			return false;
		}
	},
	getAll: function() {
		if(!this.settings.supports) {
			return false;
		}
		try {
			var output = [];
			for (var key in localStorage){
			   output.push(key);
			}
			return output;
		} catch(e) {
			console.log(e);
			return false;
		}
	},
	set: function(key, value) {
		if(!this.settings.supports || key === "" || value === "") {
			return false;
		}
		try {
			localStorage.setItem(this.settings.prefix + key, value);
			return true;
		} catch(e) {
			return false;
		}
	},
	remove: function(key) {
		if(!this.settings.supports || key === "") {
			return false;
		}
		try {
			localStorage.removeItem(key);
			return true;
		} catch(e) {
			return false;
		}
	},
	removeAll: function() {
		if(!this.settings.supports) {
			return false;
		}
		try {
			localStorage.clear();
			return true;
		} catch(e) {
			return false;
		}
	}
};

var Modal = {
	settings: {

	},
	init: function(s) {
		for(key in s){
			this.settings[key] = s[key];
		}

	}
};

var Geolocation = {
	settings: {
		supports: (Modernizr.geolocation) ? true : false,
	},
	getLocation: function(mapSelector) {
		if(this.settings.supports) {
			navigator.geolocation.getCurrentPosition(function(position) {
				var lat = position.coords.latitude;
				var long = position.coords.longitude;

				Geolocation.showMap(lat, long, mapSelector);
			});
		}
	},
	showMap: function(lat, long) {
		var mapOptions = {
			center: lat + "," + long,
			zoom: 12,
			size: "300x300",
			maptype: "roadmap",
			sensor: "true",
			scale: 2
		};
		var src = "http://maps.googleapis.com/maps/api/staticmap?" + $.param(mapOptions, true).replace("%2C", ",");
		$(mapSelector).append("<img />");
		$(mapSelector + " img").attr({
			src: src,
			width: 300,
			height: 300
		});
	}
};

var ShowNavigation = {
	init: function (){
		this.UIbind();
	},
	UIbind: function (){
		var docHeight = document.documentElement.clientHeight;

		$('.js-open-nav-left').on('touchstart',function (){
			if( ! $('.js-content-wrap').hasClass('js-left-nav-open') ) {
				$('.js-content-wrap')
					.animate({'left': '83.5%'},200)
					.addClass('js-left-nav-open');

				$('.js-left-navigation').addClass('i-am-open');

				$("html, body").css({
					"overflow": "hidden",
					"height": docHeight
				});
			} else {
				$('.js-content-wrap')
					.animate({'left': 0},200)
					.removeClass('js-left-nav-open');

				$('.js-left-navigation').removeClass('i-am-open');

				$("html, body").css({
					"overflow-x": "auto",
					"height": "auto"
				});
			}
		});
	}
};

var ScrollingFixes = {
	init: function (){
		this.setScrolling();
		this.blockElastic($("section"));
	},
	setScrolling: function() {
		var docHeight = document.documentElement.clientHeight;
		var headerHeight = $('.js-content-wrap header').outerHeight(false);

		$('.js-content-wrap')
			.css({
				'height':docHeight
			})
			.find('section')
			.css({
				'height': docHeight - headerHeight,
				'overflow': 'scroll',
				'-webkit-overflow-scrolling': 'touch'
			});
	},
	blockElastic: function($el) {
		var startY, startTopScroll;

		if(!$el)
			return;

		$el.on('touchstart', function(event){
			startY = event.touches[0].pageY;
			startTopScroll = $el.scrollTop;

			if(startTopScroll <= 0)
				$el.scrollTop = 1;

			if(startTopScroll + $el.offsetHeight >= $el.scrollHeight)
				$el.scrollTop = $el.scrollHeight - $el.offsetHeight - 1;
		});
	}
}

jQuery(function($){
	OrientationCheck.init();

	ScrollingFixes.init();

	ShowNavigation.init();

	// Local Storage
	/*LocalStorage.settings.prefix = "taco-";
	LocalStorage.set("foo", "taco");
	LocalStorage.set("bar", "bell");
	LocalStorage.removeAll();
	console.log(LocalStorage.getAll());
	console.log(window.localStorage);*/

	//Geolocation
	//Geolocation.getLocation("#js-map");

	// Make form styling easier
	$('input[type="button"]').addClass('btn');
	$('input[type="checkbox"]').addClass('checkbox');
	$('input[type="file"]').addClass('file');
	$('input[type="image"]').addClass('image');
	$('input[type="password"]').addClass('password');
	$('input[type="radio"]').addClass('radio');
	$('input[type="submit"]').addClass('submit btn');
	$('input[type="reset"]').addClass('reset');
	$('input[type="text"]').addClass('text');
	$('input[type="email"]').addClass('email');

	// Lists what the device supports.
	var supportsOutput = "";
	for (var item in Modernizr) {
		if(Modernizr[item] === true) {
			supportsOutput += "<li>" + item + "</li>";
		}
	}
	//$("#supports").append("ul").html(supportsOutput);
});