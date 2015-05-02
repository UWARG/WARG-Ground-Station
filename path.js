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

    // Initialize map if necessary
    // var defaultLatLng = [49.906576, -98.274078]; // Southport, Manitoba
    // var defaultLatLng = [43.53086, -80.5772];   // Waterloo North field
    var defaultLatLng = [48.508809, -71.638846]; // Alma, Quebec
    $(document).ready(function () {
        if (!map) {
            map = L.map('map').setView(defaultLatLng, 17);
            map.attributionControl.setPrefix(false);

            L.tileLayer('sat_tiles/{z}/{x}/{y}.png', {
                maxZoom: 19
            }).addTo(map);

            var centerControl = L.control.button({
                name: 'recenter',
                text: '',
                title: 'Center on plane',
                onclick: function () {
                    if (planeMarker) {
                        map.panTo(planeMarker.getLatLng());
                    }
                }
            });
            map.addControl(centerControl);

            // Map measuring tool
            var measureTooltip = new Tooltip('measure-tooltip');
            var measureLine = L.polyline([], {
                weight: 1,
                color: '#fff',
                opacity: 1
            });
            var measureCircle = L.circle([0, 0], 0, {
                weight: 2,
                color: '#fff',
                opacity: 1,
                fillOpacity: 0
            });
            var measureToolOn = false;
            var measureControl = L.control.button({
                name: 'measure',
                text: '=',
                title: 'Measure a length (left-click on the map)',
                onclick: function () {
                    switch (measureToolOn) {
                    case false:
                        measureToolOn = true;
                        $('div.leaflet-control-measure').addClass('active');
                        map.once('click', measurePlot1);

                        measureLine.setLatLngs([]);
                        measureLine.addTo(map);
                        measureCircle.setLatLng([0, 0]);
                        measureCircle.addTo(map);

                        measureTooltip.show();
                        break;
                    default:
                        measureToolOn = false;
                        $('div.leaflet-control-measure').removeClass('active');

                        map.removeLayer(measureLine);
                        map.removeLayer(measureCircle);

                        measureTooltip.hide().text('');
                        break;
                    }
                }
            });
            var measurePlot1 = function (e) {
                measureLine.setLatLngs([e.latlng]);

                measureCircle.setLatLng(e.latlng);
                measureCircle.setRadius(0);

                measureTooltip.text('');

                map.on('mousemove', measureMousemove);
                map.once('click', measurePlot2);
            };
            var measureMousemove = function (e) {
                var dist = measureCircle.getLatLng().distanceTo(e.latlng);

                var line = measureLine.getLatLngs();
                line[1] = e.latlng;
                measureLine.setLatLngs(line);
                measureCircle.setRadius(dist);

                if (dist >= 1000) {
                    dist /= 1000;
                    dist = Math.round(dist * 100) / 100;
                    dist += ' km';
                } else {
                    dist = Math.round(dist * 10) / 10;
                    dist += ' m';
                }
                measureTooltip.text('r = ' + dist);
            };
            var measurePlot2 = function (e) {
                map.off('mousemove', measureMousemove);
                map.once('click', measurePlot1);
            };
            map.addControl(measureControl);

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

            // Init status control if necessary
            if (!status) {
                status = L.control.text({
                    name: 'status',
                    title: 'We are legion'
                });
                map.addControl(status);

                map.on('mousemove', function (e) {
                    status.setText('(' + e.latlng.lat.toFixed(5) + ', ' + e.latlng.lng.toFixed(5) + ')');
                });
                map.on('mouseout', function () {
                    status.setText('');
                });
            }

            var flightArea = new L.Polyline([
                L.latLng(48.51132222222222, -71.65194722222223),
                L.latLng(48.51888888888889, -71.64944444444446),
                L.latLng(48.51450555555556, -71.6239111111111),
                L.latLng(48.50423333333333, -71.62925555555555),
                L.latLng(48.51132222222222, -71.65194722222223),
            ], {
                color: '#00ff00',
                opacity: 1,
                weight: 3,
                clickable: false
            }).addTo(map);

            var safetyArea = new L.Polyline([
                L.latLng(48.51138888888889, -71.65472222222223),
                L.latLng(48.52111111111111, -71.65138888888889),
                L.latLng(48.51575277777778, -71.6214111111111),
                L.latLng(48.50275277777778, -71.62819999999999),
                L.latLng(48.51138888888889, -71.65472222222223),
            ], {
                color: '#ff0000',
                opacity: 1,
                weight: 3,
                clickable: false
            }).addTo(map);

            var sfocZone = new L.Polyline([
                L.latLng(48.5086083790736, -71.6162770248457), L.latLng(48.5118541612874, -71.6167579646704), L.latLng(48.51497540600781, -71.6181856364077), L.latLng(48.5178521318939, -71.6205053277789), L.latLng(48.5203737375709, -71.623627996229), L.latLng(48.5224432596526, -71.6274336752373), L.latLng(48.5239811080518, -71.63177607907041), L.latLng(48.524928133651, -71.6364882298688), L.latLng(48.5252479090618, -71.64138889), L.latLng(48.524928133651, -71.6462895501312), L.latLng(48.5239811080518, -71.6510017009296), L.latLng(48.5224432596526, -71.65534410476271), L.latLng(48.5203737375709, -71.659149783771), L.latLng(48.5178521318939, -71.6622724522211), L.latLng(48.51497540600781, -71.6645921435923), L.latLng(48.5118541612874, -71.66601981532961), L.latLng(48.5086083790736, -71.6665007551543), L.latLng(48.5053628047391, -71.6660166604061), L.latLng(48.5022421520091, -71.66458631405369), L.latLng(48.4993663120992, -71.6622648355615), L.latLng(48.49684575150241, -71.6591415395575), L.latLng(48.494777274501, -71.65533648810219), L.latLng(48.4932403120782, -71.6509958713897), L.latLng(48.4922938784696, -71.6462863952069), L.latLng(48.4919743109381, -71.64138889), L.latLng(48.4922938784696, -71.6364913847931), L.latLng(48.4932403120782, -71.63178190861029), L.latLng(48.494777274501, -71.6274412918978), L.latLng(48.49684575150241, -71.62363624044249), L.latLng(48.4993663120992, -71.6205129444385), L.latLng(48.5022421520091, -71.6181914659463), L.latLng(48.5053628047391, -71.6167611195939), L.latLng(48.5086083790736, -71.6162770248457), L.latLng(48.5086083790736, -71.6162770248457)
            ], {
                color: '#ff0000',
                opacity: 0.3,
                weight: 3,
                clickable: false
            }).addTo(map);

            var trainTracks = new L.Polyline([
                L.latLng(48.5162755819232, -71.63250403329089), L.latLng(48.5163102476489, -71.6327694480642), L.latLng(48.5162574149596, -71.6329301903933), L.latLng(48.5161805721872, -71.63304785980456), L.latLng(48.5161497076492, -71.63314218794399), L.latLng(48.5160260757411, -71.63336154514867), L.latLng(48.5157731607004, -71.63372020309205), L.latLng(48.515668209743, -71.63382323746912), L.latLng(48.515610622191, -71.63391074520047), L.latLng(48.515567074787, -71.63403473491475), L.latLng(48.5155618150142, -71.63431999161347), L.latLng(48.5155284870591, -71.63454653690035), L.latLng(48.5155537791712, -71.63480432261336), L.latLng(48.5155135334483, -71.63495619776255), L.latLng(48.5155094094050, -71.63515675265431), L.latLng(48.5155475889916, -71.63562507188112), L.latLng(48.5155625387678, -71.63601145636949), L.latLng(48.5154840376431, -71.63645998690578), L.latLng(48.5153538766264, -71.63675579414426), L.latLng(48.5152023301526, -71.63711703170277), L.latLng(48.5151543105535, -71.63743757747247), L.latLng(48.5151316729667, -71.63770455861663), L.latLng(48.5150039928407, -71.63793990813846), L.latLng(48.5149564625315, -71.63826695563398), L.latLng(48.5148376774686, -71.63843578564969), L.latLng(48.5146695641818, -71.63870363048132), L.latLng(48.5144973984139, -71.63901692817946), L.latLng(48.5144643358187, -71.63924121317129), L.latLng(48.5144372923652, -71.63959702833552), L.latLng(48.514455090835, -71.63989006687152), L.latLng(48.5145014842794, -71.64004141547767), L.latLng(48.5145209781692, -71.64027301494676), L.latLng(48.5144722703484, -71.64071517834104), L.latLng(48.5144731954732, -71.64094724206814), L.latLng(48.5144997665578, -71.64113345778085), L.latLng(48.5145695009960, -71.64143195077185), L.latLng(48.5145767716332, -71.6415750610042), L.latLng(48.514516357570, -71.64178577562694), L.latLng(48.514441297501, -71.64200768492411), L.latLng(48.5143527399406, -71.64217957720426), L.latLng(48.5142940005396, -71.64245598006845), L.latLng(48.514229934894, -71.64272322981438), L.latLng(48.5141668303420, -71.64298634227224), L.latLng(48.5141999605376, -71.64311318047641), L.latLng(48.5141245442810, -71.64327501072344), L.latLng(48.5141257626132, -71.64343986474104), L.latLng(48.5141150039736, -71.64352193648972), L.latLng(48.5140664918555, -71.64359330389894), L.latLng(48.5140000304290, -71.64363393369553), L.latLng(48.5139350503852, -71.64372309805816), L.latLng(48.5139116953452, -71.6439045339274), L.latLng(48.5138305412140, -71.64396802701484), L.latLng(48.5136941843826, -71.64412058791534), L.latLng(48.5132155739175, -71.64480106497251), L.latLng(48.5130718554188, -71.64502651265536), L.latLng(48.5129572911329, -71.64514722452501), L.latLng(48.5128183481959, -71.64533643810508), L.latLng(48.5126958912406, -71.6455201088537), L.latLng(48.5125531615775, -71.64569400994198), L.latLng(48.5124977837571, -71.64578180333183), L.latLng(48.5124814913043, -71.64589341084097), L.latLng(48.5124720744692, -71.64602272698026), L.latLng(48.5124963957212, -71.64614133272849), L.latLng(48.5125431717108, -71.64629643438728), L.latLng(48.5125700153419, -71.64646202005568), L.latLng(48.5126013506840, -71.64656297259033), L.latLng(48.5126381490966, -71.64667059934746), L.latLng(48.5126879154163, -71.64677706626775), L.latLng(48.5127767470247, -71.64718432767067), L.latLng(48.5131389885934, -71.64791182817523), L.latLng(48.5142307843079, -71.64922989812578), L.latLng(48.5153843969667, -71.65065917575285), L.latLng(48.5165925127118, -71.65229583288559)
            ], {
                color: '#990000',
                opacity: 1,
                weight: 6,
                clickable: false
            }).addTo(map);

            var launchRecovery = new L.Polyline([
                L.latLng(48.51038889, -71.64783889), // vert
                L.latLng(48.51048889, -71.64783889),
                L.latLng(48.51043889, -71.64783889), // ctr
                L.latLng(48.51043889, -71.64775889), // horz
                L.latLng(48.51043889, -71.64791889),
            ], {
                color: '#ffcc00',
                opacity: 1,
                weight: 3,
                clickable: false
            }).addTo(map);

            var gcsArea = new L.Polyline([
                L.latLng(48.50941944, -71.64803611), // vert
                L.latLng(48.50951944, -71.64803611),
                L.latLng(48.50946944, -71.64803611), // ctr
                L.latLng(48.50946944, -71.64795611), // horz
                L.latLng(48.50946944, -71.64811611),
            ], {
                color: '#00ccff',
                opacity: 1,
                weight: 3,
                clickable: false
            }).addTo(map);
        }
    });

    // Initialize clear-history popup if necessary
    $(document).ready(function () {
        if (!clearHistoryPopup) {
            var button = $('<div class="button" id="clearHistory">Clear plane trail</div>');
            button.on('click', function () {
                map.closePopup(clearHistoryPopup);
                historyPolyline.setLatLngs([]);
            });
            clearHistoryPopup = L.popup().setContent(button[0]);
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
            var f = $('<input type="file" id="pathLoadFile" accept=".path">').click();
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
                for (i = 0, l = remoteLatLngs.length; i < l; i++) {
                    var latLng = remoteLatLngs[i];
                    command = "new_Waypoint:" + latLng.lat + "," + latLng.lng + "," + latLng.alt + "," + waypoint_radius + "\r\n";
                    Network.dataRelay.write(command);
                }

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

    Network.multiEcho.on('data', addTarget);

    var targetMarkers = [];

    // Initialize targetTooltip
    var targetTooltip = new Tooltip('target-tooltip');

    function addTarget(target) {

        var typeLabels = [undefined, 'F', 'S', 'D', 'C', 'P'];
        var typeNames = [undefined, 'Contaminated field', 'Structure', 'Debris pile', 'Container', 'Person'];

        var marker = new L.Marker([target.lat, target.lon], {
            riseOnHover: true,
            icon: L.divIcon({
                iconSize: [20, 20],
                className: 'target-icon target-compid-' + target.comp,
                html: '<span>' + typeLabels[target.type] + '</span>',
            }),
        }).addTo(map);

        $(marker._icon).hover(function (e) {
            targetTooltip.text(typeNames[target.type]).attr('class', 'target-compid-' + target.comp).show();
        }, function (e) {
            targetTooltip.hide();
        });

        targetMarkers.push(marker);
    }

    // Export what needs to be
    return exports;

})($, Data, Log, Network, Mousetrap, HeightGraph);