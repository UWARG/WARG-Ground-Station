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
var _ = require('underscore');

var DataRelay = {};

var parseHeaders = function (data) {
  TelemetryData.setHeadersFromString(data);
  PacketParser.checkForMissingHeaders(TelemetryData.getHeaders());
  Logger.debug('Network data_relay Received headers: ' + data);
  Logger.data(JSON.stringify(TelemetryData.getHeaders()), 'DATA_RELAY_HEADERS');
  StatusManager.addStatus('Received headers from data_relay', 3, 3000);
};

var parseData = function (data) {
  TelemetryData.setCurrentStateFromString(data);
  TelemetryData.emitPackets();
  Logger.data(JSON.stringify(TelemetryData.getCurrentState()), 'DATA_RELAY_DATA');
  StatusManager.setStatusCode('TIMEOUT_DATA_RELAY', false);
};

/**
 * Initializes or re-initializes the data relay connection and sets up callbacks for parsing any received data
 * @function init
 */
DataRelay.init = function () {
//remove all data_relay connections
  if(NetworkManager.getConnectionByName('data_relay')){
    NetworkManager.removeAllConnections('data_relay');
  }
//If legacy mode, try to connect to default IP/port via TCP

//Else, get data_relay IP from UDP request and connect
connectUDP('localhost','1234');
  
};
  
  var connectTCP = function(host,port){
    var data_relay = NetworkManager.addConnection('data_relay', host, port);

    data_relay.setTimeout(network_config.get('datarelay_timeout'));

    data_relay.on('connect', function () {
      TelemetryData.clearHeaders();
      StatusManager.setStatusCode('CONNECTED_DATA_RELAY', true);
    });

    data_relay.on('close', function (had_error) {
      StatusManager.setStatusCode('DISCONNECTED_DATA_RELAY', true);
    });

    data_relay.on('timeout', function () {
      StatusManager.setStatusCode('TIMEOUT_DATA_RELAY', true);
    });

    data_relay.on('write', function (data) {
      StatusManager.addStatus('Sent command to data_relay', 3, 2000);
    });

    data_relay.on('data', function (data) {
      if (!data) { //don't do anything if we get blank data or anything that's not an object
        Logger.error('Got a blank packet from the data relay station. Value: ' + data);
        return;
      }

      data = data.toString();

      // First transmission is header columns
      if (TelemetryData.getHeaders().length === 0) {
        parseHeaders(data);
      }
      else { //if its the non-header columns(actual data)
        parseData(data);
      }
    }.bind(this));
  }

  var connectUDP = function(host,port){
    var localport = 12345
    var udp_open = false;
    const dgram = require('dgram');
    const server = dgram.createSocket('udp4');

    server.on('error', (err) => {
      console.log(`server error:\n${err.stack}`);
      server.close();
    });

    server.on('message', (msg, rinfo) => {
      console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
      console.log(rinfo.address,toString());
      connectTCP(rinfo.address.toString(),msg.toString());

      server.close();
    });

    server.on('close', (msg, rinfo) => {
      udp_open = false;
    });

    server.on('listening', () => {
      udp_open = true;
      var address = server.address();
      console.log(`server listening ${address.address}:${address.port}`);

      setTimeout(function(){
          if(udp_open){
            console.log('UDP connection timed out after 1 second');
            server.close();
          }
        },1000);
    });

    server.bind(localport);

    //send IP and port to data_relay UDP port
    var message = new Buffer(getLocalIP()+':'+localport);

    var client = dgram.createSocket('udp4');
    client.send(message, 0, message.length, port, host, function(err, bytes) {
        if (err) throw err;
        console.log('UDP message sent to ' + host +':'+ port);
        client.close();
    });
  }

  var getLocalIP = function(){
    var os = require('os');

    var interfaces = os.networkInterfaces();
    for (var k in interfaces) {
        for (var k2 in interfaces[k]) {
            var address = interfaces[k][k2];
            if (address.family === 'IPv4' && !address.internal) {
                return address.address;
            }
        }
    }
  }

module.exports = DataRelay;