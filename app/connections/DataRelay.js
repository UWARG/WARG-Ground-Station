/**
 * @author Serge Babayan
 * @module connections/DataRelay
 * @requires config/network-config
 * @requires Network
 * @requires util/Logger
 * @requires util/PacketParser
 * @requires StatusManger
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
var Network = require('../Network');
var Logger = require('../util/Logger');
var TelemetryData = require('../models/TelemetryData');
var StatusManager = require('../StatusManager');
var PacketParser = require('../util/PacketParser');
var _ = require('underscore');

var DataRelay = {};

DataRelay.parseHeaders = function (data) {
  TelemetryData.setHeadersFromString(data);
  PacketParser.checkForMissingHeaders(TelemetryData.headers);

  Logger.debug('Network data_relay Received headers: ' + data);
  Logger.data(JSON.stringify(TelemetryData.headers), 'DATA_RELAY_HEADERS');
  StatusManager.addStatus('Received headers from data_relay', 3, 3000);
};

DataRelay.parseData = function (data) {
  TelemetryData.current_state = PacketParser.parseData(data, TelemetryData.headers);
  TelemetryData.emitPackets(TelemetryData.current_state);

  Logger.data(JSON.stringify(TelemetryData.current_state), 'DATA_RELAY_DATA');
  StatusManager.setStatusCode('TIMEOUT_DATA_RELAY', false);
};

/**
 * Initializes or re-initializes the data relay connection and sets up callbacks for parsing any received data
 * @function init
 */
DataRelay.init = function () {
  if (Network.connections['data_relay']) { //if a connection has already been established, disconnect it
    Network.connections['data_relay'].disconnect();
  }

  var data_relay = Network.addConnection('data_relay', network_config.get('datarelay_host'), network_config.get('datarelay_port'));

  data_relay.socket.setTimeout(network_config.get('datarelay_timeout'));

  data_relay.on('connect', function () {
    TelemetryData.headers = [];
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
    if (TelemetryData.headers.length === 0) {
      this.parseHeaders(data);
    }
    else { //if its the non-header columns(actual data)
      this.parseData(data);
    }
  }.bind(this));
};

module.exports = DataRelay;