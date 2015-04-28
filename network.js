var Network = (function (Data, Log) {

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

        this.write = function (data) {};    // To be defined
        this.emitter.write = function (data) {
            self.write(data);
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

    dataRelay.socket.on('connect', function () {
        Log.info('Network (dataRelay) Connected: ' + dataRelay.host + ':' + dataRelay.port);
        this.write("commander\r\n");
    });

    dataRelay.socket.on('data', function (data) {
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
            Data.state[Data.headers[i]] = dataSplit[i].trim().toString().replace('(','').replace(')','');
            cloneState[Data.headers[i]] = dataSplit[i].trim().toString().replace('(','').replace(')','');
        }
        Data.history.push(cloneState);

        Log.debug("Network (dataRelay) Parsed:" + JSON.stringify(Data.state));

        dataRelay.emitter.emit('data', Data.state);
    });

    dataRelay.socket.on('error', function (err) {
        console.log('dataRelay.error', err.code);
    });

    dataRelay.socket.on('close', function (had_error) {
        if (had_error) {
            Log.error('Network (dataRelay) Closed: Retrying connection');
        } else {
            Log.info('Network (dataRelay) Closed: Retrying connection');
        }

        Data.headers = [];
        setTimeout(dataRelay.connect, Math.random() * 1000 + 1000);
    });

    dataRelay.write = function (data) {
        dataRelay.socket.write(data);
        Log.info("Network (dataRelay) Sent: " + data);
    };



    // Multi-echo handlers

    multiEcho.socket.on('connect', function () {
        Log.info('Network (multiEcho) Connected: ' + multiEcho.host + ':' + multiEcho.port);
        console.log('Network (multiEcho) Connected: ' + multiEcho.host + ':' + multiEcho.port);
    });

    multiEcho.socket.on('data', function (data) {console.log('multiEcho.data', data+'');
        data = data.toString().trim();

        data = data.split('\n');

        for (var i = 0; i < data.length; ++i) {
            var parts = data[i].split(':');
            if (parts[0] != "TA") return;

            var arr = parts[1].split(',').map(function (str){
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
            Log.error('Network (multiEcho) Closed: Retrying connection');
        } else {
            Log.info('Network (multiEcho) Closed: Retrying connection');
        }

        setTimeout(multiEcho.connect, Math.random() * 1000 + 1000);
    });

    multiEcho.write = function (data) {
        multiEcho.socket.write(data);
        Log.info("Network Sent (multiEcho): " + data);
    };


    $(function () {
        dataRelay.connect();
        // multiEcho.connect();
    });

    // Export all relevant event emitters
    return {
        dataRelay: dataRelay.emitter,
        multiEcho: multiEcho.emitter,
    };

})(Data, Log);