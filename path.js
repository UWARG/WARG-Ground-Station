// FlightData object contains values read from data-relay
// Accessed with FlightData["Value"]
//
// UpdateMap() is called whenever data is recieved

var map;
var planeMarker;
var planeIcon;
var popup = L.popup();
var WaypointMarkers = [];
var WaypointPath;

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
    //Initialize instruments
    DrawArtificalHorizon(0, 0);
    DrawPitch(0);
    DrawRoll(0);
    DrawYaw(0);
    SetAltimeter(0);
    SetSpeed(0);

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
        for (i = 0; i < WaypointMarkers.length; i++) {
            command = "new_Waypoint:" + WaypointMarkers[i].getLatLng().lat + "," + WaypointMarkers[i].getLatLng().lng + "\r\n";
            client.write(command);
            WriteToLog(command);
        }
    });

    $('#clearWaypoints').on('click', function () {
        for (i = 0; i < WaypointMarkers.length; i++) {
            map.removeLayer(WaypointMarkers[i]);
        }
        WaypointMarkers = [];
        UpdateUI();
    });

    map.on('click', MapClick);
});

function MapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent('<div class="button" id="addWaypoint">Add Waypoint</div>')
        .openOn(map);

    $('#addWaypoint').on('click', function () {
        map.closePopup();
        WaypointMarkers.push(L.marker(e.latlng).addTo(map));
        UpdateUI();
    });
}

function UpdateMap(lat, lon, heading) {
    if (planeMarker != null) {
        map.removeLayer(planeMarker);
    }
    planeMarker = new L.RotatedMarker([lat, lon], {
        icon: planeIcon,
        angle: heading
    }).addTo(map);

    if (WaypointPath != null) {
        map.removeLayer(WaypointPath);
    }
    var line = [];
    line.push(planeMarker.getLatLng());
    for (var i = 0; i < WaypointMarkers.length; i++) {
        line.push(WaypointMarkers[i].getLatLng());
    }
    WaypointPath = new L.Polyline(line, {
        color: 'red',
        weight: 3,
        opacity: 0.5,
        smoothFactor: 1
    });
    WaypointPath.addTo(map);
}