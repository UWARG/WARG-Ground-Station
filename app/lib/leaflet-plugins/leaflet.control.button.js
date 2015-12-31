/*
 * Leaflet custom plugin
 * L.Control.Button shows a button on the map
 */

L.Control.Button = L.Control.extend({
	options: {
		position: 'topleft',
		name: 'button',
		text: '',
		title: '',
		disabled: false,
		onclick: function () {},
	},

	onAdd: function (map) {
		var controlName = 'leaflet-control-' + this.options.name,
		    container = L.DomUtil.create('div', controlName + ' leaflet-bar');

		this._map = map;

		this._button  = this._createButton(
		        this.options.text, 
            this.options.title,
		        controlName,  
            container, 
            this.options.onclick,  
            this);
		
		this._updateDisabled();

		return container;
	},

	_createButton: function (html, title, className, container, fn, context) {
		var link = L.DomUtil.create('a', className, container);
		link.innerHTML = html;
		link.href = '#';
		link.title = title;

		var stop = L.DomEvent.stopPropagation;

		L.DomEvent
		    .on(link, 'click', stop)
		    .on(link, 'mousedown', stop)
		    .on(link, 'dblclick', stop)
		    .on(link, 'click', L.DomEvent.preventDefault)
		    .on(link, 'click', fn, context)
		    .on(link, 'click', this._refocusOnMap, context);

		return link;
	},

	_updateDisabled: function () {
		var map = this._map,
			className = 'leaflet-disabled';

		L.DomUtil.removeClass(this._button, className);

		if (this.options.disabled) {
			L.DomUtil.addClass(this._zoomOutButton, className);
		}
	}
});

L.control.button = function (options) {
	return new L.Control.Button(options);
};
