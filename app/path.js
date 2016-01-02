var Path = (function ($, Data, Log, Network, Mousetrap, HeightGraph) {
    // Camera FOV: horz 94.38, vert 78.3

    var exports = {};
    var fs = require('fs');

    // Data objects here: array of L.LatLng objects
    var waypoints = [];
    exports.testPlaneWaypointIndex = null;

    var WAYPOINT_HOME = 255;
    var waypoint_default_alt = 100; // Default altitude for all waypoints
    var waypoint_radius = 2; // The turning radius around each waypoint

    // Interactive objects here
    var map, localPath, status;
    var clearHistoryPopup;

    $(document).ready(function () {
        if (!map) {
            // Init localPath if necessary
            localPath = L.Polyline.Plotter(waypoints, {
                future: {
                    color: '#f21818',
                    weight: 4,
                    opacity: 1,
                    dashArray: '3, 6'
                },
                present: {
                    color: '#ff00ff',
                    weight: 5,
                    opacity: 0.1,
                    clickable: false
                }, // Shouldn't ever appear
                past: {
                    color: '#ff00ff',
                    weight: 5,
                    opacity: 0.1,
                    clickable: false
                }, // Shouldn't ever appear
                defaultAlt: waypoint_default_alt,
                minSpacing: waypoint_radius * 4,
            }).addTo(map);
            localPath.setNextIndex(0);
            exports.localPath = localPath;
        }
    });

    // Set initial values of altitude & radii displays
    $(document).ready(function () {
        $('#display-altitudes').text(waypoint_default_alt);
        $('#display-radii').text(waypoint_radius);
    });

    // Handle button clicks
    $(document).ready(function () {

        $('#loadWaypoints').on('click', function () {
            var f = $('<input type="file" id="pathLoadFile" accept=".setting,.path">').click();
            f.one('change', function () {
                if (!f[0].files[0]) return;
                var filepath = f[0].files[0].path;
                var filename = f[0].files[0].name;

                var txt = fs.readFileSync(filepath);
                var loadedPath = JSON.parse(txt).map(function (latLng) {
                    var obj = L.latLng(latLng.lat, latLng.lng);
                    obj.alt = latLng.alt;
                    return obj;
                });
                console.log(loadedPath);

                var newPath = localPath.getLatLngs().concat(loadedPath);
                localPath.setLatLngs(newPath);
                Log.info("Path Loaded " + loadedPath.length + " red waypoints from " + filename);
            });
        });

        $('#saveWaypoints').on('click', function () {
            var f = $('<input type="file" id="pathSaveFile" nwsaveas="awesome.path">').click();
            f.one('change', function () {
                if (!f[0].files[0]) return;
                var filepath = f[0].files[0].path;
                var filename = f[0].files[0].name;

                var latLngs = localPath.getLatLngs().filter(function (latLng, index) {
                    return index >= localPath.getNextIndex();
                });

                var txt = JSON.stringify(latLngs);
                fs.writeFile(filepath, txt, function (err) {
                    if (err) throw err;
                    Log.info("Path Saved " + latLngs.length + " red waypoints in " + filename);
                });
            });
        });

        $('#clearWaypoints').on('click', function () {
            // Clear all waypoints in localPath
            localPath.setLatLngs([]);

            redrawMap();

            Log.debug("Path Operator cleared local waypoints");
        });

        var uploadInterval;
        exports.ui = function(){return uploadInterval};

        $('#sendWaypoints').on('click', function () {

            // Check plane is not within minimum spacing of next waypoint at this moment
            if (localPath.getNextLatLng() && Data.state.lat && Data.state.lon) {
                var planeLatLng = L.latLng(Data.state.lat, Data.state.lon);
                var planeSpacing = planeLatLng.distanceTo(localPath.getNextLatLng());
                if (planeSpacing < localPath.options.minSpacing) {
                    alert("Plane too close to next waypoint.\nTry again in a bit.");
                    Log.error("Path Cannot send; plane too close to next waypoint (" + Math.round(planeSpacing * 10) / 10 + " < " + localPath.options.minSpacing + ")");
                    return;
                }
            }

            // Sanity check if plane is there
            if (!passedPath || !remotePath) {
                Log.error("Path Cannot send; no valid data received from plane so far");
                return;
            }

            Log.debug("Path Operator is sending waypoints");
            Log.debug("Path passedPath: " + JSON.stringify({
                nextIndex: passedPath.getNextIndex(),
                latLngs: passedPath.getLatLngs()
            }));
            Log.debug("Path remotePath: " + JSON.stringify({
                nextIndex: remotePath.getNextIndex(),
                latLngs: remotePath.getLatLngs()
            }));
            Log.debug("Path localPath: " + JSON.stringify({
                nextIndex: localPath.getNextIndex(),
                latLngs: localPath.getLatLngs()
            }));

            // Move past waypoints from remotePath into passedPath
            var passedLatLngs = passedPath.getLatLngs().concat(
                remotePath.getLatLngs().filter(function (latlng, index) {
                    return index < remotePath.getNextIndex();
                })
            );
            passedPath.setLatLngs(passedLatLngs);

            // Retain only future waypoints in localPath (delete all past ones)
            var localLatLngs = localPath.getLatLngs().filter(function (latlng, index) {
                return index >= localPath.getNextIndex();
            });
            localPath.setLatLngs(localLatLngs);
            localPath.setNextIndex(0);

            // Replace waypoints in remotePath with those from localPath
            var remoteLatLngs = localPath.getLatLngs().map(function (latlng, index) {
                return new L.LatLng(latlng.lat, latlng.lng, latlng.alt); // Clone object
            });
            remotePath.setLatLngs(remoteLatLngs);
            remotePath.setNextIndex(0);

            // Hack to force localPath to redraw its markers (so they reappear on top)
            localPath.setNextIndex(localPath.getNextIndex());

            // Clear current waypoints on plane
            var command = "clear_waypoints:0\r\n";
            Network.dataRelay.write(command);

            // Upload new waypoints; or if no new waypoints, order to go home
            var remoteLatLngs = remotePath.getLatLngs();
            if (remoteLatLngs.length) {
                var latLngQueue = remoteLatLngs.slice(0);

                uploadInterval = setInterval(function () {
                    var latLng = latLngQueue.shift();
                    var totalCount = remotePath.getLatLngs().length;
                    var remainingCount = latLngQueue.length;
                    if (!latLng) {
                        // No more waypoints to upload
                        clearInterval(uploadInterval);
                        Log.info("Path Send waypoint complete, total count is " + totalCount);
                        Log.info("Path Plane says waypointCount is " + Data.state.waypointCount);
                    } else {
                        // Upload a waypoint
                        command = "new_Waypoint:" + latLng.lat + "," + latLng.lng + "," + latLng.alt + "," + waypoint_radius + "\r\n";
                        Network.dataRelay.write(command);
                        Log.info("Path Sent waypoint " + (totalCount - remainingCount) + "/" + totalCount);
                    }
                }, 150);
                // for (i = 0, l = remoteLatLngs.length; i < l; i++) {
                //     var latLng = remoteLatLngs[i];
                //     command = "new_Waypoint:" + latLng.lat + "," + latLng.lng + "," + latLng.alt + "," + waypoint_radius + "\r\n";
                //     Network.dataRelay.write(command);
                // }

            } else {
                // Probably uploading just after clearing waypoints; go home then.
                // TODO Or even just do nothing -- clearing waypoints makes plane automatically go home
                command = "return_home:0\r\n";
                Network.dataRelay.write(command);
                Log.debug("Path Returning home, nothing sent, probably because operator cleared waypoints before pressing send");
            }

            // If we're overriding the waypointIndex we receive from plane, then simulate it accordingly
            if (exports.testPlaneWaypointIndex !== null) {
                exports.testPlaneWaypointIndex = remotePath.getNextIndex();
            }

            Log.debug("Path Waypoints have been sent, and map paths updated");
            Log.debug("Path passedPath: " + JSON.stringify({
                nextIndex: passedPath.getNextIndex(),
                latLngs: passedPath.getLatLngs()
            }));
            Log.debug("Path remotePath: " + JSON.stringify({
                nextIndex: remotePath.getNextIndex(),
                latLngs: remotePath.getLatLngs()
            }));
            Log.debug("Path localPath: " + JSON.stringify({
                nextIndex: localPath.getNextIndex(),
                latLngs: localPath.getLatLngs()
            }));
        });

        $('#go_home').on('click', function () {
            var command = "return_home:0\r\n";
            Network.dataRelay.write(command);
            Log.debug("Path Operator sent Go home");
        });

        $('#cancel_go_home').on('click', function () {
            var command = "cancel_returnHome:0\r\n";
            Network.dataRelay.write(command);
            Log.debug("Path Operator sent Go home");
        });
    });

    // Handle key presses
    Mousetrap.bind(["f8"], function () {
        // Press f8 to mark location as interesting in the logfile
        Log.debug('Path F8 pressed - This location is flagged as interesting');
    });
    Mousetrap.bind(["mod+t"], function () {
        $(document.body).toggleClass('target-acquisition');
        if (map) {
            map.invalidateSize(false);
        }
    });
    Mousetrap.bind(["alt+a"], function (e) {
        var value;
        while (!value) {
            value = prompt("Set all waypoint altitudes to how many meters?", waypoint_default_alt);
            if (value === null) return;
            value = parseFloat(value);
        }

        waypoint_default_alt = value;
        $('#display-altitudes').text(waypoint_default_alt);
        if (localPath) {
            localPath.setAllAltitudes(value);
            localPath.options.defaultAlt = value;
        }
        Log.info("Path Set all waypoint altitudes to " + value);
    });
    Mousetrap.bind(["alt+r"], function () {
        var value;
        while (!value) {
            value = prompt("Set all waypoint radii to how many meters?", waypoint_radius);
            if (value === null) return;
            value = parseFloat(value);
        }

        waypoint_radius = value;
        $('#display-radii').text(waypoint_radius);
        if (localPath) {
            localPath.setMinSpacing(value * 4);
            var actualMinSpacing = localPath.getActualMinSpacing();
            if (actualMinSpacing < value * 4) {
                console.log(actualMinSpacing, value * 4);
                var recommended = Math.floor(actualMinSpacing / 4);
                alert("Some waypoints are closer than that.\nRecommend radius of at most " + recommended + " m.");
            }
        }
        Log.info("Path Set all waypoint radii to " + value + (recommended ? " (" + recommended + " recommended)" : ""));
    });

    var planeIcon;
    var planeHollowIcon;
    var planeMarker;
    var gpsFixMessagebox;
    var passedPath; // Contains any wpts we're sure to have already passed (flown over)
    var localPath; // Contains local working copy of what we're planning
    var remotePath; // Contains any wpts currently on plane & index of wpt plane is travelling to
    var remoteToLocal; // Line connecting current waypoint on plane to next local waypoint
    var passedToRemote; // Line connecting end of passedPath to begining of remotePath
    var planeToNextRemote; // Line connecting current plane position to next waypoint on plane
    var historyPolyline;

    Network.dataRelay.on('data', redrawMap);

    function redrawMap() {

        var lat = parseFloat(Data.state.lat);
        var lon = parseFloat(Data.state.lon);
        var alt = parseFloat(Data.state.altitude);

        // Check for GPS fix, assuming we'll never fly off the coast of West Africa
        // (No GPS fix if coordinates close to (0; 0) or impossibly big)
        var gpsFix = (Math.abs(lat) > 1) && (Math.abs(lon) > 1) && (Math.abs(lat) < 360) && (Math.abs(lon) < 360);

        var heading = Data.state.heading;
        var yaw = Data.state.yaw;
        var waypointIndex = Data.state.waypointIndex;

        // Init icons for planeMarker if necessary
        if (!planeIcon) {
            planeIcon = L.icon({
                iconUrl: 'assets/images/plane.png',
                iconSize: [30, 30],
            });
        }
        if (!planeHollowIcon) {
            planeHollowIcon = L.icon({
                iconUrl: 'assets/images/plane-hollow.png',
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

        // Init passedPath if necessary
        if (!passedPath) {
            passedPath = L.Polyline.Plotter([], {
                readOnly: true,
                future: {
                    color: '#ff00ff',
                    weight: 5,
                    opacity: 0.1,
                    clickable: false
                }, // Shouldn't ever appear
                present: {
                    color: '#ff00ff',
                    weight: 5,
                    opacity: 0.1,
                    clickable: false
                }, // Shouldn't ever appear
                past: {
                    color: '#09092e',
                    weight: 5,
                    opacity: 1,
                    clickable: false
                },
            }).addTo(map);
            passedPath.setNextIndex(Number.MAX_SAFE_INTEGER);
            exports.passedPath = passedPath;
        }

        // Init remotePath if necessary
        if (!remotePath) {
            remotePath = L.Polyline.Plotter([], {
                readOnly: true,
                future: {
                    color: '#1a1a80',
                    weight: 5,
                    opacity: 1,
                    clickable: false,
                    dashArray: '3, 6'
                },
                present: {
                    color: '#09092e',
                    weight: 5,
                    opacity: 1,
                    clickable: false
                },
                past: {
                    color: '#09092e',
                    weight: 5,
                    opacity: 1,
                    clickable: false
                },
            }); // Not adding to map yet; we want to add this last.
            exports.remotePath = remotePath;
        }

        // Init remoteToLocal if necessary
        if (!remoteToLocal) {
            remoteToLocal = L.polyline([], {
                color: '#f21818',
                weight: 4,
                opacity: 1,
                clickable: false
            }).addTo(map);
            exports.remoteToLocal = remoteToLocal;

            // When remote or local line changes, update this line
            var updateRemoteToLocal = function () {
                if (remotePath.getNextIndex() == 0) {
                    var start = passedPath.getLatLngs()[passedPath.getLatLngs().length - 1]; // "Wrap around" to passedPath
                } else {
                    var start = remotePath.getLatLngs()[remotePath.getNextIndex() - 1];
                }
                setLineEndpoints(remoteToLocal,
                    start,
                    localPath.getLatLngs()[localPath.getNextIndex()]
                );
            };
            remotePath.on('change drag', updateRemoteToLocal);
            localPath.on('change drag', updateRemoteToLocal);
        }

        // Init passedToRemote if necessary
        if (!passedToRemote) {
            passedToRemote = L.polyline([], {
                color: '#09092e',
                weight: 5,
                opacity: 1,
                clickable: false
            }).addTo(map);
            exports.passedToRemote = passedToRemote;

            // When passed or remote line changes, update this line
            var updatePassedToRemote = function () {
                setLineEndpoints(passedToRemote,
                    passedPath.getLatLngs()[passedPath.getLatLngs().length - 1],
                    remotePath.getLatLngs()[0]
                );
            };
            passedPath.on('change drag', updatePassedToRemote);
            remotePath.on('change drag', updatePassedToRemote);
        }

        // Init planeToNextRemote if necessary
        if (!planeToNextRemote) {
            planeToNextRemote = L.polyline([], {
                color: '#1a1a80',
                weight: 5,
                opacity: 1,
                clickable: false,
                dashArray: '3, 6',
            }).addTo(map);
            exports.planeToNextRemote = planeToNextRemote;

            // When waypoints change, update line going from plane to next waypoint
            remotePath.on('change drag', function (e) {
                setLineEndpoints(planeToNextRemote, planeMarker.getLatLng(), remotePath.getNextLatLng());
                if (!remotePath.getNextLatLng()) {
                    console.log('planeToNextRemote not visible because remotePath has no next waypoint');
                }
            });
        }

        // Init historyPolyline if necessary
        if (!historyPolyline) {
            historyPolyline = new L.Polyline([], {
                color: '#190019',
                opacity: 0.6,
                weight: 5,
                clickable: true,
            }).addTo(map);
            historyPolyline.bindPopup(clearHistoryPopup);
        }

        // Add remotePath to top-most z-index of map
        if (!map.hasLayer(remotePath)) {
            remotePath.addTo(map);
        }


        // Update plane marker
        if (gpsFix) {
            planeMarker.setIcon(planeIcon);
            planeMarker.setLatLng(new L.LatLng(lat, lon));
            planeMarker.options.angle = heading * 1; // FIXME Make this more consistent across all files
            planeMarker.update();
        } else {
            planeMarker.setIcon(planeHollowIcon);
        }
        planeMarker._icon.title = lat + "°, " + lon + "°\nyaw " + Math.round(yaw) + "°, hdg " + heading + "°\nnext-wpt: " + waypointIndex + (waypointIndex == WAYPOINT_HOME ? " (home)" : "");

        // Update waypointIndex in status
        status.setTitle('next-wpt: ' + waypointIndex);

        // Update gpsFix message box
        if (gpsFix) {
            gpsFixMessagebox.hide();
        } else {
            gpsFixMessagebox.show('No GPS fix');
        }

        // Update which waypoint we're targeting next & redraw lines accordingly
        if (exports.testPlaneWaypointIndex !== null) {
            // You can override waypointIndex received from plane by console-setting Path.testPlaneWaypointIndex
            waypointIndex = exports.testPlaneWaypointIndex;
        }
        if (remotePath.getNextIndex() != waypointIndex && waypointIndex != WAYPOINT_HOME) {
            // TODO Manage going home case

            Log.debug('Path Plane waypointIndex changed to ' + waypointIndex + ' (was ' + remotePath.getNextIndex() + ')');

            Log.debug("Path passedPath: " + JSON.stringify({
                nextIndex: passedPath.getNextIndex(),
                latLngs: passedPath.getLatLngs()
            }));
            Log.debug("Path remotePath: " + JSON.stringify({
                nextIndex: remotePath.getNextIndex(),
                latLngs: remotePath.getLatLngs()
            }));
            Log.debug("Path localPath: " + JSON.stringify({
                nextIndex: localPath.getNextIndex(),
                latLngs: localPath.getLatLngs()
            }));

            remotePath.setNextIndex(waypointIndex);

            var firstDifferentIndex = findFirstLocalDifferent(localPath, remotePath);
            localPath.setNextIndex(Math.min(waypointIndex, firstDifferentIndex));

            Log.debug('Path localPath.nextIndex set to ' + localPath.getNextIndex() + ' (first locally different waypoint index is ' + firstDifferentIndex + ')');

        }

        // When plane moves, update line going from plane to next waypoint
        if (gpsFix) {
            setLineEndpoints(planeToNextRemote, {
                lat: lat,
                lng: lon
            }, remotePath.getNextLatLng());
        } else {
            planeToNextRemote.setLatLngs([]);
        }

        // Draw points on historyPolyline
        if (gpsFix) {
            historyPolyline.addLatLng(L.latLng(lat, lon));
            // var heightGraphLatLng = L.latLng(lat, lon);
            // heightGraphLatLng.alt = alt;
            // HeightGraph.addLatLng(heightGraphLatLng);
        }
    }

    // Init function to set endpoints of a line segment
    var setLineEndpoints = function (polyline, start, end) {
        if (start && end) {
            polyline.setLatLngs([start, end]);
        } else {
            polyline.setLatLngs([]);
        }
    };

    // Return index of first different waypoint in localPath
    var findFirstLocalDifferent = exports.findFirstLocalDifferent = function (localPath, remotePath) {
        var localLatLngs = localPath.getLatLngs();
        var remoteLatLngs = remotePath.getLatLngs();
        for (var i = 0; i < localLatLngs.length; ++i) {
            if (!remoteLatLngs[i]) {
                return i;
            }
            if (localLatLngs[i].lat != remoteLatLngs[i].lat && localLatLngs[i].lng != remoteLatLngs[i].lng) {
                return i;
            }
        }
        return i;
    };

 
    return exports;

})($, Data, Log, Network, Mousetrap, HeightGraph);