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