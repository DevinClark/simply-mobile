/*jshint noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, devel:true, jquery:true, indent:4, maxerr:50, newcap:true */
/*global Handlebars, jQuery, FastClick */
(function($, window, document, undefined) {
	"use strict";
	var Modernizr = window.Modernizr;
	// Override jQuery.error for display in Console.
	$.error = console.error;

	// Global Variables
	var GlobalSettings = {
		initialPage: "styleguide",
		env: "web"
	};

	var Start = {
		battle: function (){
			this.inits();
			this.styling();
		},
		firstLoad: function (){

			Navigation.init();
			BottomNavigation.init();
			this.battle();
			ProgressBar.load();
			ViewAssembler.init();

			if(LocalStorage.keyExists('last-page-name')) {
				var lastPage = LocalStorage.get('last-page-name');
				if(Views[lastPage]) {
					Views[lastPage]();
				}
				else {
					Views.loadView(lastPage);
				}
			}
			else {
				LocalStorage.set('last-page-name', GlobalSettings.initialPage);
				Views[GlobalSettings.initialPage]();
			}

			new FastClick(document.body);

			switch(GlobalSettings.env) {
			case "web":
				break;
			case "cordova":
				$.getScript("../components/cordova.ios/index.js");
				CordovaApp.initialize();
				break;
			}
		},
		inits: function (){
			OrientationCheck.init();
			ScrollingFixes.init();
		},
		styling: function (){
			var formElements = {
				'input[type="button"]': 'btn',
				'input[type="checkbox"]': 'checkbox',
				'input[type="file"]': 'file',
				'input[type="image"]': 'image',
				'input[type="password"]': 'password',
				'input[type="radio"]': 'radio',
				'input[type="submit"]': 'submit btn',
				'input[type="reset"]': 'reset',
				'input[type="text"]': 'text',
				'input[type="email"]': 'email',
				'input[type="url"]': 'url',
				'input[type="search"]': 'search',
				'input[type="tel"]': 'tel',
				'input[type="date"]': 'date',
				'input[type="datetime"]': 'datetime',
				'input[type="range"]': 'range'
			};
			for(var element in formElements) {
				$(element).addClass(formElements[element]);
			}
			ProgressBar.init();
			
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
			navigator.notification.alert("Hi", null, "Simply Mobile", 'OK');
		}
	};

	var Hook = {
		hooks: [],
		
		register: function ( name, callback ) {
			if( 'undefined' === typeof( Hook.hooks[name] ) ) {
				Hook.hooks[name] = [];
			}
			Hook.hooks[name].push( callback );
		},
		
		call: function ( name, args ) {
			if( 'undefined' !== typeof( Hook.hooks[name] ) ) {
				for( var i = 0; i < Hook.hooks[name].length; ++i ) {
					if( true !== Hook.hooks[name][i]( args ) ) { 
						break;
					}
				}
			}
		}
	};

	var ViewAssembler = {
		currentTemplate: "",
		init: function() {
			if (Handlebars.templates === undefined) {
				Handlebars.templates = {};
			}
			if(Handlebars.templates.error !== "") {
				Handlebars.templates.error = this.getTemplateFile("error");
			}
		},
		getJSON: function(jsonData, remoteData) {
			var obj;
			try {
				obj = $.parseJSON(jsonData);
			} catch(e) {}

			if(typeof obj === "object") {
				return obj;
			}
			else {
				$.ajax({
					url: jsonData,
					dataType: 'json',
					async: false,
					data: remoteData,
					ifModified: true,
					cache: true,
					success: function(data) {
						obj = data;
					}
				});
				return obj;
			}
		},
		getTemplateFile: function(name, callback) {
			if (Handlebars.templates[name] === undefined) {
				$.ajax({
					url: 'views/' + name + '.html',
					async: false,
					success: function(data) {
						if(name.substring(0, 1) === "_") {
							Handlebars.templates[name] = Handlebars.compile(data);
							Handlebars.registerPartial(name, Handlebars.templates[name]);
						}
						else {
							Handlebars.templates[name] = Handlebars.compile(data);
						}
						if(callback) {
							callback(Handlebars.templates[name]);
						}
					},
					error: function() {
						if(callback) {
							callback(Handlebars.templates.error);
						}
					}
				});
			}
			else {
				if(callback) {
					callback(Handlebars.templates[name]);
				}
			}
			ViewAssembler.currentTemplate = name;
			return Handlebars.templates[name];
		},
		renderTemplate: function(name, data, remoteData, callback) {
			var html;
			var self = this;
			ViewAssembler.getTemplateFile(name, function(template) {
				data = self.getJSON(data, remoteData) || "";
				html = template(data);
				
				if(callback) {
					callback(html);
				}

				ViewAssembler.currentTemplate = name;
				LoadController.setActiveNav();
				LocalStorage.set("last-page-name", name);
			});
		},
		updateTitle: function(title) {
			$("header h1").html(title);
		}
	};

	var Views = {
		loadView: function(name) {
			ViewAssembler.renderTemplate(name, "", "", function(html) {
				LoadController.loadPage(html);
			});
		},
		styleguide: function() {
			ViewAssembler.renderTemplate("styleguide", "", "", function(html) {
				LoadController.loadPage(html);
			});
			ViewAssembler.updateTitle("Simply Mobile");
		},
		fruit: function() {
			ViewAssembler.renderTemplate("fruit", "data/fruit.json", "", function(html) {
				LoadController.loadPage(html);
			});
			ViewAssembler.updateTitle("Simply Mobile");
		},
		tweets: function() {
			ViewAssembler.renderTemplate("tweets", "https://raw.github.com/cfjedimaster/ServiceDataFormatLibrary/master/twitter/search_for_starwars.json", "", function(html) {
				LoadController.loadPage(html);
			});
			ViewAssembler.updateTitle("Star Wars");
		}
	};

	var LoadController = {
		s: {
			docWidth: $(document).width(),
			navIDs: '#main-nav, .bottom-bar',
			lImg: '#loaderImg',
			lTxt: '#loaderTxt',
			l: '#loader'
		},
		loadImage: function (show){
			if( show === true ) {
				$(this.s.lImg).fadeIn(200);
			} else {
				$(this.s.lImg).fadeOut(200);
			}
		},
		loadingShow: function (str){
			$("body").prepend('<div id="loader"><div><span id="loaderImg"><img src="img/loading.gif" /></span><span id="loaderTxt">Loading the page</span></div></div>');
			$(this.s.lTxt).html(str);
			$(this.s.l).animate({'height': 60}, 500);
		},
		loadingHide: function (delay){
			setTimeout(function (){
				$('#loader ').animate({'height':0}, 500, function() {
					$(this).removeClass();
				});
			}, delay);
			$("#loader").remove();
		},
		setActiveNav: function() {
			$(this.s.navIDs).find('a').removeClass('active');
			$(this.s.navIDs).find('a[data-view="' + ViewAssembler.currentTemplate + '"]').addClass('active');
		},
		loadPage: function (content){
			var timing = 400;
			var easing = "linear";
			$("#js-primary-content").fadeOut(timing, easing, function() {
				$('#js-primary-content div').html(content);
				
				$("#js-primary-content").fadeIn(timing, easing, function (){
					// This fixes the issue where if you scroll a content area and 
					// ajax to something new, it would load the new stuff at that scroll position
					$('#js-primary-content').animate({
						scrollTop: 0
					}, 400);
					
					Start.battle();
				});
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
		debounce: function(fn, delay) {
			var timer = null;
			return function () {
				var context = this, args = arguments;
				clearTimeout(timer);
				timer = setTimeout(function () {
					fn.apply(context, args);
				}, delay);
			};
		},
		check: function() {
			if(window.innerWidth > window.innerHeight) {
				$("body").addClass("landscape").removeClass("portrait");
			} else {
				$("body").addClass("portrait").removeClass("landscape");
			}
		},
		resize: function(callback) {
			window.addEventListener("resize", OrientationCheck.debounce(function() {
				OrientationCheck.check();
				ScrollingFixes.setScrolling(window.innerHeight);
				if(callback) {
					callback(window.innerWidth, window.innerHeight);
				}
			}, 200), false);
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
		keyExists: function(key) {
			key = this.settings.prefix + key;
			var keys = this.getAll();
			if ( keys.indexOf(key) > -1 ) {
				return true;
			}
			else {
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

	var Navigation = {
		s: {
			navWidth: $(document).width(),
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
					
					$(self.s.menuItems).removeClass('active');
					
					$(this).addClass('active');
					
					$('.menuopen').removeClass('menuopen');
					
					setTimeout(function (){
						self.hideMenu();

					}, 200);
				}
			});
		}
	};
	var BottomNavigation = {
		s: {
			menuItems: '.bottom-bar a'
		},
		init: function() {
			this.clickNavItem();
		},
		clickNavItem: function (){
			var self = this;

			$(self.s.menuItems).on('click',function (e){
				e.preventDefault();
				
				if( $(this).data('view') ) {
					if( ! $(this).hasClass('active') ) {
						$(self.s.menuItems).removeClass('active');
						$(this).addClass('active');
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
		setScrolling: function(winHeight) {
			winHeight = (typeof winHeight === "undefined") ? $(window).height() : winHeight;
			var headerHeight = $('.js-content-wrap header').outerHeight(false);
			var footerHeight = ( $('.bottom-bar').css("display") === "none" ) ? 0 : $('.bottom-bar').outerHeight(false);
			var totalHeight = winHeight - headerHeight - footerHeight;
			$('.js-content-wrap')
			.css({
				'height': winHeight
			})
			.find('section')
			.css({
				'height': totalHeight,
				'overflow': 'scroll',
				'-webkit-overflow-scrolling': 'touch'
			});
		},
		disableElastic: function () {
			var link = $('.page section');
			
			var docHeight = $('.page #js-primary-content').outerHeight(false);
			var headerHeight = $('.js-content-wrap header').outerHeight(false);
			var footerHeight = ( $('.bottom-bar').css("display") === "none" ) ? 0 : $('.bottom-bar').outerHeight(false);
			var totalHeight = docHeight - headerHeight - footerHeight;
			$('.page #js-primary-content > div').css('min-height', totalHeight);
			

			$(window).bind('touchstart',function(){
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



	$(function(){
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
		
		$("a[data-view]").on("click", function(e) {
			e.preventDefault();
			var view = $(this).data("view");
			if(Views[view]) {
				Views[view]();
			}
			else {
				Views.loadView(view);
			}
			return false;
		});

		$("input[type='submit']").on("click", function() {
			$("#myModal").reveal();
			return false;
		});
	});
})(jQuery, this, this.document);
