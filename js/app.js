/*jshint noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, devel:true, jquery:true, indent:4, maxerr:50, newcap:true */
/*global Handlebars, jQuery, FastClick */
"use strict";
var Modernizr = Modernizr;

// Override jQuery.error for display in Console.
jQuery.error = console.error;

// Global Variables
var GlobalSettings = {
	docWidth: $(document).width(),
	docHeight: $(document).height(),
	env: "web"
};

var Start = {
	battle: function (){
		this.inits();
		this.styling();
		
		if( LocalStorage.get('last-page') === null || LocalStorage.get('last-page') === undefined ) {
			LocalStorage.set('last-page', GlobalSettings.initialPage);
		}

	},
	firstLoad: function (){

		Navigation.init();
		BottomNavigation.init();
		this.battle();
		ProgressBar.load();
		ViewAssembler.init();

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
			obj = $.jsonParse(jsonData);
		} catch(e) {}

		if(typeof obj === "object") {
			return obj;
		}
		else {
			var json;
			$.getJSON(jsonData, remoteData, function(data) {
				json = data;
			});
			return json;
		}
	},
	getTemplateFile: function(name, callback) {
		var self = this;
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
		self.currentTemplate = name;
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
	defaultView: function() {
		ViewAssembler.renderTemplate("styleguide", "", "", function(html) {
			LoadController.loadPage(html);
		});
		ViewAssembler.updateTitle("Simply Mobile");
	}
};

var LoadController = {
	s: {
		docWidth: GlobalSettings.docWidth,
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
		var self = this;
		var timing = 400;
		var easing = "linear";
		$(".page #js-primary-content").fadeOut(timing, easing, function() {
			self.setActiveNav();
			$('.page #js-primary-content div').html(content);
			
			$(".page #js-primary-content").fadeIn(timing, easing, function (){
				// This fixes the issue where if you scroll a content area and 
				// ajax to something new, it would load the new stuff at that scroll position
				$('.page #js-primary-content').animate({
					scrollTop: 0
				}, 0);
				
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
	setScrolling: function() {
		var docHeight = GlobalSettings.docHeight;
		var headerHeight = $('.js-content-wrap header').outerHeight(false);
		var footerHeight = ( $('.bottom-bar').css("display") === "none" ) ? 0 : $('.bottom-bar').outerHeight(false);
		var totalHeight = docHeight - headerHeight - footerHeight;

		$(".page #js-load-content").css({'position': 'absolute', 'left': GlobalSettings.docWidth});

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
	
	Views.defaultView();
	
	$("a[data-view]").on("click", function(e) {
		e.preventDefault();
		switch($(this).data("view")) {
		case "styleguide":
			Views.defaultView();
			break;
		default:
			Views.loadView($(this).data("view"));
		}
		return false;
	});

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