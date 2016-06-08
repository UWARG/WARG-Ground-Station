/**
 * @author Serge Babayan
 * @module connections/DataRelay
 * @requires config/network-config
 * @requires config/map-config
 * @requires Network
 * @requires util/Logger
 * @requires StatusManger
 * @requires models/Commands
 * @requires models/TelemetryData
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Configures the data relay connection for connecting to it, and parsing its data and sending it out
 * to the TelemetryData module
 * @extends EventEmitter
 * @see http://docs.uwarg.com/picpilot/datalink/
 */
var network_config = require('../../config/network-config');
var Network = require('../Network');
var Logger = require('../util/Logger');
var TelemetryData = require('../models/TelemetryData');
var StatusManager = require('../StatusManager');
var Commands = require('../models/Commands');
var PacketTypes = require('../models/PacketTypes');

var DataRelay = {};

DataRelay.checkForMissingHeaders = function (data) {
  var expected_headers = {};
  var header;

  //create a list of the headers we expect to receive and set their value to 0
  for (var packet_type_name in PacketTypes) {
    if (PacketTypes.hasOwnProperty(packet_type_name)) {
      for (header in PacketTypes[packet_type_name]) {
        if (PacketTypes[packet_type_name].hasOwnProperty(header)) {
          expected_headers[header] = 0;
        }
      }
    }
  }

  //iterate through the data packet that we actually received
  for (var i = 0; i < TelemetryData.headers.length; i++) {
    var header_name = TelemetryData.headers[i];

    //if we receive a header that wasn't listed in the PacketTypes model
    if (expected_headers[header_name] === undefined) {
      Logger.warn('An unexpected header was received from the data relay. Header: ' + header_name);
    }
    //if we received the same header more than once
    else if (expected_headers[header_name] > 0) {
      expected_headers[header_name]++;
      Logger.warn('Header: ' + header_name + ' was received more than once! Times: ' + expected_headers[header_name]);
    }
    else if (expected_headers[header_name] == 0) {
      expected_headers[header_name]++;
    }
  }

  //check to see if all the expected headers were received
  for (header in expected_headers) {
    if (expected_headers.hasOwnProperty(header) && expected_headers[header] === 0) {
      Logger.warn('Did not receive an expected header! Header: ' + header);
    }
  }
};

DataRelay.parseHeaders = function (data) {
  TelemetryData.headers = data.split(",").map(function (str) {
    return str.trim();
  });

  Logger.debug('Network ' + this.name + ' Received headers: ' + data);
  Logger.debug('Network ' + this.name + ' Parsed headers: ' + JSON.stringify(TelemetryData.headers));
  Logger.data(TelemetryData.headers, 'DATA_RELAY_HEADERS');
  StatusManager.addStatus('Received headers from data_relay', 3, 3000);
};

DataRelay.parseData = function (data) {
  var split_data = data.split(",");

  //warn the user if we receive an improper number of data
  if (split_data.length !== TelemetryData.headers.length) {
    Logger.error('Number of data headers doesn\'t match the number of data!. Length of data: ' + split_data.length + ' Length of headers: ' + TelemetryData.headers.length);
  }

  for (var i = 0; i < split_data.length; i++) {
    //the replace is required because there's a chance of random brackets being in the values (with past logs at least)
    TelemetryData.current_state[TelemetryData.headers[i]] = split_data[i];
  }
  TelemetryData.state_history.push(TelemetryData.current_state);
  TelemetryData.emit('data_received', TelemetryData.current_state);

  for (var packet_type_name in PacketTypes) {
    if (PacketTypes.hasOwnProperty(packet_type_name)) {
      var data = {};
      for (var header in PacketTypes[packet_type_name]) {
        if (PacketTypes[packet_type_name].hasOwnProperty(header)) {
          if (TelemetryData.current_state[header] === null) {
            data[header] = null;
          }
          else {
            var validation_functions = PacketTypes[packet_type_name][header];
            if (typeof validation_functions === 'string') { //if its only a single validation function
              if (Validator[validation_functions](TelemetryData.current_state[header])) {
                data[header] = Number(TelemetryData.current_state[header]);
              }
              else {
                Logger.warn('Invalid data received for ' + header + '. Value: ' + TelemetryData.current_state[header]);
                data[header] = null;
              }
            }
            else{ //if its in array and there are multiple validation functions
              var failed = false;
              for(var i = 0;i< validation_functions.length; i++){
                if(!validation_functions[i](TelemetryData.current_state[header])){
                  failed = true;
                }
              }
              if(failed){
                data[header] = null;
              }else{
                data[header] = Number(TelemetryData.current_state[header]);
              }
            }
          }
        }
      }
      TelemetryData.emit(packet_type_name, data);
    }
  }

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