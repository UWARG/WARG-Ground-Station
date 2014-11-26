L.RotatedMarker = L.Marker.extend({
    options: {
        angle: 0
    },
    _setPos: function (pos) {
        L.Marker.prototype._setPos.call(this, pos);
        this._icon.style[L.DomUtil.TRANSFORM] += ' rotate(' + this.options.angle + 'deg)';
    }
});

L.rotatedMarker = function (pos, options) {
    return new L.RotatedMarker(pos, options);
};

var Net = require('net');

var Host = '127.0.0.1';
var Port = 1234;

var Header = [];
var FlightData = {};
var map;
var planeMarker;
var planeIcon;
var popup = L.popup();

$(document).ready(function () {
    DrawArtificalHorizon(0, 0);
    SetAltimeter(0);

    map = L.map('map').setView([43.53086, -80.5772], 17);

    planeIcon = L.icon({
        iconUrl: 'plane.png',
        iconSize: [30, 30], // size of the icon
    });

    L.tileLayer('sat_tiles/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(map);

    planeMarker = L.rotatedMarker([43.53086, -80.5772], {
        icon: planeIcon
    }).addTo(map);

    map.on('click', MapClick);
});

function WriteToLog(text) {
    var logDiv = $('#log')
    logDiv.empty()
    var newItem = $('<div class="logText">' + text + '</div>');
    logDiv.append(newItem);
}

function ConnectHandler(err) {
    if (!err) {
        console.log('Connected: ' + Host + ':' + Port);
    }
}

function ErrorHandler(err) {
    console.log(err.code)
}

function DataHander(data) {
    if (Header.length === 0) {
        Header = data.toString().split(",");
        return
    }

    var dataSplit = data.toString().split(",");

    for (var i = 0; i < dataSplit.length; i++) {
        FlightData[Header[i]] = dataSplit[i];
    }

    WriteToLog('<div>' +
        'Pitch: ' + FlightData["pitch"] +
        ' Roll: ' + FlightData["roll"] +
        ' Yaw: ' + FlightData["yaw"] +
        ' Latitude: ' + FlightData["lat"] +
        ' Longitude: ' + FlightData["lon"] +
        ' Altitude: ' + FlightData["altitude"] +
        ' Heading: ' + FlightData["heading"] +
        '</div>');

    UpdateUI()
}

function DrawArtificalHorizon(roll, pitch) {
    //Initialize canvas
    var canvas = document.getElementById("horizon");
    canvas.height = 200;
    canvas.width = 200;
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    //Sky
    context.fillStyle = "#03a9f4";
    context.beginPath();
    context.arc(100, 100, 100, Math.PI + roll - pitch, 2 * Math.PI + roll + pitch);
    context.fill();

    //Ground
    context.fillStyle = "#795548";
    context.beginPath();
    context.arc(100, 100, 100, 0 + roll + pitch, Math.PI + roll - pitch);
    context.fill();

    //Border
    context.strokeStyle = "black";
    context.lineWidth = 2;
    context.beginPath();
    context.arc(100, 100, 99, 0, 2 * Math.PI);
    context.stroke();

    //Center
    context.fillStyle = "black";
    context.beginPath();
    context.lineWidth = 2;
    context.arc(100, 100, 2, 0, 2 * Math.PI);
    context.fill();
    context.beginPath();
    context.moveTo(120, 100);
    context.lineTo(110, 100);
    context.stroke();
    context.arc(100, 100, 10, 0, Math.PI);
    context.stroke();
    context.lineTo(80, 100);
    context.stroke();
}

function SetAltimeter(altitude) {
    var altimeter = $('#altimeter')
    altimeter.empty()
    var newItem = $('<div class="logText">' + altitude + '</div>');
    altimeter.append(newItem);
}

function UpdateMap(lat, lon, heading) {
    map.removeLayer(planeMarker);
    planeMarker = L.rotatedMarker([lat, lon], {
        icon: planeIcon,
        angle: heading
    }).addTo(map);
}

function MapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent('<div class="addWaypoint">Add Waypoint</div>')
        .openOn(map);

    $('.addWaypoint').on('click', function () {
        map.closePopup();
        marker = L.marker(e.latlng).addTo(map);
    });
}

function UpdateUI() {
    roll = FlightData["roll"] * (Math.PI / 180);
    pitch = FlightData["pitch"] * (Math.PI / 180);
    yaw = FlightData["yaw"] * (Math.PI / 180);
    lat = FlightData["lat"];
    lon = FlightData["lon"];
    altitude = FlightData["altitude"];
    heading = FlightData["heading"];

    DrawArtificalHorizon(roll, pitch);
    SetAltimeter(altitude);

    if (!isNaN(lat) || !isNaN(lon)) {
        UpdateMap(lat, lon, heading);
    }
}

var client = new Net.Socket();

client.connect(Port, Host, ConnectHandler);
client.on('error', ErrorHandler);
client.on('data', DataHander);
client.on('close', CloseHandler);

function CloseHandler() {
    WriteToLog('Connection closed - Retrying connection');
    Header = [];
    client = new Net.Socket();
    client.connect(Port, Host, ConnectHandler);
    client.on('error', ErrorHandler);
    client.on('data', DataHander);
    client.on('close', CloseHandler);
}