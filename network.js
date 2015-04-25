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
        Log.info("Network Sent: " + data);
    }

    function connectHandler(err) {
        if (!err) {
            Log.info('Network Connected: ' + host + ':' + port);
            write("commander\r\n");
        }
    }

    function errorHandler(err) {
        console.log(err.code)
    }

    function dataHandler(data) {
        data = data.toString();

        // Log.debug("Network Received: " + data);

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
            Data.state[Data.headers[i]] = dataSplit[i].trim().toString().replace('(','').replace(')','');
            cloneState[Data.headers[i]] = dataSplit[i].trim().toString().replace('(','').replace(')','');
        }
        
        Data.history.push(cloneState);

        Log.debug("Network Parsed: " + JSON.stringify(Data.state));

        emitter.emit('data', Data.state);
        emitter.write = write;
    }

    function closeHandler() {
        Log.error('Network Connection closed - Retrying connection');
        Data.headers = [];
        setTimeout(connect, Math.random() * 500 + 500);
    }

    // Export only the event emitter
    return emitter;

})(Data, Log);