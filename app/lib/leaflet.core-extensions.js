// Display LatLng altitude when converted to string
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

// Band-aid to preserve marker altitude when dragging
L.Handler.MarkerDrag.prototype._onDrag = function () {
	var marker = this._marker,
	    shadow = marker._shadow,
	    iconPos = L.DomUtil.getPosition(marker._icon),
	    latlng = marker._map.layerPointToLatLng(iconPos);

	// update shadow position
	if (shadow) {
		L.DomUtil.setPosition(shadow, iconPos);
	}

	latlng.alt = marker._latlng.alt;
	marker._latlng = latlng;

	marker
	    .fire('move', {latlng: latlng})
	    .fire('drag');
};