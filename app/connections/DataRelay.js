/**
 * @author Serge Babayan
 * @module connections/DataRelay
 * @requires config/network-config
 * @requires config/map-config
 * @requires Network
 * @requires util/Logger
 * @requires util/PacketParser
 * @requires StatusManger
 * @requires models/TelemetryData
 * @emits models/TelemetryData~TelemetryData:data_received
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
  TelemetryData.headers = data.split(",").map(function (str) {
    return str.trim();
  });

  PacketParser.checkForMissingHeaders(data);

  Logger.debug('Network data_relay Received headers: ' + data);
  Logger.data(TelemetryData.headers, 'DATA_RELAY_HEADERS');
  StatusManager.addStatus('Received headers from data_relay', 3, 3000);
};


DataRelay.parseData = function (data) {
  var sorted_data = PacketParser.parseData(data, TelemetryData.headers);

  _.each(sorted_data, function (packet_data, packet_type_name) {
    TelemetryData.emit(packet_type_name, packet_data);
  });

  data.split(",").map(function (data_value, index) {
    TelemetryData.current_state[TelemetryData.headers[index]] = data_value.trim();
  });

  TelemetryData.state_history.push(TelemetryData.current_state);
  TelemetryData.emit('data_received', TelemetryData.current_state);

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
    StatusManager.setStatusCode('CONNECTED_DATA_RELAY', true);
  });

  data_relay.on('close', function (had_error) {
    TelemetryData.headers = []; //this is important. So that we can properly parse the headers next time
    StatusManager.setStatusCode('DISCONNECTED_DATA_RELAY', true);
  });

  data_relay.on('timeout', function () {
    StatusManager.setStatusCode('TIMEOUT_DATA_RELAY', true);
  });

  data_relay.on('write', function (data) {
    StatusManager.addStatus('Sent command to data_relay', 3, 2000);
    TelemetryData.sent.push({
      time: new Date(),
      data: data
    });
  });

  data_relay.on('data', function (data) {
    if (!data) { //don't do anything if we get blank data or anything that's not an object
      Logger.error('Got a blank packet from the data relay station. Value: ' + data);
      return;
    }

    data = data.toString();

    TelemetryData.received.push({
      time: new Date(),
      data: data
    });

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