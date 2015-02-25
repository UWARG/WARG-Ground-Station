var Path = (function ($, Data, Log, Network) {
    var exports = {};

    // Data objects here: array of L.LatLng objects
    var waypoints = [];

    // Interactive map objects here
    var map;
    var popup = L.popup();

    // Initialize map if necessary
    $(document).ready(function () {
        if (!map) {
            map = L.map('map').setView([43.53086, -80.5772], 17);
            map.attributionControl.setPrefix(false);

            L.tileLayer('sat_tiles/{z}/{x}/{y}.png', {
                maxZoom: 19
            }).addTo(map);

            map.on('click', mapClick);
        }
    });

    // Handle button clicks
    $(document).ready(function () {

        $('#lockOn').on('click', function () {
            // TODO Decouple this from plane marker & figure out somewhere to store last "sensible GPS coordinates"
            // (to prevent bug with erroneous GPS coordinates crashing Leaflet)
            if (planeMarker) {
                map.panTo(planeMarker.getLatLng());
            }
        });

        $('#sendWaypoints').on('click', function () {
            for (i = 0; i < waypoints.length; i++) {
                var latLng = waypoints[i];
                command = "new_Waypoint:" + latLng.lat + "," + latLng.lng + "\r\n";
                Network.write(command);
                Log.write(command);
            }
        });

        $('#clearWaypoints').on('click', function () {
            waypoints = [];
            redrawMap();
        });
    });

    function mapClick(e) {
        popup
            .setLatLng(e.latlng)
            .setContent('<div class="button" id="addWaypoint">Add Waypoint</div>')
            .openOn(map);

        $('#addWaypoint').on('click', function () {
            map.closePopup();
            waypoints.push(e.latlng);
            redrawMap();
        });
    }

    var planeIcon;
    var planeHollowIcon;
    var planeMarker;
    var gpsFixMessagebox;
    var waypointMarkerGroup;
    var waypointPolyline;
    var historyPolyline;

    Network.on('data', redrawMap);

    function redrawMap() {

        // Check for GPS fix, assuming we'll never fly off the coast of West Africa
        // (No GPS fix if coordinates close to (0; 0) or impossibly big)
        var gpsFix = (Math.abs(lat) > 1) && (Math.abs(lon) > 1) && (Math.abs(lat) < 360) && (Math.abs(lon) < 360);
        
        lat = Data.state.lat;
        lon = Data.state.lon;
        heading = Data.state.heading;
        yaw = Data.state.yaw;

        // Init icons for planeMarker if necessary
        if (!planeIcon) {
            planeIcon = L.icon({
                iconUrl: 'plane.png',
                iconSize: [30, 30],
            });
        }
        if (!planeHollowIcon) {
            planeHollowIcon = L.icon({
                iconUrl: 'plane-hollow.png',
                iconSize: [30, 30],
                title: 'No GPS fix',
            });
        }

        // Init planeMarker if necessary
        if (!planeMarker) {
            planeMarker = new L.RotatedMarker([lat, lon], {
                icon: planeIcon,
            }).addTo(map);
        }

        // Init messagebox about GPS fix
        if (!gpsFixMessagebox) {
            gpsFixMessagebox = L.control.messagebox({
                timeout: null,
                className: 'messagebox-gpsfix',
            }).addTo(map);
        }

        // Init waypoint marker layer-group if necessary
        if (!waypointMarkerGroup) {
            waypointMarkerGroup = L.layerGroup().addTo(map);
        }

        // Init waypointPolyline if necessary
        if (!waypointPolyline) {
            waypointPolyline = new L.Polyline(waypoints, {
                color: 'red',
                weight: 3,
                opacity: 0.5,
                clickable: false,
            }).addTo(map);
        }

        // Init historyPolyline if necessary
        if (!historyPolyline) {
            historyPolyline = new L.Polyline([], {
                color: '#0000ff',
                weight: 5,
                clickable: false,
            }).addTo(map);
        }


        // Update plane marker
        if (gpsFix) {
            planeMarker.setIcon(planeIcon);
            planeMarker.setLatLng(new L.LatLng(lat, lon));
            planeMarker._icon.title = lat + "°, " + lon + "°\nyaw " + Math.round(yaw) + "°, hdg " + heading + "°";
            planeMarker.options.angle = yaw;
            planeMarker.update();
        } else {
            planeMarker.setIcon(planeHollowIcon);
        }

        // Update gpsFix message box
        if (gpsFix) {
            gpsFixMessagebox.hide();
        } else {
            gpsFixMessagebox.show('No GPS fix');
        }

        // Redraw waypoint markers
        waypointMarkerGroup.clearLayers();
        for (var i = 0; i < waypoints.length; ++i) {
            waypointMarkerGroup.addLayer(new L.marker(waypoints[i]));
        }

        // Redraw waypoint polyline
        waypointPolyline.setLatLngs(waypoints).spliceLatLngs(0, 0, new L.LatLng(lat, lon));

        // Draw points on historyPolyline
        if (gpsFix) {
            historyPolyline.addLatLng(L.latLng(lat, lon));
        }
    }

    // Export what needs to be
    return exports;

})($, Data, Log, Network);