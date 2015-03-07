var Network = (function (Data, Log) {

    var net = require('net');
    var events = require('events');

    var host = '127.0.0.1';
    var port = 1234;

    var client;
    var emitter = new events.EventEmitter();

    connect();

    function connect() {
        client = new net.Socket();
        client.connect(port, host, connectHandler);
        client.on('error', errorHandler);
        client.on('data', dataHandler);
        client.on('close', closeHandler);
    }

    function write(data) {
        client.write(data);
        Log.write(data);
    }

    function connectHandler(err) {
        if (!err) {
            Log.write('Connected: ' + host + ':' + port);
        }
    }

    function errorHandler(err) {
        console.log(err.code)
    }

    function dataHandler(data) {
        data = data.toString();

        // First transmission is header columns
        if (Data.headers.length === 0) {
            Data.headers = data.split(",").map(function (str) {
                return str.trim();
            });
            return;
        }

        var dataSplit = data.split(",");
        var cloneState = {};
        for (var i = 0; i < dataSplit.length; i++) {
            Data.state[Data.headers[i]] = dataSplit[i].trim().toString();
            cloneState[Data.headers[i]] = dataSplit[i].trim().toString();
        }

        Data.history.push(cloneState);

        emitter.emit('data', Data.state);
        emitter.write = write;
    }

    function closeHandler() {
        Log.write('Connection closed - Retrying connection');
        Data.headers = [];
        setTimeout(connect, Math.random() * 500 + 500);
    }

    // Export only the event emitter
    return emitter;

})(Data, Log);