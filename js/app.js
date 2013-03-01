/*jshint noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, devel:true, jquery:true, indent:4, maxerr:50, newcap:true */
"use strict";
var Modernizr = Modernizr;
var triggerDown = 'touchstart mousedown';
var triggerUp = 'touchend mouseup';

var OrientationCheck = {
	init: function() {
		$("body").addClass("landscape");
		OrientationCheck.check();
		OrientationCheck.resize();
	},
	check: function() {
		if(window.innerWidth > window.innerHeight) {
			$("body").addClass("landscape").removeClass("portrait");
		} else {
			$("body").addClass("portrait").removeClass("landscape");
		}
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

var Geolocation = {
	settings: {
		supports: (Modernizr.geolocation) ? true : false
	},
	getLocation: function(mapSelector) {
		if(this.settings.supports) {
			navigator.geolocation.getCurrentPosition(function(position) {
				var lat = position.coords.latitude;
				var lon = position.coords.longitude;

				Geolocation.showMap(lat, lon, mapSelector);
			});
		}
	},
	showMap: function(lat, lon, mapSelector) {
		var mapOptions = {
			center: lat + "," + lon,
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

var MenuActions = {
	settings: {
		docHeight: document.documentElement.clientHeight,
		docWidth: document.documentElement.clientWidth,
		speed: 200
	},
	open: function (amount, speed){
		amount = (typeof amount === "undefined") ? "83.5%" : (parseInt(amount) + "px");
		speed = (typeof speed === "undefined") ? 200 : speed;
		$('.js-content-wrap')
			.animate({'left': amount}, speed)
			.addClass('js-left-nav-open');

		$('.js-left-navigation')
			.addClass('i-am-open')
			.css({
				'position': 'fixed',
				'-webkit-overflow-scrolling': 'touch'
			});

		$('.js-open-nav-left').css('color','#bada55');

		$("html, body").css({
			"overflow": "hidden",
			"height": this.settings.docHeight
		});
	},
	close: function (amount){
		amount = (typeof amount === "undefined") ? "0" : (amount + "px");
		$('.js-content-wrap')
			.animate({'left': amount}, this.settings.speed)
			.removeClass('js-left-nav-open');

		$('.js-left-navigation').removeClass('i-am-open');

		$('.js-open-nav-left').css('color','#fff');

		$("html, body").css({
			"overflow-x": "auto",
			"height": "auto"
		});
	}
};

var OffCanvasNavigation = {
	init: function (){
		this.toggleNavigation();
		this.swipeNavigation();
		this.useNavigation();
	},
	menuMove: {
		close: function (){ alert('o');}
	},
	toggleNavigation: function (){
		$('.js-open-nav-left').hammer().on('tap',function (){
			if( ! $('.js-content-wrap').hasClass('js-left-nav-open') ) {
				MenuActions.open();
			} else {
				MenuActions.close();
			}
		});
	},
	swipeNavigation: function() {
		$('.js-content-wrap').hammer().on("dragleft dragright", function(ev) {
			ev.gesture.preventDefault();
			var touches = ev.gesture.touches;
			if(ev.type === "dragright") {
				if( touches[0].pageX < 50 ) {
					MenuActions.open(undefined, 200);
					ev.gesture.stopDetect();
				}
			}
			else if (ev.type === "dragleft") {
				MenuActions.close(undefined, 200);
				ev.gesture.stopDetect();
			}
		});
	},
	useNavigation: function (){
	}
};

var ScrollingFixes = {
	init: function (){
		this.setScrolling();
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
	}
};

jQuery(function($){
	OrientationCheck.init();

	ScrollingFixes.init();

	OffCanvasNavigation.init();

	// Local Storage
	/*LocalStorage.settings.prefix = "taco-";
	LocalStorage.set("foo", "taco");
	LocalStorage.set("bar", "bell");
	LocalStorage.removeAll();
	console.log(LocalStorage.getAll());
	console.log(window.localStorage);*/

	//Geolocation
	//Geolocation.getLocation("#js-map");

	$("input[type='submit']").on("click", function() {
		$("#myModal").reveal();
		return false;
	});

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