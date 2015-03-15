var Path = (function ($, Data, Log, Network) {
    // Camera FOV: horz 94.38, vert 78.3

    var exports = {};

    // Data objects here: array of L.LatLng objects
    var waypoints = [];
    var localWaypointIndex = 0;

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
            saveVisitedWaypoints();

            // Clear newer waypoints
            var visitedLatLngs = visitedPlotter.getLatLngs();
            if (visitedLatLngs.length) {
                waypoints = [visitedLatLngs[visitedLatLngs.length - 1]];
                localWaypointIndex = 1;
            } else {
                waypoints = [];
                localWaypointIndex = 0;
            }

            waypointPlotter.setLatLngs(waypoints);
            waypointPlotter.setNextIndex(localWaypointIndex);
            redrawMap();
        });

        $('#sendWaypoints').on('click', function () {

            saveVisitedWaypoints();

            var command = "clear_waypoints:0\r\n";
            Network.write(command);
            
            for (i = 0; i < waypoints.length; i++) {
                var latLng = waypoints[i];
                command = "new_Waypoint:" + latLng.lat + "," + latLng.lng + "," + latLng.alt + "," + WAYPOINT_LEGACY_RADIUS + "\r\n";
                Network.write(command);
            }

            command = "set_targetWaypoint:" + localWaypointIndex + "\r\n";
            Network.write(command);
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
    var visitedPlotter;     // Contains & displays waypoints which at previous upload
    var waypointPlotter;    // Contains any waypoints added after previous upload (could be visited, or not); essentially a working copy
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

        // Init visitedPlotter if necessary
        if (!visitedPlotter) {
            visitedPlotter = L.Polyline.Plotter([], {
                readOnly: true,
                future:  {color: '#f0f', weight: 10, opacity:   1},
                present: {color: '#0f0', weight:  5, opacity: 0.6, clickable: false, dashArray: '3, 8'},
                past:    {color: '#0f0', weight:  5, opacity: 0.6, clickable: false},
            }).addTo(map);

            visitedPlotter.setNextIndex(Number.MAX_SAFE_INTEGER);
        }

        // Init waypointPlotter if necessary
        if (!waypointPlotter) {
            waypointPlotter = L.Polyline.Plotter(waypoints, {
                future:  {color: '#f00', weight: 5, opacity: 0.6},
                present: {color: '#000', weight: 5, opacity: 0.6, clickable: false, dashArray: '3, 8'},
                past:    {color: '#000', weight: 5, opacity: 0.6, clickable: false},
            }).addTo(map);

            waypointPlotter.on('change', function(e) {
                waypoints = waypointPlotter.getLatLngs();
            });
        }

        // Init lineToNextWaypoint if necessary
        if (!lineToNextWaypoint) {
            lineToNextWaypoint = L.polyline([], {
                color: '#f00', weight: 5, opacity: 0.6, clickable: false, dashArray: '3, 8',
            }).addTo(map);

            // When waypoints change, update line going from plane to next waypoint
            waypointPlotter.on('change drag', function(e) {
                var nextWaypoint = waypointPlotter.getNextLatLng();
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
                color: '#0000ff',
                weight: 5,
                clickable: false,
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

        // Update which waypoint we're targeting next (if we're in sync)
        localWaypointIndex = waypointIndex;
        if (waypointPlotter.getNextIndex() != localWaypointIndex && localWaypointIndex != WAYPOINT_HOME) {
            // TODO Manage going home case better
            waypointPlotter.setNextIndex(localWaypointIndex);
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

    var saveVisitedWaypoints = exports.mig = function () {
        var latLngs = waypointPlotter.getLatLngs();
        var nextIndex = waypointPlotter.getNextIndex();

        // Get lat-lons that just became old (i.e. will migrate to the visited list)
        var oldLatLngs = latLngs.filter(function (latLng, index) {
            return index < nextIndex;
        });
        console.log('oldLatLngs', oldLatLngs);

        // Return if nothing old to migrate
        if (!oldLatLngs.length) {
            console.log('Nothing old to migrate');
            return;
        }
        
        // Put old waypoints into visited list
        var visitedLatLngs = visitedPlotter.getLatLngs();
        if (!visitedLatLngs.length) {
            console.log('set empty visited latlngs to', oldLatLngs);
            visitedPlotter.setLatLngs(oldLatLngs);
            console.log('visitedPlotter', visitedPlotter);
        } else {
            oldLatLngs.shift();     // Remove 1st old waypoint, which visitedPlotter already has from an older migrate
            console.log('appended to visited latlngs', oldLatLngs);
            visitedPlotter.setLatLngs(visitedLatLngs.concat(oldLatLngs));
            console.log('visitedPlotter', visitedPlotter);
        }

        // Remove old waypoints from working list
        var remainingLatLngs = latLngs.filter(function (latLng, index) {
            return index >= nextIndex - 1;
        });
        localWaypointIndex = 1;
        waypointPlotter.setLatLngs(remainingLatLngs);
        waypointPlotter.setNextIndex(localWaypointIndex);
        console.log('waypointPlotter', waypointPlotter);
    };

    // Export what needs to be
    return exports;

})($, Data, Log, Network);