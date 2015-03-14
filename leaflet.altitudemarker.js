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

	_legend: null, // HTML div
	
	_slider: null,	// HTML input[type="range"]

    initialize: function (latlng, options) {
    	if (!(L.Util.isArray(latlng) && latlng.length > 2) && !(latlng && latlng.alt !== undefined)) {
    		throw new Error("AltitudeMarker must be initialized with an altitude");
    		return;
    	}
        L.Marker.prototype.initialize.call(this, latlng, options);
    },

    onAdd: function (map) {
    	this._map = map;
        L.Marker.prototype.onAdd.call(this, map);

        this._addLegend();
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

    _addLegend: function () {
        this._legend = document.createElement('div');
        L.DomUtil.addClass(this._legend, 'leaflet-altitude-legend');

    	var altitudeSpan = document.createElement('span');
    	this._legend.appendChild(altitudeSpan);
    	
    	// Create slider only if not readonly
    	if (!this.options.readOnly) {
		    this._slider = this._createSlider();
	    	this._updateSlider();
	    	
    		var sliderDiv = document.createElement('div');
	    	sliderDiv.appendChild(this._slider);
            this._legend.appendChild(sliderDiv);

            L.DomEvent.on(this._legend, 'mouseover', this._showSlider, this);
            L.DomEvent.on(this._legend, 'mouseout', this._hideSlider, this);
	    }
    	this._updateLegendText();

        this._icon.appendChild(this._legend);
    },

    _showSlider: function (e) {
        L.DomUtil.addClass(this._slider.parentNode.parentNode, 'show-slider');
    },

    _hideSlider: function (e) {
        L.DomUtil.removeClass(this._slider.parentNode.parentNode, 'show-slider');
    },

    _updateLegendText: function () {
        this._legend.getElementsByTagName('span')[0].innerHTML = this.getLatLng().alt;
    },

    _updateSlider: function () {
    	var alt = this.getLatLng().alt;
    	this._slider.min = Math.floor(alt * 0.45);
    	this._slider.max = Math.ceil((alt + 1) * 1.55);
    	this._slider.step = (alt < 25) ? 0.2 : 1;
    	this._slider.value = alt;
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