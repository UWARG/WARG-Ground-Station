/*
Copyright (c) 2013 Nathan Mahdavi

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
/* The source code in this file has been heavily modified from original */

L.Polyline.plotter = L.Class.extend({
    includes: [L.Mixin.Events],

    _past: null,    // L.Polyline
    _present: null, // L.Polyline (actually just one line connecting past & future)
    _future: null,  // L.Polyline

    _latLngs: null,
    _nextIndex: 0,  // Must be positive; 0 indicates all waypoints are in the future
                    // Also, Plotter will never modify _nextIndex.

    _pastMarkers: null,
    _futureMarkers: null,

    _ghostMarker: L.marker(L.LatLng(0, 0), {icon: L.divIcon({className: 'leaflet-div-icon leaflet-editing-icon'}), opacity: 0.5}),
    _isHoveringPath: false,
    _indexOfDraggedPoint: -1,   // If point currently being dragged, this is its index (counted after _nextIndex)
    
    _editIcon: L.divIcon({className: 'leaflet-div-icon leaflet-editing-icon'}),
    _disabledIcon: L.divIcon({className: 'leaflet-div-icon leaflet-disabled-icon'}),
    options: {
        future: {color: '#f00', weight: 2, opacity: 0.5},
        present: {color: '#900', weight: 2, opacity: 0.5},
        past: {color: '#000', weight: 2, opacity: 0.5},
        defaultAlt: 30,
        minSpacing: 0,
        readOnly: false,
    },
    initialize: function (latlngs, options){
        this._latLngs = latlngs;

        L.Util.setOptions(this, options);
        this._future = L.polyline([], options.future);
        this._present = L.polyline([], options.present);
        this._past = L.polyline([], options.past);

        this._pastMarkers = [];
        this._futureMarkers = [];
    },
    addTo: function (map) {
        map.addLayer(this);
        return this;
    },
    onAdd: function (map) {
        this._past.addTo(map);
        this._present.addTo(map);
        this._future.addTo(map);
        this._map = map;
        this._redrawMarkers();
        if (!this.options.readOnly) {
            this._bindMapClick();
            this._bindPathHover();
            this._bindGhostMarkerEvents();
        }
    },
    onRemove: function(){
        this._removeAllMarkers();
        if (!this.options.readOnly) {
            this._unbindMapClick();
            this._unbindPathHover();
            this._unbindGhostMarkerEvents();
        }
        this._map.removeLayer(this._past);
        this._map.removeLayer(this._present);
        this._map.removeLayer(this._future);
    },
    getLatLngs: function(){
        return this._latLngs;
    },
    setLatLngs: function(latlngs){
        this._latLngs = latlngs;
        this._redrawMarkers();
        this._redrawLines();
        this._fireChangeEvent();
    },
    setMinSpacing: function (minSpacing) {
        this.options.minSpacing = minSpacing;
    },
    getActualMinSpacing: function () {
        var self = this;
        return this._latLngs.slice(0, this._latLngs.length - 1).map(function (latLng, index) {
            return latLng.distanceTo(self._latLngs[index + 1]);
        }).reduce(function (prev, curr) {
            return Math.min(prev, curr);
        }, Infinity);
    },
    getNextIndex: function(){
        return this._nextIndex;
    },
    setNextIndex: function(nextIndex){
        this._nextIndex = parseInt(nextIndex);
        if (this._nextIndex < 0) {
            this._nextIndex = 0;
            console.error('Plotter being set to a negative nextIndex', nextIndex);
        }
        this._redrawMarkers();
        this._redrawLines();
        this._fireChangeEvent();
    },
    getNextLatLng: function(){
        var latLng = this._latLngs[this._nextIndex];
        return latLng ? L.latLng(latLng) : null;
    },
    setReadOnly: function(readOnly){
        if(readOnly && !this.options.readOnly){
            // Set read-only
            var markerFunction = '_unbindMarkerEvents';
            this._unbindMapClick();
            this._unbindPathHover();
            this._unbindGhostMarkerEvents();
        }else if(!readOnly && this.options.readOnly){
            // Unset read-only
            var markerFunction = '_bindMarkerEvents';
            this._bindMapClick();
            this._bindPathHover();
            this._bindGhostMarkerEvents();
        }
        if(typeof markerFunction !== 'undefined'){
            this.options.readOnly = readOnly;
            for(index in this._futureMarkers){
                this[markerFunction](this._futureMarkers[index]);
            }
        }
    },
    setAllAltitudes: function(altitude){    // This probably shouldn't be in Plotter (not really its responsibility)
        this._latLngs.forEach(function (latLng) {
            latLng.alt = altitude;
        });
        this._redrawMarkers();
        this._redrawLines();
        this._fireChangeEvent();
    },
    _bindMapClick: function(){
        this._map.on('contextmenu', this._onMapRightClick, this);
    },
    _unbindMapClick: function(){
        this._map.off('contextmenu', this._onMapRightClick, this);
    },
    _bindPathHover: function(){
    	this._map.on('mousemove', this._checkPathHover, this);
    },
    _unbindPathHover: function(){
    	this._map.off('mousemove', this._checkPathHover, this);
    },
    _checkPathHover: function(e){
        // Called on every mouse movement; handles all the path hovering effects.
    	var p = e.containerPoint;
    	var i = this._indexOfHoveredSegment(p);
    	if (i != -1) {
    		p1 = this._map.latLngToContainerPoint(this._futureMarkers[i]._latlng);
    		p2 = this._map.latLngToContainerPoint(this._futureMarkers[i+1]._latlng);
    		this._doPathHover(this._map.containerPointToLatLng(L.LineUtil.closestPointOnSegment(p, p1, p2)));
    	} else {
    		this._endPathHover();
    	}
    },
    _indexOfHoveredSegment: function(p) {
    	// Return index i of 1st endpoint of line segment closest to p (2nd endpoint of segment is at i + 1)
    	// or -1 if no segment hovered; operates in screen space
    	var p1, p2, distances = [];

        for (var i = 0, l = this._futureMarkers.length; i < l - 1; ++i) {
    		p1 = this._map.latLngToContainerPoint(this._futureMarkers[i]._latlng);
    		p2 = this._map.latLngToContainerPoint(this._futureMarkers[i+1]._latlng);
    		distances.push(this._snapDistanceToSegment(p, p1, p2, 7, 14));
    	}

    	var closestDistance = Math.min.apply(Math, distances);
    	if (closestDistance === Infinity || closestDistance === -1) {
            // Disable hovering when mouse too near a waypoint marker
    		return -1;
    	}
    	
    	return distances.indexOf(closestDistance);
    },
    _snapDistanceToSegment: function(p, p1, p2, r, re) {
    	// If p within r of segment & not within re of endpoints, return distance of p to segment p1-p2
    	// If snapDistanceToSegment is within re of endpoints, return -1
    	// Else, return Infinity
    	var x  =  p.x, y  =  p.y,
    		x1 = p1.x, y1 = p1.y,
    		x2 = p2.x, y2 = p2.y;

    	r = r || 7;
    	re = re || 14;

    	// Check re < |p-p1| < |p1-p2| & re < |p-p2| < |p1-p2|
    	var l2 = (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2);
    	var d1 = (x-x1)*(x-x1)+(y-y1)*(y-y1);
    	var d2 = (x-x2)*(x-x2)+(y-y2)*(y-y2);
    	if ( d1 <= re*re || d2 <= re*re ) {
    		return -1;
    	} else if ( d1 >= l2 || d2 >= l2 ) {
    		return Infinity;
    	}

    	// Check within r of segment (http://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line)
    	var d = Math.abs((y2-y1)*x - (x2-x1)*y + x2*y1 - y2*x1) / Math.sqrt(l2);
    	if (d >= r) {
    		return Infinity;
    	}

    	return d;
    },
    _doPathHover: function(latlng){
    	this._ghostMarker.setLatLng(latlng);

    	if (!this._isHoveringPath) {
    		this._ghostMarker.addTo(this._map);
    		this._ghostMarker.dragging.enable();
    	}
    	this._isHoveringPath = true;
    },
    _endPathHover: function(){
    	if (this._isHoveringPath) {
    		this._ghostMarker.dragging.disable();
    		this._map.removeLayer(this._ghostMarker);
    	}
    	this._isHoveringPath = false;
    },
    _bindGhostMarkerEvents: function(){
    	this._ghostMarker.on('dragstart', this._onGhostDragStart, this);
    	this._ghostMarker.on('drag', this._onGhostDrag, this);
    	this._ghostMarker.on('dragend', this._onGhostDragEnd, this);
    },
    _unbindGhostMarkerEvents: function(){
    	this._ghostMarker.off('dragstart', this._onGhostDragStart, this);
    	this._ghostMarker.off('drag', this._onGhostDrag, this);
    	this._ghostMarker.off('dragend', this._onGhostDragEnd, this);
    },
    _onGhostDragStart: function(e){
    	var p = this._map.latLngToContainerPoint(this._ghostMarker.getLatLng());
    	var i = this._indexOfHoveredSegment(p);
    	if (i == -1) return;   // Don't allow inserting between two past waypoints

        this._indexOfDraggedPoint = i+1;
    	this._unbindPathHover();
    	this._ghostMarker.setOpacity(1);

        var latLng = this._ghostMarker.getLatLng();
        latLng.alt = ((this._latLngs.length >= 1) ?
            Math.ceil(0.5 * this._latLngs[this._indexOfDraggedPoint + this._nextIndex - 1].alt + 0.5 * this._latLngs[this._indexOfDraggedPoint + this._nextIndex].alt)
          : this.options.defaultAlt
        );
        this._latLngs.splice(this._indexOfDraggedPoint + this._nextIndex, 0, this._ghostMarker.getLatLng());

        this._redrawMarkers();
    	this._redrawLines();
        
    },
    _onGhostDrag: function(e){
    	if (this._indexOfDraggedPoint == -1) return;
        this._ghostMarker.setOpacity(0.5);
    	
        var latLng = this._ghostMarker.getLatLng();
        this._latLngs[this._indexOfDraggedPoint + this._nextIndex].lat = latLng.lat;
        this._latLngs[this._indexOfDraggedPoint + this._nextIndex].lng = latLng.lng;
        this._latLngs[this._indexOfDraggedPoint + this._nextIndex].alt = latLng.alt;
        this._futureMarkers[this._indexOfDraggedPoint].setLatLng(this._ghostMarker.getLatLng());
    	this._redrawLines();
        this._fireDragEvent();
    },
    _onGhostDragEnd: function(e){
        this._bindPathHover();

        // If ghost drag finished violating min spacing, delete it
        var i = this._indexOfDraggedPoint;
        var neighbors = [];
        if (this._latLngs[i + this._nextIndex - 1]) neighbors.push(this._latLngs[i + this._nextIndex - 1]);
        if (this._latLngs[i + this._nextIndex + 1]) neighbors.push(this._latLngs[i + this._nextIndex + 1]);
        if (!this._checkMinSpacing(this._latLngs[i + this._nextIndex], neighbors)) {
            this._latLngs.splice(i + this._nextIndex, 1);
            this._redrawMarkers();
            this._redrawLines();
        }

    	this._indexOfDraggedPoint = -1;
    	this._fireChangeEvent();
    },
    _fireChangeEvent: function(){
    	this.fire('change');
    },
    _fireDragEvent: function(){
        this.fire('drag');
    },
    _getNewMarker: function(latlng, options){
        return new L.altitudeMarker(latlng, options);
    },
    _unbindMarkerEvents: function(marker){
        marker.off('change', this._onMarkerChange, this);
        marker.off('contextmenu', this._onMarkerRightClick, this);
        marker.off('drag', this._onMarkerDrag, this);
        marker.off('dragend', this._fireChangeEvent, this);
        marker.dragging.disable();
    },
    _bindMarkerEvents: function(marker){
        marker.on('change', this._onMarkerChange, this);
        marker.on('contextmenu', this._onMarkerRightClick, this);
        marker.on('drag', this._onMarkerDrag, this);
        marker.on('dragend', this._fireChangeEvent, this);
        marker.dragging.enable();
    },
    _addToMapAndBindMarker: function(newMarker){
        newMarker.addTo(this._map);
        if(!newMarker.options.readOnly){
            this._bindMarkerEvents(newMarker);
        }
    },
    _onMarkerChange: function(e){
        var index = this._futureMarkers.indexOf(e.target);
        if (index == -1) return;    // Only allow deleting future markers

        this._latLngs[index + this._nextIndex].alt = e.target.getLatLng().alt;
    },
    _onMarkerRightClick: function(e){
        var index = this._futureMarkers.indexOf(e.target);
        if (index == -1) return;    // Only allow deleting future markers

        this._latLngs.splice(index + this._nextIndex, 1);
        this._redrawMarkers();
        this._redrawLines();
        this._fireChangeEvent();
    },
    _onMarkerDrag: function(e){
        var index = this._futureMarkers.indexOf(e.target);
        if (index == -1) return;    // Only allow dragging future markers
        
        var latLng = e.target.getLatLng();

        // Abort drag if min spacing being violated
        var neighbors = [];
        if (this._latLngs[index + this._nextIndex - 1]) neighbors.push(this._latLngs[index + this._nextIndex - 1]);
        if (this._latLngs[index + this._nextIndex + 1]) neighbors.push(this._latLngs[index + this._nextIndex + 1]);
        if (!this._checkMinSpacing(latLng, neighbors)) {
            this._redrawMarkers();
            this._redrawLines();
            return;
        }

        // Assigning properties separately, because altitude is missing from e.target.getLatLng()
        this._latLngs[index + this._nextIndex].lat = latLng.lat;
        this._latLngs[index + this._nextIndex].lng = latLng.lng;

        this._redrawLines();
        this._fireDragEvent();
    },
    _checkMinSpacing: function(inputLatLng, latLngList) {   // true means all good
        var self = this;
        if (this.options.minSpacing <= 0) return true;
        return !latLngList.some(function (latLng) {
            return inputLatLng.distanceTo(latLng) < self.options.minSpacing;
        });
    },
    _onMapRightClick: function(e){
        e.latlng.alt = (this._latLngs.length >= 1) ? this._latLngs[this._latLngs.length-1].alt : this.options.defaultAlt;

        // Check min spacing
        if (!this._checkMinSpacing(e.latlng, this._latLngs.slice(-1))) {
            return;
        }

        this._latLngs.push(e.latlng);
        this._redrawMarkers();
        this._redrawLines();
        this._fireChangeEvent();
    },
    _removeAllMarkers: function(){
        var index;
        for(index in this._pastMarkers){
            this._map.removeLayer(this._pastMarkers[index]);
        }
        this._pastMarkers = [];
        for(index in this._futureMarkers){
            this._map.removeLayer(this._futureMarkers[index]);
        }
        this._futureMarkers = [];
    },
    _redrawMarkers: function(){
        // Make past & future markers
        this._removeAllMarkers();
        for(index in this._latLngs){
            if (index < this._nextIndex) {
                var newMarker = this._getNewMarker(this._latLngs[index], { icon: this._disabledIcon, readOnly: true });
                this._addToMapAndBindMarker(newMarker);
                this._pastMarkers.push(newMarker);
            } else if (index >= this._nextIndex) {
                var newMarker = this._getNewMarker(this._latLngs[index], { icon: this._editIcon, zIndexOffset: 1000 , readOnly: this.options.readOnly, clickable: !this.options.readOnly });
                this._addToMapAndBindMarker(newMarker);
                this._futureMarkers.push(newMarker);
            }
        }
        this._redrawLines();
    },
    _redrawLines: function(){
        this._past.setLatLngs([]);
        this._present.setLatLngs([]);
        this._future.setLatLngs([]);

        for(index in this._latLngs){
            if (index < this._nextIndex) {
                this._past.addLatLng(this._latLngs[index]);
            }
            if (index == this._nextIndex - 1 || index == this._nextIndex) {
                this._present.addLatLng(this._latLngs[index]);
            }
            if (index >= this._nextIndex) {
                this._future.addLatLng(this._latLngs[index]);
            }
        }
    }
});

L.Polyline.Plotter = function(latlngs, options){
    return new L.Polyline.plotter(latlngs, options);
};