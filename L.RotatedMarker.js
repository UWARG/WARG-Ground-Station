// Define a rotated marker in Leaflet
L.RotatedMarker = L.Marker.extend({
    options: {
        angle: 0
    },
    _setPos: function (pos) {console.log('_setPos', pos);
        L.Marker.prototype._setPos.call(this, pos);
        this._icon.style[L.DomUtil.TRANSFORM] += ' rotate(' + this.options.angle + 'deg)';
    }
});