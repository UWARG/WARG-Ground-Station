/**
 * @author Serge Babayan
 * @module connections/DataRelay
 * @requires config/network-config
 * @requires managers/NetworkManager
 * @requires util/Logger
 * @requires util/PacketParser
 * @requires StatusManager
 * @requires models/TelemetryData
 * @requires ip
 * @requires child_process
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
var exec = require("child_process").exec;
var UDPConnection = require('../models/UDPConnection');

var _ = require('underscore');

var DataRelay = {};

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
  //remove all previous data-relay connections
  if (NetworkManager.getConnectionByName('data_relay')) {
    NetworkManager.removeAllConnections('data_relay');
  }
  //If legacy mode, try to connect to default IP/port via TCP
  if (network_config.get('datarelay_legacy_mode') == true) {
    Logger.info('Connecting in Legacy Mode');
    connectTCP(network_config.get('datarelay_legacy_host'), network_config.get('datarelay_legacy_port'));
  } else { //connect via auto-discovery
    //connectUDP(port, connectTCP);
    var udpConnection = new UDPConnection(network_config.get('datarelay_port'));
    udpConnection.on('receiveIP', function(destAddress,destPort){
      Logger.info('Data Relay at ' + destAddress + ':' + destPort);
      connectTCP(destAddress,destPort);
    });
    udpConnection.on('timeout', function(){
    });
    udpConnection.findConnection();
    //findUDP();
  }

};


/**
 * Connects to TCP on given host and port
 * @connectTCP
 */
var connectTCP = function(host,port) {
  //remove all previous data-relay connections
    if (NetworkManager.getConnectionByName('data_relay')) {
        NetworkManager.removeAllConnections('data_relay');
    }
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


module.exports = DataRelay;
