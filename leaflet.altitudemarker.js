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


// Define a marker that displays a user-modifiable altitude in Leaflet
L.AltitudeMarker = L.Marker.extend({

	_map: null,	// L.Map

	_legendMarker: null,	// L.Marker
	_legend: L.bareDivIcon({className: "leaflet-altitude-legend", iconSize: L.point(36, 12)}),

	_slider: null,	// HTML input[type="range"]

    initialize: function (latlng, options) {
    	if (latlng[2] === undefined && latlng.alt === undefined) {
    		throw new Error("AltitudeMarker must be initialized with an altitude");
    		return;
    	}
    	L.Marker.prototype.initialize.call(this, latlng, options);

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

    onRemove: function () {
    	this._removeLegendMarker();
    	L.Marker.prototype.onRemove.call(this);
    },

    _createSlider: function () {
    	var slider = document.createElement("input");
    	slider.type = "range";
    	slider.orient = "vertical";
    	slider.classList.add("leaflet-altitude-slider");
    	L.DomEvent.on(slider, 'mousedown', function(e) {
    		L.DomEvent.stopPropagation(e);
    	}, this);
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
    	this._updateLegendMarker();
    },

    _removeLegendMarker: function () {
    	this._map.removeLayer(this._legendMarker);
    },

    _updateLegendMarker: function () {
    	var div = this._legend.getContainer();
    	div.getElementsByTagName('span')[0].innerHTML = this._latlng.alt;
    },

    _updateSlider: function () {
    	this._slider.min = Math.ceil(this._latlng.alt * 0.25);
    	this._slider.max = Math.ceil(this._latlng.alt * 1.75);
    	this._slider.value = this._latlng.alt;
    },

    _onMove: function (e) {
    	this._legendMarker.setLatLng(e.latlng);
    },

    _onSliderInput: function (e) {
    	this._latlng.alt = e.target.valueAsNumber;
    	this._updateLegendMarker();
    },

    _onSliderChange: function (e) {
    	this._updateSlider();
    },
});

L.altitudeMarker = function (latlng, options) {
	return new L.AltitudeMarker(latlng, options);
};