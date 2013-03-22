/*jshint noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, devel:true, jquery:true, indent:4, maxerr:50, newcap:true */
"use strict";
var Modernizr = Modernizr;

// Override jQuery.error for display in Console.
jQuery.error = console.error;

// Global Variables
var GlobalSettings = {
	docWidth: $(document).width(),
	docHeight: $(document).height(),
	initialPage: 'index_content.html'
};

var Start = {
	battle: function (s){
		this.inits();
		this.styling();
		
		if( LocalStorage.get('last-page') === null || LocalStorage.get('last-page') === undefined ) {
			LocalStorage.set('last-page', GlobalSettings.initialPage);
		}

	},
	firstLoad: function (){
		var lastPage = LocalStorage.get('last-page');
		
		Navigation.init();
		BottomNavigation.init();
		this.battle();
		ProgressBar.load();
		
		AjaxController.load( lastPage );

		new FastClick(document.body);
	},
	inits: function (){
		OrientationCheck.init();
		ScrollingFixes.init();
	},
	styling: function (){
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
		ProgressBar.init();

		// Switch checkbox classes.
		$('.checkbox.switch').after("<div/>").parents("label").addClass("switch-label");
		$(".checkbox.switch").each(function() {
			$(this).removeClass("on off").addClass(
				($(this).is(":checked") ? "on" : "off")
			);
		});
		$(".switch-label").on("click touch", function(e) {
			e.preventDefault();
			var $input = $(this).children("input");

			$input.removeClass("on off").addClass(
				(!$input.is(":checked") ? "on" : "off")
			);

			if($input.hasClass("on")) {
				$input.attr("checked", "true");
			} else {
				$input.removeAttr("checked");
			}

			return false;
		});

		$('.bottom-bar li').css("width", 100 / $('.bottom-bar li').length + "%");
	}
};

var CordovaApp = {
	initialize: function() {
		this.bind();
	},
	bind: function() {
		document.addEventListener('deviceready', this.deviceready, false);
	},
	deviceready: function() {
		CordovaApp.report('deviceready');
	},
	report: function(id) { 
		console.log("report:" + id);

	}
};


var AjaxController = {
	s: {
		docWidth: GlobalSettings.docWidth,
		navIDs: '#main-nav, #footer-nav',
		lImg: '#loaderImg',
		lTxt: '#loaderTxt',
		l: '#loader'
	},
	init: function (){
		var self = this;
	},
	loadImage: function (show){
		self = this;
		if( show === true ) {
			$(this.s.lImg).fadeIn(200);
		} else {
			$(this.s.lImg).fadeOut(200);
		}
	},
	loadingShow: function (str){
		$(this.s.lTxt).html(str);
		$(this.s.l).animate({'height': 60}, 500);
	},
	loadingHide: function (delay){
		setTimeout(function (){
			$('#loader ').animate({'height':0}, 500, function() {
				$(this).removeClass();
			});
		}, delay);
	},
	
	load: function (htmlPage){
		var self = this;
		
		// Error checking
		$.ajax({
			url: htmlPage,
			cache: false,
			dataType: "html",
			statusCode: {
				404: function() {
					self.loadPage('content/error.html', 'error');
				},
				200: function() {
					self.loadPage(htmlPage, null);
				}
			}
		});
	},
	loadPage: function (htmlPage, t){
		var self = this;

		$(".page section").css({'width': self.s.docWidth});
		
		$(".page section.js-primary-content").css({'position': 'absolute', 'left': 0});
		$(".page section.js-load-content").css({'position': 'absolute', 'left': self.s.docWidth});
		
		$.ajax({
			url: htmlPage,
			cache: false,
			type: 'get',
			statusCode: {
				// http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
				200: function (){
					self.loadImage(true);
				},
				404: function (){
					$(self.s.l).addClass('error');
					self.loadingShow('ERROR: Not found');
					self.loadingHide(2000);					
				}
			}
		}).done(function (html){
			self.loadingShow('Loading');
				
			$('.page section.js-load-content div').html(html);
			
			$(self.s.lTxt).html("Completed");
			
			self.loadImage(false);
						
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
						$(".page section.js-primary-content div").html(html);
						
						// This fixes the issue where if you scroll a content area and 
						// ajax to something new, it would load the new stuff at that
						// scroll position
						$('.page section.js-primary-content').animate({
							scrollTop: 0
						}, 0, function (){
							$(".page section.js-load-content div").html('').css({'left': -self.s.docWidth});
						});
  
						
						Start.battle();
	
						self.loadingHide(500);

						// Setting the active nav
						$(self.s.navIDs).find('a').removeClass('active');
						$(self.s.navIDs).find('a[data-href="' + htmlPage + '"]').addClass('active');
						
						// If the page error'd out, don't set localstorage
						if( !t ) {
							LocalStorage.set("last-page", htmlPage);
							LocalStorage.set("last-page-content", $(".page section.js-primary-content").html());
						}
					}
				}
			);
			$(".page section").css({'width': "100%"});
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
			ScrollingFixes.init();
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
			return localStorage.getItem(this.settings.prefix + key);
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
		navWidth: GlobalSettings.docWidth,
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
			
			if( ! $(this).hasClass('active') ) {
				var href = $(this).data('href');
				
				$(self.s.menuItems).removeClass('active');
				
				$(this).addClass('active');
				
				$('.menuopen').removeClass('menuopen');
				
				setTimeout(function (){
					self.hideMenu();
				
					setTimeout(function (){
						AjaxController.load(href);
					}, 500);
				}, 200);
			}
		});
	}
};
var BottomNavigation = {
	s: {
		navWidth: GlobalSettings.docWidth,
		delay: 500,
		fadeDelay: 400,
		menuItems: '.bottom-bar a',
		easingIn: 'easeOutQuart',
		easingOut: 'easeInOutQuart'
	},
	init: function() {
		this.clickNavItem();
	},
	clickNavItem: function (){
		var self = this;

		$(self.s.menuItems).on('click',function (e){
			e.preventDefault();
			
			if( $(this).data('href') ) {
				if( ! $(this).hasClass('active') ) {
					var href = $(this).data('href');
					
					$(self.s.menuItems).removeClass('active');
					
					$(this).addClass('active');
					
					setTimeout(function (){
					
						setTimeout(function (){
							AjaxController.load(href);
						}, 500);
					}, 200);
				}
			}
		});
	}
};

