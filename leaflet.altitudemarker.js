// Like a L.DivIcon, but we can access the div inside
L.BareDivIcon = L.Icon.extend({
	_container: null,

	createIcon: function (oldIcon) {
		var div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
		    options = this.options;
		this._container = div;
		this._setIconStyles(div, 'icon');
		return div;
	},

	getContainer: function () {
		return this._container;
	}
});

L.bareDivIcon = function (options) {
	return new L.BareDivIcon(options);
};

L.LatLng.prototype.toString = function (precision) { // (Number) -> String
	if (this.alt) {
		return 'LatLng(' +
		        L.Util.formatNum(this.lat, precision) + ', ' +
		        L.Util.formatNum(this.lng, precision) + ', ' +
		        L.Util.formatNum(this.alt, precision) + ')';
	} else {
		return 'LatLng(' +
		        L.Util.formatNum(this.lat, precision) + ', ' +
		        L.Util.formatNum(this.lng, precision) + ')';
	}
};


// Define a marker that displays a user-modifiable altitude in Leaflet
L.AltitudeMarker = L.Marker.extend({

	_map: null,	// L.Map

	_legend: null,
	_legendMarker: null,	// L.Marker

	_slider: null,	// HTML input[type="range"]

    initialize: function (latlng, options) {
    	if (!(L.Util.isArray(latlng) && latlng.length > 2) && !(latlng && latlng.alt !== undefined)) {
    		throw new Error("AltitudeMarker must be initialized with an altitude");
    		return;
    	}
    	L.Marker.prototype.initialize.call(this, latlng, options);

    	this._legend = L.bareDivIcon({className: "leaflet-altitude-legend", iconSize: L.point(36, 12)});
    	this._legendMarker = L.marker(latlng, {
    		icon: this._legend,
    		clickable: false,
    	});
    	this.on('move', this._onMove);

    	this._slider = this._createSlider();
    },

    onAdd: function (map) {
    	this._map = map;
    	this._addLegendMarker();
    	L.Marker.prototype.onAdd.call(this, map);
    },

    onRemove: function (map) {
    	this._removeLegendMarker();
    	L.Marker.prototype.onRemove.call(this, map);
    },

    _createSlider: function () {
    	var slider = document.createElement("input");
    	slider.type = "range";
    	slider.orient = "vertical";
    	slider.classList.add("leaflet-altitude-slider");

    	L.DomEvent.on(slider, 'mousemove', L.DomEvent.stopPropagation, this);
    	L.DomEvent.on(slider, 'dblclick', L.DomEvent.stopPropagation, this);
    	L.DomEvent.on(slider, 'input', this._onSliderInput, this);
    	L.DomEvent.on(slider, 'change', this._onSliderChange, this);
    	return slider;
    },

    _addLegendMarker: function () {
    	this._legendMarker.addTo(this._map);

    	var div = this._legend.getContainer();

    	var altSpan = document.createElement('span');
    	div.appendChild(altSpan);
    	this._slider = this._createSlider();
    	this._updateSlider();

    	var sliderDiv = document.createElement('div');
    	sliderDiv.appendChild(this._slider);
    	div.appendChild(sliderDiv);
    	this._updateLegendText();
    },

    _removeLegendMarker: function () {
    	this._map.removeLayer(this._legendMarker);
    },

    _updateLegendText: function () {
    	var div = this._legend.getContainer();
    	div.getElementsByTagName('span')[0].innerHTML = this.getLatLng().alt;
    },

    _updateSlider: function () {
    	var alt = this.getLatLng().alt;
    	this._slider.min = Math.floor(alt * 0.25);
    	this._slider.max = Math.ceil((alt + 1) * 1.75);
    	this._slider.step = (alt < 25) ? 0.2 : 1;
    	this._slider.value = alt;
    },

    _onMove: function (e) {
    	this._legendMarker.setLatLng(e.latlng);
    },

    _onSliderInput: function (e) {
    	var latlng = this.getLatLng();
    	this.setLatLng([latlng.lat, latlng.lng, e.target.valueAsNumber]);
    	this._updateLegendText();
    	this.fire('input');
    },

    _onSliderChange: function (e) {
    	this._updateSlider();
    	this.fire('change');
    },
});

L.altitudeMarker = function (latlng, options) {
	return new L.AltitudeMarker(latlng, options);
};