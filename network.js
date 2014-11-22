var Net = require('net');

var Host = '127.0.0.1';
var Port = 1234;

var Header = [];
var FlightData = {};

function WriteToLog(text) {
    var logDiv = $('#log')
    logDiv.empty()
    var newItem = $('<div class="logText">' + text + '</div>');
    logDiv.append(newItem);
}

function ConnectHandler(err) {
    if (!err) {
        WriteToLog('Connected: ' + Host + ':' + Port);
    }
}

function ErrorHandler(err) {
    WriteToLog(err.code)
}

function DataHander(data) {
    if (Header.length === 0) {
        Header = data.toString().split(",");
        WriteToLog('Header: ' + data);
        return
    }

    var dataSplit = data.toString().split(",");

    for (var i = 0; i < dataSplit.length; i++) {
        FlightData[Header[i]] = dataSplit[i];
    }

    WriteToLog('<div>' + 'Data: ' + FlightData["pitch"] + FlightData["roll"] + FlightData["yaw"] + '</div>');

    UpdateUI()
}

function UpdateUI() {
    var plane = $('#plane');

    plane.css({
        WebkitTransform: 'rotateZ(' + FlightData["pitch"] + 'deg)'
    });
    plane.css({
        WebkitTransform: 'rotateX(' + FlightData["roll"] + 'deg)'
    });
    plane.css({
        WebkitTransform: 'rotateY(' + FlightData["yaw"] + 'deg)'
    });
}

var client = new Net.Socket();

client.connect(Port, Host, ConnectHandler);
client.on('error', ErrorHandler);
client.on('data', DataHander);
client.on('close', CloseHandler);

function CloseHandler() {
    WriteToLog('Connection closed');
    WriteToLog('Retrying connection');
    client = new Net.Socket();
    client.connect(Port, Host, ConnectHandler);
    client.on('error', ErrorHandler);
    client.on('data', DataHander);
    client.on('close', CloseHandler);
}