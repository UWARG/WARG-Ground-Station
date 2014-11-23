var Net = require('net');

var Host = '127.0.0.1';
var Port = 1234;

var Header = [];
var FlightData = {};
var map;
var mapMarker;

$(document).ready(function () {
    map = L.map('map').setView([43.53086, -80.5772], 17);
    L.tileLayer('sat_tiles/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(map);
    mapMarker = L.marker([43.53086, -80.5772]).addTo(map);
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
        '</div>');

    UpdateUI()
}

function UpdateUI() {
    roll = FlightData["roll"] * (Math.PI / 180);
    pitch = FlightData["pitch"] * (Math.PI / 180);
    yaw = FlightData["yaw"] * (Math.PI / 180);
    lat = FlightData["lat"];
    lon = FlightData["lon"];
    altitude = FlightData["altitude"];

    var altimeter = $('#altimeter')
    altimeter.empty()
    var newItem = $('<div class="logText">' + altitude + '</div>');
    altimeter.append(newItem);

    //Map
    map.removeLayer(mapMarker);
    mapMarker = L.marker([lat, lon]).addTo(map);
    map.panTo([lat, lon])

    // ARTICIFIAL HORIZON //
    var canvas = document.getElementById("canvas");
    canvas.height = 400;
    canvas.width = 400;
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    //Sky
    context.fillStyle = "#03a9f4";
    context.beginPath();
    context.arc(200, 200, 200, Math.PI + roll - pitch, 2 * Math.PI + roll + pitch);
    context.fill();

    //Ground
    context.fillStyle = "#4caf50";
    context.beginPath();
    context.arc(200, 200, 200, 0 + roll + pitch, Math.PI + roll - pitch);
    context.fill();

    //Border
    context.strokeStyle = "black";
    context.lineWidth = 4;
    context.beginPath();
    context.arc(200, 200, 198, 0, 2 * Math.PI);
    context.stroke();

    //Center
    context.fillStyle = "black";
    context.beginPath();
    context.arc(200, 200, 5, 0, 2 * Math.PI);
    context.fill();
    context.beginPath();
    context.moveTo(240, 200);
    context.lineTo(220, 200);
    context.stroke();
    context.arc(200, 200, 20, 0, Math.PI);
    context.stroke();
    context.lineTo(160, 200);
    context.stroke();
}

var client = new Net.Socket();

client.connect(Port, Host, ConnectHandler);
client.on('error', ErrorHandler);
client.on('data', DataHander);
client.on('close', CloseHandler);

function CloseHandler() {
    WriteToLog('Connection closed - Retrying connection');
    client = new Net.Socket();
    client.connect(Port, Host, ConnectHandler);
    client.on('error', ErrorHandler);
    client.on('data', DataHander);
    client.on('close', CloseHandler);
}