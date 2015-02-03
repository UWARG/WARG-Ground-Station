
var Path = (function ($, Data, Log, Network) {

    var map;

    var planeMarker;
    var planeIcon;
    
    var popup = L.popup();
    
    var waypointMarkers = [];
    var waypointPath;

    var historyPath;

    L.RotatedMarker = L.Marker.extend({
        options: {
            angle: 0
        },
        _setPos: function (pos) {
            L.Marker.prototype._setPos.call(this, pos);
            this._icon.style[L.DomUtil.TRANSFORM] += ' rotate(' + this.options.angle + 'deg)';
        }
    });

    $(document).ready(function () {
        map = L.map('map').setView([43.53086, -80.5772], 17);

        planeIcon = L.icon({
            iconUrl: 'plane.png',
            iconSize: [30, 30], // size of the icon
        });

        L.tileLayer('sat_tiles/{z}/{x}/{y}.png', {
            maxZoom: 19
        }).addTo(map);

        //Buttons
        $('#lockOn').on('click', function () {
            if (planeMarker != null) {
                map.panTo(planeMarker.getLatLng());
            }
        });

        $('#sendWaypoints').on('click', function () {
            for (i = 0; i < waypointMarkers.length; i++) {
                command = "new_Waypoint:" + waypointMarkers[i].getLatLng().lat + "," + waypointMarkers[i].getLatLng().lng + "\r\n";
                client.write(command);
                Log.write(command);
            }
        });

        $('#clearWaypoints').on('click', function () {
            for (i = 0; i < waypointMarkers.length; i++) {
                map.removeLayer(waypointMarkers[i]);
            }
            waypointMarkers = [];
            updateMap();
        });

        map.on('click', function (e) {
            popup
                .setLatLng(e.latlng)
                .setContent('<div class="button" id="addWaypoint">Add Waypoint</div>')
                .openOn(map);

            $('#addWaypoint').on('click', function () {
                map.closePopup();
                waypointMarkers.push(L.marker(e.latlng).addTo(map));
                updateMap();
            });
        });
    });

    Network.on('data', updateMap);

    function updateMap() {

        lat = Data.state.lat;
        lon = Data.state.lon;
        heading = Data.state.heading;

        // Assuming we'll never fly off the coast of West Africa:
        // Return if GPS coordinates are close to (0; 0) or impossibly big.
        if (Math.abs(lat) < 1 || Math.abs(lon) < 1 || Math.abs(lat) > 360 || Math.abs(lon) > 360) return;

        if (planeMarker) map.removeLayer(planeMarker);
        planeMarker = new L.RotatedMarker([lat, lon], {
            icon: planeIcon,
            angle: heading,
            title: lat + "°, " + lon + "°, " + heading + "°",
        }).addTo(map);

        if (waypointPath) map.removeLayer(waypointPath);
        var line = [];
        line.push(planeMarker.getLatLng());
        for (var i = 0; i < waypointMarkers.length; i++) {
            line.push(waypointMarkers[i].getLatLng());
        }
        waypointPath = new L.Polyline(line, {
            color: 'red',
            weight: 3,
            opacity: 0.5,
            smoothFactor: 1
        });
        waypointPath.addTo(map);

        if (!historyPath) {
            historyPath = new L.Polyline([], {
                smoothFactor: 1.0,
                color: '#000',
                fillColor: '#fff',
                weight: 2,
                clickable: false,
            });
            historyPath.addTo(map);
        }
        historyPath.addLatLng(L.latLng(lat, lon));
    }

    // Don't export anything
    return {};

})($, Data, Log, Network);