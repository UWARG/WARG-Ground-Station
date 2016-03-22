// // Like a L.DivIcon, but we can access the div inside
// L.BareDivIcon = L.Icon.extend({
// 	_container: null,

// 	createIcon: function (oldIcon) {
// 		var div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
// 		    options = this.options;
// 		this._container = div;
// 		this._setIconStyles(div, 'icon');
// 		return div;
// 	},

// 	getContainer: function () {
// 		return this._container;
// 	}
// });

// L.bareDivIcon = function (options) {
// 	return new L.BareDivIcon(options);
// };

// Define a marker that displays a user-modifiable altitude in L
L.AltitudeMarker = L.Marker.extend({
	_map: null,	// L.Map

	_legend: null, // HTML div

    initialize: function (latlng, altitude, options) {
        debugger
    	if (!(L.Util.isArray(latlng) && latlng.length == 3)) {
    		throw new Error("L.AltitudeMarker must be initialized with an array latitude and longitude [lat,lon]");
    	}

        else if (isNaN(altitude) || Number(altitude)<=0){
           throw new Error("L.AltitudeMarker must be initialized with a positive altitude value"); 
        }
        else{
           this.altitude=Number(altitude);
           L.Marker.prototype.initialize.call(this, latlng, options); 
        }
    },

    onAdd: function (map) {
    	this._map = map;
        this._makeLegend();

        L.Marker.prototype.onAdd.call(this, map);
        this._icon.appendChild(this._legend);
    },

    _makeLegend: function () {
        this._legend = document.createElement('div');
        this._legend.appendChild(document.createElement('span'));
        L.DomUtil.addClass(this._legend, 'L-altitude-legend');
    	this._updateLegendText();
    },

    _updateLegendText: function () {
        this._legend.getElementsByTagName('span')[0].innerHTML = this.altitude;
    },

    update: function () {
        L.Marker.prototype.update.call(this);
        this._updateLegendText();
    },
});

L.altitudeMarker = function (latlng, options) {
	return new L.AltitudeMarker(latlng, options);
};