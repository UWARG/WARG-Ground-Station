
var Path = (function ($, Data, Log, Network) {
    var exports = {};

    // Data objects here
    var waypoints = [];

    // Interactive map objects here
    var map;
    var popup = L.popup();

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

        map.on('click', function (e) {
            popup
                .setLatLng(e.latlng)
                .setContent('<div class="button" id="addWaypoint">Add Waypoint</div>')
                .openOn(map);

            $('#addWaypoint').on('click', function () {
                map.closePopup();
                waypoints.push(e.latlng);
                redrawMap();
            });
        });
    });

    var planeMarker;
    var waypointMarkerGroup;
    var waypointPolyline;
    var historyPolyline;
    
    Network.on('data', redrawMap);

    function redrawMap() {

        lat = Data.state.lat;
        lon = Data.state.lon;
        heading = Data.state.heading;

        // Check for GPS fix, assuming we'll never fly off the coast of West Africa
        // (No GPS fix if coordinates close to (0; 0) or impossibly big)
        if (Math.abs(lat) < 1 || Math.abs(lon) < 1 || Math.abs(lat) > 360 || Math.abs(lon) > 360) {
            return;
        }


        // Init map if necessary
        if (!map) {
            map = L.map('map').setView([43.53086, -80.5772], 17);
            L.tileLayer('sat_tiles/{z}/{x}/{y}.png', {
                maxZoom: 19
            }).addTo(map);
        }

        // Init planeMarker if necessary
        if (!planeMarker) {
            planeMarker = new L.RotatedMarker([lat, lon], {
                icon: L.icon({
                    iconUrl: 'plane.png',
                    iconSize: [30, 30], // size of the icon
                }),
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
        planeMarker.setLatLng(new L.LatLng(lat, lon));
        planeMarker.options.angle = heading;
        planeMarker.options.title = lat + "°, " + lon + "°, " + heading + "°";
        planeMarker.update();
        
        // Redraw waypoint markers
        waypointMarkerGroup.clearLayers();
        for (var i = 0; i < waypoints.length; ++i) {
            waypointMarkerGroup.addLayer(new L.marker(waypoints[i]));
        }

        // Redraw waypoint polyline
        waypointPolyline.setLatLngs(waypoints).spliceLatLngs(0, 0, new L.LatLng(lat, lon));
        
        // Draw points on historyPolyline
        historyPolyline.addLatLng(L.latLng(lat, lon));
    }

    // Export what needs to be
    return exports;

})($, Data, Log, Network);