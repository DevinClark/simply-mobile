// # Simply Mobile App.js
// _An [OverDid.It](http://overdid.it) Project._

/*jshint noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:false, curly:true, browser:true, devel:true, jquery:true, indent:4, maxerr:50, newcap:true */
/*global Handlebars, jQuery, FastClick */

var SimplyMobile = (function($, window, document, undefined) {
	/*jshint unused: true*/
	"use strict";
	var Modernizr = window.Modernizr;

	// Override jQuery.error for display in Console.
	$.error = console.error;

	// Global Settings
	var GlobalSettings = {
		initialPage: "styleguide",
		tabletMin: 768,
		tabletMax: 1025,
		env: "web"
	};

	// ## Start
	var Start = {
		battle: function (){
			this.inits();
			this.styling();
		},
		firstLoad: function (){
			BottomNavigation.init();
			Navigation.init();
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
				$.getScript("../components/cordova/index.js");
				CordovaApp.initialize();
				break;
			}
		},
		inits: function (){
			OrientationCheck.init();
			ScrollingFixes.init();
			Slider.init();
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
			
			// Ensures the bottom bar elements are always the correct width, regardless of the number of items.
			$('.bottom-bar li').css("width", 100 / $('.bottom-bar li').length + "%");

			// Makes the range slider look more native.
			$('.range').each(function() {
				$(this).change(function() {
					var percent = $(this).val();
					if( $(this).attr("min") || $(this).attr("max") ) {
						percent = $(this).val() / $(this).attr("max") * 100;
					}
					$(this).css("background-size", percent + "% 100%");
				})
				.trigger("change");
			});
		}
	};

	// ## CordovaApp
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

	// ## Hook
	var Hook = {
		// The container that holds all the hooks.
		hooks: [],
		// ### register
		// Registers a function that will be executed in the place call is called for the name.
		register: function ( name, callback ) {
			if( 'undefined' === typeof( Hook.hooks[name] ) ) {
				Hook.hooks[name] = [];
			}
			Hook.hooks[name].push( callback );
		},
		// ### call
		// Calls all the registered hooks for name.
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

	// ## View Assembler
	var ViewAssembler = {
		currentTemplate: "",
		// ### init
		// Initializes the templating engine.
		init: function() {
			if (Handlebars.templates === undefined) {
				Handlebars.templates = {};
			}
			if(Handlebars.templates.error !== "") {
				Handlebars.templates.error = this.getTemplateFile("error");
			}
		},
		// ### getJSON
		// Retrieves the JSON data that is put into the Handlebars template.
		// 
		// * `jsonData` is either a string url or a JSON object.  
		// * `remoteData` is an optional remote data that is passed to the server in the Ajax request. If jsonData is an object, this should be empty.  
		// * Returns a JSON object containing the data that is to be put into the Handlebars template.
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
		// ### getTemplateFile
		// Loads the template files that are located in the views directory. Caches the template so they won't have to be loaded twice.
		// 
		// * `name` is the name of the template file to load, without extension.
		// * `callback` is a callback function to execute once the template has been retrieved. Passes the compiled template file.
		// * returns a Handlebars template file.
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
		// ### renderTemplate
		// Renders the template with the data. 
		// 
		// * `name` is the name of the template to load.
		// * `data` is the JSON data to be put into the template.
		// * `remoteData` is a JSON object of the data to be passed to the server when getting the template data.
		// `callback` is a callback function passing the final rendered html.
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
		// ### updateTitle
		// Updates the title (`header h1`) with the passed title.
		updateTitle: function(title) {
			$("header h1").html(title);
		}
	};

	// ## Views
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
		}
	};

	// ## LoadController
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
					$('#js-primary-content').animate({
						scrollTop: 0
					}, 400);
					
					Start.battle();
				});
				$(".page section").css({'width': "100%"});
			});
		}
	};

	// ## OrientationCheck
	var OrientationCheck = {
		// ### init
		// Initialize OrientationCheck and add body classes. 
		init: function() {
			$("body").addClass("landscape");
			OrientationCheck.check();
			OrientationCheck.resize();
		},
		// ### debounce
		// Postpone execution of fn until after delay milliseconds have passed since the fn's last execution.
		// 
		// * `fn` is the function to debounce
		// * `delay` is the amount of time to wait in milliseconds.
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
		// ### check
		// Checks to see if the window is in portrait or landscape orientation.
		check: function() {
			if(window.innerWidth > window.innerHeight) {
				$("body").addClass("landscape").removeClass("portrait");
			} else {
				$("body").addClass("portrait").removeClass("landscape");
			}
		},
		// ### resize
		// Recheckes the orientation and fixes window scrolling.
		// 
		//  * callback a callback function to hook into `resize()` and functionality.
		resize: function(callback) {
			window.addEventListener("resize", function() {
				OrientationCheck.check();
				ScrollingFixes.setScrolling(window.innerHeight);
				if(callback) {
					callback(window.innerWidth, window.innerHeight);
				}
			}, false);
		},
		// ### isTablet
		// Returns true if the device width is in the range of tabletMin and TabletMax in GlobalSettings.
		isTablet: function() {
			return (window.innerWidth >= GlobalSettings.tabletMin && window.innerWidth <= GlobalSettings.tabletMax);
		}
	};

	// ## LocalStorage
	// Examples:
	// 
	//		LocalStorage.set("foo", "bar");
	//		var baz = LocalStorage.get("foo");
	//		LocalStorage.removeAll();
	var LocalStorage = {
		// ### settings
		settings: {
			supports: (Modernizr.localstorage) ? true : false,
			prefix: "sm-" // include separator
		},
		// ### get
		// Retrieves the value of key.
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
		// ### getAll
		// Returns an array of all the keys in LocalStorage.
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
		// ### keyExists
		// Returns a boolean value if the passed key exists
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
		// ### set
		// Accepts `key` as the item in LocalStorage and `value` as the value of `key` in LocalStorage.  
		// Returns true if the key is successfully set, false if no.
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
		// ### remove
		// Accepts a key to remove.  
		// Returns true if the key is removed, false if not.
		
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
		// ### removeAll
		// Removes all items from LocalStorage for the current domain.  
		// Returns true if the items are successfully removed, false if not.
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

	// ## Navigation
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
			// These functions are only needed on mobile. Tablet is getting a different menu.
			if(OrientationCheck.isTablet()) {
				this.sideNavInit();
			}
			else {
				this.addClasses();
				this.openEvent();
				$(this.s.menuContainer).removeClass("side-menu");
				$("#js-primary-content").css("paddingLeft", 10);
			}
			this.clickNavItem();
		},
		sideNavInit: function() {
			var $nav = $(this.s.menuContainer);
			$nav.addClass("side-menu");
			$("#js-primary-content").css("paddingLeft", $nav.width() + 10);
		},
		// ### addClasses
		// Adds the classes for the striped backgrounds.
		addClasses: function (){
			var self = this;
			
			$(self.s.menuItems).each(function (index){			
				if (index % 2 !== 0) {
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
			
			$(self.s.navTrigger).on('click',function (e){
				e.preventDefault();
				if( ! $(this).hasClass('menuopen') ) {
					self.showMenu();			
					$(this).addClass('menuopen');
				} else {
					self.hideMenu();
					$(this).removeClass('menuopen');
				}
				return false;
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
					
					if(!OrientationCheck.isTablet()) {
						setTimeout(function (){
							self.hideMenu();

						}, 200);
					}
				}
			});
		}
	};

	// ## BottomNavigation
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

	// ## ScrollingFixes
	var ScrollingFixes = {
		// ### init
		init: function (){
			this.setScrolling();
			this.disableElastic();
		},
		// ### setScrolling
		// Makes the main content area main scrolling area. Accepts a parameter that is used in `OrientationCheck` to reflow height on orientation change.
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
		// ### disableElastic
		// Disables the annoying and evil rubber band scrolling.
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

	// ## ProgressBar
	// Takes elements with the class of `meter` and turns them into pretty progress bars. 
	var ProgressBar = {
		// ### init
		init: function() {
			$(".meter").each(function() {
				$(this).append("<span />");
				// Sets the width of the progress bar.
				$("span", this).width($(this).data("progress") + "%");
				if($(this).hasClass("show-progress")) {
					$("span", this).html("<b>" + $(this).data("progress") + "%</b>");
				}
			});
		},
		// ### load
		// Animates the load of the progress bar.
		load: function() {
			$(".meter").each(function() {
				$("span", this).width(0).animate({
					width: $(this).data("progress") + "%"
				}, 1200);
			});
		}
	};

	// Allows the modal to scroll if content exceeds window height.
	$(".reveal-modal").wrapInner("<div class='modal-inner' />");
	$(".reveal-modal .close-reveal-modal").each(function() {
		$(this).parents(".reveal-modal").append($(this)[0].outerHTML);
		$(this).remove();
	});

	// ## Slider
	// Adds a simple dragleft/dragright slider. To use, add `data-slider` to an `<ul>`. Sample markup for more options can be seen in the styleguide.
	var Slider = {
		init: function() {
			var self = this;
			self.ul = $("ul[data-slider]");
			self.li = $("ul[data-slider] li");
			self.currentIndex = 0;

			self.ul.wrap("<div />").parent("div").addClass("slider");
			
			self.ul
				.width( (self.li.first().width() * self.li.length) + "px")
				.parent("div")
					.height(self.ul.data("height"))
					.width(self.ul.data("width"));

			self.ul.hammer().on("dragleft", self.handleGesture);
			self.ul.hammer().on("dragright", self.handleGesture);
		},
		goTo: function(index) {
			if (index < 0 || index > Slider.li.length - 1) {
				return;
			}
			Slider.ul.css("left", "-" + (index * Slider.li.first().width()) + "px" );
			Slider.currentIndex = index;
		},
		next: function() {
			Slider.goTo(Slider.currentIndex + 1);
		},
		prev: function() {
			Slider.goTo(Slider.currentIndex - 1);
		},
		handleGesture: function(ev) {
			ev.gesture.preventDefault();
			switch(ev.type) {
			case "dragleft":
				Slider.next();
				ev.gesture.stopDetect();
				break;
			case "dragright":
				Slider.prev();
				ev.gesture.stopDetect();
				break;
			}
		}
	};


	$(function(){
		Start.firstLoad();
		
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

	// Expose a few public methods.
	return {
		GlobalSettings: GlobalSettings,
		Start: Start,
		CordovaApp: CordovaApp,
		OrientationCheck: OrientationCheck,
		ViewAssembler: ViewAssembler,
		Views: Views,
		LocalStorage: LocalStorage,
		Slider: Slider
	};
})(jQuery, this, this.document);