var ScrollingFixes = {
	init: function (){
		this.setScrolling();
		this.disableElastic();
	},
	setScrolling: function() {
		var docHeight = GlobalSettings.docHeight;
		var headerHeight = $('.js-content-wrap header').outerHeight(false);
		var footerHeight = ( $('.bottom-bar').css("display") === "none" ) ? 0 : $('.bottom-bar').outerHeight(false);
		var totalHeight = docHeight - headerHeight - footerHeight;

		$(".page section.js-load-content").css({'position': 'absolute', 'left': GlobalSettings.docWidth});

		$('.js-content-wrap')
			.css({
				'height':docHeight
			})
			.find('section')
			.css({
				'height': totalHeight,
				'overflow': 'scroll',
				'-webkit-overflow-scrolling': 'touch'
			});
	},
	disableElastic: function (){
		var link = $('.page section');
		
		var docHeight = $('.page section.js-primary-content').outerHeight(false);
		var headerHeight = $('.js-content-wrap header').outerHeight(false);
		var footerHeight = ( $('.bottom-bar').css("display") === "none" ) ? 0 : $('.bottom-bar').outerHeight(false);
		var totalHeight = docHeight - headerHeight - footerHeight;

		$('.page section.js-primary-content > div').css('min-height', totalHeight);
		

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

var ProgressBar = {
	init: function() {
		$(".meter").each(function() {
			$(this).append("<span />");
			$("span", this).width($(this).data("progress") + "%");
			if($(this).hasClass("show-progress")) {
				$("span", this).html("<b>" + $(this).data("progress") + "%</b>");
			}
		});
	},
	load: function() {
		$(".meter").each(function() {
			$("span", this).width(0).animate({
				width: $(this).data("progress") + "%"
			}, 1200);
		});
	}
};

$(".reveal-modal").wrapInner("<div class='modal-inner' />");



jQuery(function($){
	Start.firstLoad();
	
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

	// Lists what the device supports.
	var supportsOutput = "";
	for (var item in Modernizr) {
		if(Modernizr[item] === true) {
			supportsOutput += "<li>" + item + "</li>";
		}
	}
	//$("#supports").append("ul").html(supportsOutput);
});