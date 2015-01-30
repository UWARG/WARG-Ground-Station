var Net = require('net');

var Host = '127.0.0.1';
var Port = 1234;

var Header = [];
var FlightData = {};

function ConnectHandler(err) {
    if (!err) {
        WriteToLog('Connected: ' + Host + ':' + Port);
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

    UpdateUI()
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