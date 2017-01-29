/**
 * @author Serge Babayan
 * @module connections/DataRelay
 * @requires config/network-config
 * @requires managers/NetworkManager
 * @requires util/Logger
 * @requires util/PacketParser
 * @requires StatusManager
 * @requires models/TelemetryData
 * @emits models/TelemetryData~TelemetryData:aircraft_position
 * @emits models/TelemetryData~TelemetryData:aircraft_orientation
 * @emits models/TelemetryData~TelemetryData:aircraft_gains
 * @emits models/TelemetryData~TelemetryData:aircraft_status
 * @emits models/TelemetryData~TelemetryData:aircraft_channels
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Configures the data relay connection for connecting to it, and parsing its data and sending out events
 * to the TelemetryData module
 * @see http://docs.uwarg.com/picpilot/datalink/
 */
var network_config = require('../../config/network-config');
var NetworkManager = require('../managers/NetworkManager');
var Logger = require('../util/Logger');
var TelemetryData = require('../models/TelemetryData');
var StatusManager = require('../StatusManager');
var PacketParser = require('../util/PacketParser');
var ip = require('ip');

var _ = require('underscore');

var DataRelay = {};

const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const localport = 12345;

var parseHeaders = function(data) {
    TelemetryData.setHeadersFromString(data);
    PacketParser.checkForMissingHeaders(TelemetryData.getHeaders());
    Logger.debug('Network data_relay Received headers: ' + data);
    Logger.data(JSON.stringify(TelemetryData.getHeaders()), 'DATA_RELAY_HEADERS');
    StatusManager.addStatus('Received headers from data_relay', 3, 3000);
};

var parseData = function(data) {
    TelemetryData.setCurrentStateFromString(data);
    TelemetryData.emitPackets();
    Logger.data(JSON.stringify(TelemetryData.getCurrentState()), 'DATA_RELAY_DATA');
    StatusManager.setStatusCode('TIMEOUT_DATA_RELAY', false);
};

/**
 * Initializes or re-initializes the data relay connection and sets up callbacks for parsing any received data
 * @function init
 */
DataRelay.init = function() {
    //remove all data_relay connections
    if (NetworkManager.getConnectionByName('data_relay')) {
        NetworkManager.removeAllConnections('data_relay');
    }
    //If legacy mode, try to connect to default IP/port via TCP
    if (network_config.get('datarelay_legacy_mode') == true) {
        console.log('Connecting in Legacy Mode');
        connectTCP(network_config.get('datarelay_legacy_host'), network_config.get('datarelay_legacy_port'));
    } else { //connect via auto-discovery
        findUDP();
    }

};

//Connects to TCP on given host and port
var connectTCP = function(host,port) {
    var data_relay = NetworkManager.addConnection('data_relay', host, port);

    data_relay.setTimeout(network_config.get('datarelay_timeout'));

    data_relay.on('connect', function() {
        TelemetryData.clearHeaders();
        StatusManager.setStatusCode('CONNECTED_DATA_RELAY', true);
    });

    data_relay.on('close', function(had_error) {
        StatusManager.setStatusCode('DISCONNECTED_DATA_RELAY', true);
    });

    data_relay.on('timeout', function() {
        StatusManager.setStatusCode('TIMEOUT_DATA_RELAY', true);
    });

    data_relay.on('write', function(data) {
        StatusManager.addStatus('Sent command to data_relay', 3, 2000);
    });

    data_relay.on('data', function(data) {
        if (!data) { //don't do anything if we get blank data or anything that's not an object
            Logger.error('Got a blank packet from the data relay station. Value: ' + data);
            return;
        }

        data = data.toString();

        // First transmission is header columns
        if (TelemetryData.getHeaders().length === 0) {
            parseHeaders(data);
        } else { //if its the non-header columns(actual data)
            parseData(data);
        }
    }.bind(this));
}

//connect to data-relay using UDP broadcast address
var connectUDP = function(broadcastIP) {

    var port = network_config.get('datarelay_broadcast_port');

    var udp_open = false;

    server.on('error', (err) => {
        console.log(`server error:\n${err.stack}`);
        server.close();
    });

    server.on('message', (msg, rinfo) => {
        //the message should include the port number
        console.log('Data-relay at ' + rinfo.address.toString() + ':' + msg.toString());
        connectTCP(rinfo.address.toString(), msg.toString());

        server.close();
    });

    server.on('close', (msg, rinfo) => {
        udp_open = false;
    });

    server.on('listening', () => {
        udp_open = true;
        var address = server.address();
        console.log(`server listening ${address.address}:${address.port}`);

        setTimeout(function() {
            if (udp_open) {
                console.log('UDP connection timed out after 1 second');
                server.close();
            }
        }, 1000);
    });

    server.bind(localport);

    //send IP and port to data_relay UDP port
    var message = new Buffer(ip.address() + ':' + localport);

    var client = dgram.createSocket('udp4');
    client.bind( function() { client.setBroadcast(true) } );
    client.send(message, 0, message.length, port, broadcastIP, function(err, bytes) {
        if (err) throw err;
        console.log('UDP message sent to ' + broadcastIP + ':' + port);
        client.close();
    });
}

var findUDP = function() {

    //run ipconfig command
    var exec = require("child_process").exec;

    var os = process.platform.toString();

    if (os.includes("win")) {
        exec("ipconfig", function(err, stdout, stderr) {
            if (err) {
                callback(err, stderr);
            } else {

                //loop through until you find "subnet, then"
                var index = stdout.indexOf("Subnet Mask");
                while (stdout.charAt(index) != ":") {
                    index++;
                }

                //console.log(ip.or(ip.not(stdout.substring(index+1,stdout.indexOf("\n",index)).trim()),ip.address()));
                var netmask = stdout.substring(index + 1, stdout.indexOf("\n", index)).trim();
                var broadcast = ip.or(ip.not(netmask), ip.address());

                connectUDP(broadcast.toString());
		return;
            }
        });
    } else {

        exec("ifconfig", function(err, stdout, stderr) {

            if (err) {
                callback(err, stderr);
            } else {


                //loop through and look for broadcast addresses
                var parsingStr = stdout;
                var match;
                console.log(ip.address());
                do {
                    match = parsingStr.toString().match(/(?:Bcast|broadcast):([\d.]*)/);

                    if (match != null) {
                        parsingStr = parsingStr.substring(match.index + 1);
                        if (!match[1].toString().includes('0.0.0.0')) {
                            console.log('returning' + match[1]);
			    connectUDP(match[1]);
                            return;
                        }

                        //console.log(parsingStr);
                    }
                } while (match != null);

                //console.log(parsingStr.substring(0,parsingStr.search(/[^\d.]/)));

            }
            return 0;
        });
    }
    return -1;

}

module.exports = DataRelay;
