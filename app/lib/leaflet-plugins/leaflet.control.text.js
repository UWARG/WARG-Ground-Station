/*
 * L.Control.Text is used to display information at bottom of screen
 */

L.Control.Text = L.Control.extend({
	options: {
		position: 'bottomleft',
		name: 'text',
		text: '',
		title: '',
    color:'',
		disabled: false,
		onclick: function () {},
	},

	_container: null,

	onAdd: function (map) {
		var controlName = 'leaflet-control-' + this.options.name;
		
		this._container = L.DomUtil.create('div', controlName);
    if(this.options.color){
      this._container.innerHTML = '<span style="color:'+this.options.color+'">'+this.options.text+'</span>';
      console.log('<span style="color:'+this.options.color+'">'+this.options.text+'</span>');
    }
    else{
     this._container.innerHTML = this.options.text; 
    }
		
		this._container.title = this.options.title;

		this._map = map;

		return this._container;
	},

	getText: function() {
		return this.options.text;
	},

	setText: function (text) {
		this.options.text = text;
    if(this.options.color){
      this._container.innerHTML = '<span style="color:'+this.options.color+'">'+this.options.text+'</span>';
      console.log('<span style="color:'+this.options.color+'">'+this.options.text+'</span>');
    }
    else{
     this._container.innerHTML = this.options.text; 
    }
	},

	getTitle: function () {
		return this.options.title;
	},

	setTitle: function (title) {
		this.options.title = title;
		this._container.title = title;
	},

	// A lil helper function when many "fields" need to be shown
	updateField: function (field, value) {
		var text = this.options.text;
		if (text.indexOf(field + ": ") === -1) {
			if (text) text += ", ";
			text += field + ": ";
		}

		var fields = text.split(", ");
		for (var i = 0; i < fields.length; ++i) {
			var parts = fields[i].split(": ");
			if (parts[0] == field) {
				if (value === null) {
					fields.splice(i, 1);
					break;
				} else {
					parts[1] = value;
				}
			}
			fields[i] = parts.join(": ");
		}
		text = fields.join(", ");
		this.setText(text);
	},
});

L.control.text = function (options) {
	return new L.Control.Text(options);
};
