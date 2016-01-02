//Provides a marker with the capability of rotating itself by settings its angle property
L.RotatedMarker = L.Marker.extend({
    angle: 0,

    _setPos: function (pos) {
        L.Marker.prototype._setPos.call(this, pos);
        this._icon.style[L.DomUtil.TRANSFORM] += ' rotate(' + this.angle + 'deg)';
    }
});