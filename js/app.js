/*jshint noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, devel:true, jquery:true, indent:4, maxerr:50, newcap:true */
"use strict";
var Modernizr = Modernizr;

// Override jQuery.error for display in Console.
jQuery.error = console.error;

var SM = {
	s: {

	},
	init: function() {
		OrientationCheck.init();
		ScrollingFixes.init();
		Navigation.init();
		this.refresh();
	},
	refresh: function() {
		// add new settings here
		this.s.docWidth = $(document).width();
		this.s.docHeight = $(document).height();
	}
};

var AjaxController = {
	s: {
		docWidth: SM.s.docWidth
	},
	init: function (){
		var self = this;
	},
	loadingShow: function (){
		$("body").prepend("<div id='ajaxLoading'><div id='busy'></div></div>");
		
		$('#busy').activity({
			segments: 10, 
			align: 'center', 
			valign: 'center', 
			steps: 7, 
			width: 14, 
			space: 10, 
			length: 20, 
			opacity: 0,
			color: '#fff', 
			speed: 2
		});
	},
	loadingHide: function (){
		$('#ajaxLoading').remove();
		$('#busy').activity('false');
	},
	load: function (htmlPage){
		var self = this;

		$(".page section").css({'width': self.s.docWidth});
		
		$(".page section.js-primary-content").css({'position': 'absolute', 'left': 0});
		$(".page section.js-load-content").css({'position': 'absolute', 'left': self.s.docWidth});


		self.loadingShow();
		
		$.ajax({
			url: htmlPage,
			cache: false
		}).done(function (html){
			setTimeout(function (){ // Just here to simulate server load
				$('.page section.js-load-content').html(html);
							
				$(".page section.js-primary-content").animate({'position': 'absolute', 'left': -self.s.docWidth}, { queue: false, duration: 500 });
				$(".page section.js-load-content").animate(
					{
						'position': 'absolute', 
						'left': 0
					},{ 
						queue: false, 
						duration: 500, 
						complete: function (){
							$(".page section.js-primary-content").css('left',0);
							$(".page section.js-primary-content").html(html);
							$(".page section.js-load-content").html('').css({'left': -self.s.docWidth});
							self.loadingHide();
						}
					}
				);
				$(".page section").css({'width': "100%"});
			}, 500);
		});
	}
};

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
			SM.refresh();
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

var Navigation = {
	s: {
		navWidth: SM.s.docWidth,
		delay: 500,
		fadeDelay: 400,
		navTrigger: '.js-open-nav',
		menuContainer: '#main-nav',
		menuItems: '#main-nav ul li a',
		easingIn: 'easeOutQuart',
		easingOut: 'easeInOutQuart'
	},
	init: function (){
		this.addClasses();
		this.openEvent();
		this.clickNavItem();
	},
	addClasses: function (){
		var self = this;
		
		$(self.s.menuItems).each(function (index){			
			if (index%2 !== 0) {
				$(this).css({'left': -self.s.navWidth}).addClass('odd');
			} else {
				$(this).css({'right': -self.s.navWidth}).addClass('even');
			}
		});	
	},
	showMenu: function (){
		var self = this;
		
		$(this.s.menuContainer).show();
		$('.odd').animate({'left': 0}, self.s.delay, self.s.easingIn);
		$('.even').animate({'right': 0}, self.s.delay, self.s.easingIn);
	},
	hideMenu: function (){
		var self = this;
		
		$('.odd').animate({'left': -self.s.navWidth}, self.s.delay, self.s.easingOut);	
		$('.even').animate({'right': -self.s.navWidth}, self.s.delay, self.s.easingOut);

		setTimeout(function (){
			$(self.s.menuContainer).hide();
		}, self.s.delay);
	},
	openEvent: function (){
		var self = this;
		
		$(self.s.navTrigger).on('click',function (){	
			if( ! $(this).hasClass('menuopen') ) {
				self.showMenu();			
				$(this).addClass('menuopen');
			} else {
				self.hideMenu();
				$(this).removeClass('menuopen');
			}
		});
	},
	clickNavItem: function (){
		var self = this;

		$(self.s.menuItems).on('click',function (e){
			e.preventDefault();
			
			var href = $(this).data('href');
			
			$(self.s.menuItems).removeClass('active');
			
			$(this).addClass('active');
			
			setTimeout(function (){
				self.hideMenu();
			
				setTimeout(function (){
					AjaxController.load(href);
				}, 500);
			}, 200);
		});
	}
};

var ScrollingFixes = {
	init: function (){
		this.setScrolling();
		this.disableElastic();
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
	disableElastic: function (){
		var link = $('.page section');
			
		$(window).bind('touchstart',function(e){
			var scrolled = link.scrollTop();
			var winHeight = link.height();
			var contentHeight = $('.page section > div').innerHeight();
			var fromBottom = contentHeight - winHeight - scrolled;
			
			if( scrolled < 1 ) {
				link.animate({scrollTop: scrolled + 1}, 0);
			}
			
			if( fromBottom < 1 ) {
				link.animate({scrollTop: scrolled - 1},0);
			}	
		});
	}	
};














jQuery(function($){
	SM.init();

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