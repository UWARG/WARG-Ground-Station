var net = require('net');

var HOST = '127.0.0.1';
var PORT = 1234;

header = "";

function WriteToLog(text) {
    var logDiv = $('#log')
    logDiv.empty()
    var newItem = $('<div class="logText">' + text + '</div>');
    logDiv.append(newItem);
}

function ConnectHandler(err) {
    if (!err) {
        WriteToLog('CONNECTED TO: ' + HOST + ':' + PORT);
    }
}

function ErrorHandler(err) {
    WriteToLog(err.code)
}

function DataHander(data) {
    var plane = $('#plane');

    if (header === "") {
        header = data;
        WriteToLog('HEADER: ' + data);
        return
    }

    var dataSplit = data.toString().split(",");

    plane.css({
        WebkitTransform: 'rotateZ(' + dataSplit[3] + 'deg)'
    });
    plane.css({
        WebkitTransform: 'rotateX(' + dataSplit[4] + 'deg)'
    });
    plane.css({
        WebkitTransform: 'rotateY(' + dataSplit[5] + 'deg)'
    });

    WriteToLog('<div>' + 'DATA: ' + dataSplit[3] + dataSplit[4] + dataSplit[5] + '</div>');
}

var client = new net.Socket();

client.connect(PORT, HOST, ConnectHandler);
client.on('error', ErrorHandler);
client.on('data', DataHander);
client.on('close', CloseHandler);

function CloseHandler() {
    WriteToLog('Connection closed');
    WriteToLog('Retrying connection');
    client = new net.Socket();
    client.connect(PORT, HOST, ConnectHandler);
    client.on('error', ErrorHandler);
    client.on('data', DataHander);
    client.on('close', CloseHandler);
}