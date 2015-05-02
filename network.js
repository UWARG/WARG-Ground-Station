var Network = (function (Data, Log, $, Mousetrap) {

    var net = require('net');
    var events = require('events');

    var Connection = function (options) {
        this.name = options.name;
        this.host = options.host;
        this.port = options.port;

        var self = this;
        this.connect = function () {
            self.socket.connect(self.port, self.host);
        };

        this.socket = new net.Socket();
        this.emitter = new events.EventEmitter();

        this.write = function (data) {}; // To be defined
        this.emitter.write = function (data) {
            self.write(data);
        };
        this.emitter.socket = this.socket;
        this.emitter.configure = function (host, port) {
            if (!host || !port) {
                console.error(self.name, "network configure error: empty host", host, "or empty port", port);
                return;
            }
            self.host = host;
            self.port = port;
        };
    };

    var dataRelay = new Connection({
        name: 'dataRelay',
        host: '127.0.0.1',
        port: 1234,
    });
    var multiEcho = new Connection({
        name: 'multiEcho',
        host: '127.0.0.1',
        port: 4321,
    });



    // Data-relay handlers

    dataRelay.socket.on('timeout', function () {
        Log.error('Network (dataRelay) No data received for 5 seconds: ' + dataRelay.host + ':' + dataRelay.port);
        $("#log").css("background-color", "#f44336");
        dataRelay.socket.setTimeout(5000);
    });

    dataRelay.socket.on('connect', function () {
        Log.info('Network (dataRelay) Connected: ' + dataRelay.host + ':' + dataRelay.port);
        dataRelay.write("commander\r\n");
        $('#display-connections-dataRelay').addClass('connected');
    });

    dataRelay.socket.on('data', function (data) {
        data = data.toString();
        Data.received.push((new Date).toString() + ' ' + data);

        $("#log").css("background-color", "#cfd8dc");

        // First transmission is header columns
        if (Data.headers.length === 0) {
            Log.debug('Network (dataRelay) Received headers: ' + data);
            Data.headers = data.split(",").map(function (str) {
                return str.trim();
            });
            Log.debug('Network (dataRelay) Parsed headers: ' + JSON.stringify(Data.headers));
            return;
        }

        var dataSplit = data.split(",");
        var cloneState = {};
        for (var i = 0; i < dataSplit.length; i++) {
            Data.state[Data.headers[i]] = dataSplit[i].trim().toString().replace('(', '').replace(')', '');
            cloneState[Data.headers[i]] = dataSplit[i].trim().toString().replace('(', '').replace(')', '');
        }
        Data.history.push(cloneState);

        Log.debug("Network (dataRelay) Parsed:" + JSON.stringify(Data.state));

        dataRelay.emitter.emit('data', Data.state);
    });

    dataRelay.socket.on('error', function (err) {
        console.log('dataRelay.error', err.code);
        $("#log").css("background-color", "#f44336");
    });

    dataRelay.socket.on('close', function (had_error) {
        if (had_error) {
            Log.error('Network (dataRelay) Closed: Not reconnecting');
            $("#log").css("background-color", "#f44336");
        } else {
            Log.info('Network (dataRelay) Closed: Not reconnecting');
        }

        Data.headers = [];
        $('#display-connections-dataRelay').removeClass('connected');
    });

    dataRelay.write = function (data) {
        dataRelay.socket.write(data);
        Data.sent.push((new Date).toString() + ' ' + data);
        Log.info("Network (dataRelay) Sent: " + data);
    };



    // Multi-echo handlers

    multiEcho.socket.on('connect', function () {
        Log.info('Network (multiEcho) Connected: ' + multiEcho.host + ':' + multiEcho.port);
        console.log('Network (multiEcho) Connected: ' + multiEcho.host + ':' + multiEcho.port);
        $('#display-connections-multiEcho').addClass('connected');
    });

    multiEcho.socket.on('data', function (data) {
        data = data.toString().trim();

        data = data.replace(/TA:/g, '\nTA:');
        data = data.split('\n');

        for (var i = 0; i < data.length; ++i) {
            var parts = data[i].split(':');
            if (parts[0] != "TA") continue;

            var arr = parts[1].split(',').map(function (str) {
                return str.trim();
            });

            var comp = Data.compIDs.indexOf(arr[3]);
            if (comp == -1) {
                comp = Data.compIDs.push(arr[3]) - 1;
            }

            var target = {
                lat: arr[0],
                lon: arr[1],
                type: arr[2],
                comp: comp,
            };
            Data.targets.push(target);

            Log.debug("Network (multiEcho) Parsed: " + JSON.stringify(target));

            multiEcho.emitter.emit('data', target);
        }
    });

    multiEcho.socket.on('error', function (err) {
        console.log('multiEcho.error', err.code);
    });

    multiEcho.socket.on('close', function (had_error) {
        if (had_error) {
            Log.error('Network (multiEcho) Closed: Not reconnecting');
        } else {
            Log.info('Network (multiEcho) Closed: Not reconnecting');
        }

        $('#display-connections-multiEcho').removeClass('connected');
    });

    multiEcho.write = function (data) {
        multiEcho.socket.write(data);
        Log.info("Network Sent (multiEcho): " + data);
    };


    $(function () {
        dataRelay.connect();
        dataRelay.socket.setTimeout(5000);
        multiEcho.connect();
    });

    Mousetrap.bind(["mod+l"], function () {
        var connectionId;
        while (connectionId != "d" && connectionId != "m") {
            connectionId = prompt("Connect to a server\n\nWhich connection?\n(d: dataRelay, m: multiEcho)");
            if (connectionId === null) return;
        }
        var connection = {
            d: dataRelay,
            m: multiEcho
        }[connectionId];

        var parseLocation = function (locationStr) {
            if (!locationStr) return null;
            var parts = locationStr.trim().split(':');
            if (parts.length != 2) return null;
            return {
                host: parts[0],
                port: parts[1]
            };
        };
        var location, locationStr;
        while (!(location = parseLocation(locationStr))) {
            locationStr = prompt("Connect to a server (" + connection.name + ")\n\nWhich locationStr?\n(host:port)", connection.host + ":" + connection.port);
            if (locationStr === null) return;
        };

        // Reconnect
        connection.host = location.host;
        connection.port = location.port;
        connection.socket.destroy();
        connection.connect();
    });

    // Export all relevant event emitters
    return {
        dataRelay: dataRelay.emitter,
        multiEcho: multiEcho.emitter,
    };

})(Data, Log, $, Mousetrap);