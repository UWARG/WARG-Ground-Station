var Path = (function ($, Data, Log, Network) {
    // Camera FOV: horz 94.38, vert 78.3

    var exports = {};

    // Data objects here: array of L.LatLng objects
    var waypoints = [];
    var localIndex = 0;
    exports.testPlaneWaypointIndex = null;

    var WAYPOINT_HOME = 255;
    var WAYPOINT_LEGACY_RADIUS = 13.1415926;    // Just a number here in case plane uses legacy waypoint following

    // Interactive map objects here
    var map;
    
    // Initialize map if necessary
    $(document).ready(function () {
        if (!map) {
            map = L.map('map').setView([43.53086, -80.5772], 17);
            map.attributionControl.setPrefix(false);

            L.tileLayer('sat_tiles/{z}/{x}/{y}.png', {
                maxZoom: 19
            }).addTo(map);
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

        $('#clearWaypoints').on('click', function () {
            // Clear local future waypoints

            // Replace local waypoints with those from readonlyPlotter[localIndex] through readonlyPlotter[nextIndex]
            // (These are the waypoints that have already been visited but still exist on the plane)
            var nextIndex = readonlyPlotter.getNextIndex();
            var pastLatLngs = readonlyPlotter.getLatLngs().slice(localIndex, nextIndex).map(function (latlng) {
                return new L.LatLng(latlng.lat, latlng.lng, latlng.alt);    // Clone object
            });
            localPlotter.setLatLngs(pastLatLngs);
            localPlotter.setNextIndex(pastLatLngs.length);
            
            redrawMap();
        });

        $('#sendWaypoints').on('click', function () {

            var readonlyLatLngs = readonlyPlotter.getLatLngs();
            var readonlyNextIndex = readonlyPlotter.getNextIndex();
            var localLatLngs = localPlotter.getLatLngs();
            var localNextIndex = localPlotter.getNextIndex();

            // Keep only past waypoints in readonly line
            readonlyLatLngs = readonlyLatLngs.filter(function (latlng, index) {
                return index < readonlyNextIndex;
            });

            // Keep only future waypoints + the previous waypoint in local line
            localLatLngs = localLatLngs.filter(function (latlng, index) {
                return index >= localNextIndex - 1;
            });

            // Copy over local future waypoints to readonly future waypoints
            var futureLatLngs = localLatLngs.map(function (latlng) {
                return new L.LatLng(latlng.lat, latlng.lng, latlng.alt);    // Clone object
            });

            // There's an edge case when readonly line is empty at start up
            if (!readonlyLatLngs.length) {
                readonlyPlotter.setLatLngs(futureLatLngs);
                localPlotter.setNextIndex(0);
                localIndex += localNextIndex;
            } else {
                futureLatLngs.shift();  // Don't copy over the previous waypoint, which is already in readonlyLatLngs
                readonlyPlotter.setLatLngs(readonlyLatLngs.concat(futureLatLngs));
                localPlotter.setNextIndex(1);
                localIndex += localNextIndex - 1;
            }
            localPlotter.setLatLngs(localLatLngs);

            // Upload new future waypoints
            var command = "clear_waypoints:0\r\n";
            Network.write(command);
            
            for (i = 0; i < futureLatLngs.length; i++) {
                var latLng = futureLatLngs[i];
                command = "new_Waypoint:" + latLng.lat + "," + latLng.lng + "," + latLng.alt + "," + WAYPOINT_LEGACY_RADIUS + "\r\n";
                Network.write(command);
            }

            command = "set_targetWaypoint:" + localPlotter.getNextIndex() + "\r\n";
            Network.write(command);

            // If we're overriding the waypointIndex we receive from plane, then simulate it accordingly
            if (exports.testPlaneWaypointIndex !== null) {
                exports.testPlaneWaypointIndex = localPlotter.getNextIndex();
            }
        });

        $('#goHome').on('click', function () {
            var command = "return_home\r\n";
            Network.write(command);
        });
    });

    var planeIcon;
    var planeHollowIcon;
    var planeMarker;
    var gpsFixMessagebox;
    var localPlotter;       // Contains local working copy of what we're planning
    var readonlyPlotter;    // Contains any wpt already visited + any future wpt currently on plane
    var lineToNextWaypoint;
    var historyPolyline;

    Network.on('data', redrawMap);

    function redrawMap() {

        var lat = parseFloat(Data.state.lat);
        var lon = parseFloat(Data.state.lon);

        // Check for GPS fix, assuming we'll never fly off the coast of West Africa
        // (No GPS fix if coordinates close to (0; 0) or impossibly big)
        var gpsFix = (Math.abs(lat) > 1) && (Math.abs(lon) > 1) && (Math.abs(lat) < 360) && (Math.abs(lon) < 360);
        
        var heading = Data.state.heading;
        var yaw = Data.state.yaw;
        var waypointIndex = Data.state.waypointIndex;

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

        // Init localPlotter if necessary
        if (!localPlotter) {
            localPlotter = L.Polyline.Plotter(waypoints, {
                future:  {color: '#f00', weight: 4, opacity: 0.8, dashArray: '3, 6'},
                present: {color: '#f00', weight: 4, opacity: 0.8, clickable: false},
                past:    {color: '#844', weight: 4, opacity: 0.8, clickable: false},
            }).addTo(map);
        }

        // Init readonlyPlotter if necessary
        if (!readonlyPlotter) {
            readonlyPlotter = L.Polyline.Plotter([], {
                readOnly: true,
                future:  {color: '#1a1a80', weight: 5, opacity: 1, clickable: false, dashArray: '3, 6'},
                present: {color: '#1a1a80', weight: 5, opacity: 1, clickable: false},
                past:    {color: '#0a0a33', weight: 5, opacity: 1, clickable: false},
            }).addTo(map);
        }

        // Init lineToNextWaypoint if necessary
        if (!lineToNextWaypoint) {
            lineToNextWaypoint = L.polyline([], {
                color: '#1a1a80', weight: 5, opacity: 0.8, clickable: false, dashArray: '3, 6',
            }).addTo(map);

            // When waypoints change, update line going from plane to next waypoint
            readonlyPlotter.on('change', function(e) {
                var nextWaypoint = readonlyPlotter.getNextLatLng();
                if (nextWaypoint) {
                    if (lineToNextWaypoint.getLatLngs().length) {
                        lineToNextWaypoint.spliceLatLngs(1, 1, {lat: nextWaypoint.lat, lng: nextWaypoint.lng});
                    }
                } else {
                    lineToNextWaypoint.setLatLngs([]);
                }
            });
        }

        // Init historyPolyline if necessary
        if (!historyPolyline) {
            historyPolyline = new L.Polyline([], {
                color: '#190019', opacity: 0.6, weight: 4, clickable: false,
            }).addTo(map);
        }


        // Update plane marker
        if (gpsFix) {
            planeMarker.setIcon(planeIcon);
            planeMarker.setLatLng(new L.LatLng(lat, lon));
            planeMarker.options.angle = yaw;
            planeMarker.update();
        } else {
            planeMarker.setIcon(planeHollowIcon);
        }
        planeMarker._icon.title = lat + "°, " + lon + "°\nyaw " + Math.round(yaw) + "°, hdg " + heading + "°\nnext-wpt: " + waypointIndex + (waypointIndex == WAYPOINT_HOME ? " (home)" : "");
        
        // Update gpsFix message box
        if (gpsFix) {
            gpsFixMessagebox.hide();
        } else {
            gpsFixMessagebox.show('No GPS fix');
        }

        // Update which waypoint we're targeting next & redraw lines accordingly
        if (exports.testPlaneWaypointIndex !== null) {
            // You can override waypointIndex received from plane by setting
            // Path.testPlaneWaypointIndex to some number (from the console)
            waypointIndex = exports.testPlaneWaypointIndex;
        }
        if (localPlotter.getNextIndex() != waypointIndex && waypointIndex != WAYPOINT_HOME) {
            // TODO Manage going home case
            readonlyPlotter.setNextIndex(waypointIndex + localIndex);
            localPlotter.setNextIndex(waypointIndex);
        }
        
        // When plane moves, update line going from plane to next waypoint
        if (gpsFix) {
            lineToNextWaypoint.spliceLatLngs(0, 1, {lat: lat, lng: lon});
        } else {
            lineToNextWaypoint.setLatLngs([]);
        }

        // Draw points on historyPolyline
        if (gpsFix) {
            historyPolyline.addLatLng(L.latLng(lat, lon));
        }
    }

    // Export what needs to be
    return exports;

})($, Data, Log, Network);