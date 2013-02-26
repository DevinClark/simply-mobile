"use strict";
var $ = require("component-zepto");
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


/*
var OffCanvas = {
	settings: {
		$triggerButton: $("#off-canvas-btn"),
		$canvas: $("#off-canvas"),
		onSwipe: true,
		isShown: false
	},
	init: function(s) {
		for(key in s){
			this.settings[key] = s[key];
		}
		this.button();
		if(this.settings.onSwipe === true) {
			this.swipe();
		}
	},
	show: function() {
		$("header h1").html("shown");
	},
	button: function() {
		this.settings.$triggerButton.on("click", function() {
			if(this.settings.isShown === true) {
				this.hide();
			}
			else {
				this.show();
			}
		});
	},
	swipe: function() {

	}
};
*/


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
	getLocation: function() {
		if(this.settings.supports) {
			navigator.geolocation.getCurrentPosition(function(position) {
				var lat = position.coords.latitude;
				var long = position.coords.longitude;

				Geolocation.showMap(lat, long);
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
		$("#js-map").append("<img />");
		$("#js-map img").attr({
			src: src,
			width: 300,
			height: 300
		});
	}
};

var slideBeginX;
function touchStart(event){
	event.preventDefault();//always prevent default Safari actions
	slideBeginX = event.targetTouches[0].pageX;
};

function touchMove(event) {
	event.preventDefault();
	// whatever you want to add here
};

function touchEnd(event) {
	event.preventDefault();
	var slideEndX = event.changedTouches[0].pageX;

	// Now add a minimum slide distance so that the links on the page are still clickable
	if (Math.abs(slideEndX - slideBeginX) > 200) {
		if (slideEndX - slideBeginX > 0) {
		// It means the user has scrolled from left to right
		} else {
		// It means the user has scrolled from right to left.
		};
	};
};

var ShowNavigation = {
	init: function (){
		this.UIbind();
	},
	UIbind: function (){
		$('.js-open-nav-left').on('touchstart',function() {
			if( ! $('.js-content-wrap').hasClass('js-left-nav-open') ) {
				$('.js-content-wrap')
					.animate({'left': '83.5%'},200)
					.addClass('js-left-nav-open');
			} else {
				$('.js-content-wrap')
					.animate({'left': 0},200)
					.removeClass('js-left-nav-open');
			}
		});
	}
};

Zepto(function($){
	OrientationCheck.init();

	//OffCanvas.init();

	ShowNavigation.init();
	// Local Storage
	/*LocalStorage.settings.prefix = "taco-";
	LocalStorage.set("foo", "taco");
	LocalStorage.set("bar", "bell");
	LocalStorage.removeAll();
	console.log(LocalStorage.getAll());
	console.log(window.localStorage);*/

	//Geolocation
	Geolocation.getLocation();

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