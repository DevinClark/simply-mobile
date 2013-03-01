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