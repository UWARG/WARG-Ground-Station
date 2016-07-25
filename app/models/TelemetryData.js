/**
 * @author Serge Babayan
 * @module models/TelemetryData
 * @requires util/PacketParser
 * @requires util
 * @requires events
 * @requires config/advanced-config
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Data model that stores the current and past telemetry states of the aircraft. Inherits off of the node EventEmitter,
 * so it can emit data events to other modules
 * @extends EventEmitter
 * @see http://docs.uwarg.com/picpilot/datalink/
 */

var PacketParser = require('../util/PacketParser');
var util = require('util');
var advanced_config = require('../../config/advanced-config');
var EventEmitter = require('events');
var _ = require('underscore');

/**
 * When a new data packet has been received on the data relay connection
 * @event TelemetryData:aircraft_position
 * @property {Object} data - Information on the position of the aircraft
 */

/**
 * When a new data packet has been received on the data relay connection
 * @event TelemetryData:aircraft_orientation
 * @property {Object} data - Information on the orientation of the aircraft
 */

/**
 * When a new data packet has been received on the data relay connection
 * @event TelemetryData:aircraft_gains
 * @property {Object} data - Current aircraft gains information
 */

/**
 * When a new data packet has been received on the data relay connection
 * @event TelemetryData:aircraft_status
 * @property {Object} data - Current aircraft status information
 */

/**
 * When a new data packet has been received on the data relay connection
 * @event TelemetryData:aircraft_channels
 * @property {Object} data - Information about the channel inputs and outputs of the picpilot
 */

var TelemetryData = function () {
  /**
   * @var {Array} headers
   * An array of headers in the order that the groundstation will be receiving them, as specified from the data relay
   * @private
   * @example
   * console.log(TelemetryData.getHeaders())
   * ['lat', 'lon', 'time', ...]
   */
  var headers = [];

  /**
   * @var {Object} current_state
   * Current flight state. In the format of a hash, where the keys are the packet names, and the value is an array of header=>value data
   * @private
   * @see models/PacketTypes
   * @example
   * console.log(TelemetryData.getCurrentState())
   * {
   *    aircraft_position: {
   *      lat: 45.45455,
   *      lon: 324234,
   *      time: 234324324,
   *      ...
   *    },
   *    aircraft_orientation: {
   *        ...
   *    }
   * }
   */
  var current_state = {};

  /**
   * Stores all of the incoming data received from the data relay connection, in the order it was received in (unparsed).
   * The last index is the latest data that came in (ie. stack). Each element is stored as an array as a result of splitting
   * the data string received from the data relay.
   * @var {Array} data_received_history
   * @private
   */
  var data_received_history = [];

  /**
   * @function setHeaders
   * @param {Array} new_headers
   */
  this.setHeaders = function (new_headers) {
    headers = new_headers;
  };

  /**
   * @function getHeaders
   * @returns {Array}
   */
  this.getHeaders = function () {
    return headers;
  };

  /**
   * Clears the telemetry data headers
   * @function clearHeaders
   */
  this.clearHeaders = function () {
    headers = [];
  };

  /**
   * Converts a springfield version of headers (separated by commas) into an array and sets it as its headers.
   * Will also perform a trim() on each of the header values.
   * @function setHeadersFromString
   * @param {String} headers_string Comma-delimited headers string
   * @example
   * TelemetryData.setHeadersFromString('header1,header2, header3, header4');
   * console.log(TelemetryData.headers);
   * //Outputs: ['header1', 'header2', 'header3', 'header4']
   */
  this.setHeadersFromString = function (headers_string) {
    headers = [];

    if (headers_string) {
      headers = headers_string.split(",").map(function (str) {
        return str.trim();
      });
    }
  };

  /**
   * Gets the current state of the telemetry data (data that is the most recent)
   * @function getCurrentState
   * @returns {Object}
   * @see models/PacketTypes
   */
  this.getCurrentState = function () {
    return current_state;
  };

  /**
   * Sets the telemetry data current state
   * @function setCurrentState
   * @param {Object} new_state The state (make sure its in the correct format)
   * @see models/PacketTypes
   */
  this.setCurrentState = function (new_state) {
    current_state = new_state;
  };

  /**
   * Uses the PacketParser module and the existing headers to set the current state from a comma delimited data string
   * @function setCurrentStateFromString
   * @param {String} new_state_string Comma-delimited data string
   */
  this.setCurrentStateFromString = function (new_state_string) {
    this.setCurrentState(PacketParser.parseData(new_state_string, headers));
  };

  /**
   * Returns the data received history. last index is the latest data packet.
   * @function getDataReceivedHistory
   * @returns {Array}
   * @example <caption>Example output <\caption>
   *   console.log(TelemetryData.getDataReceivedHistory());
   *   // will output:
   *   [
   *      [1,2,3,4,2,1,2,3,5,43.345, 4, etc...],
   *      [4,5,5,5,3,4,4, 4, etc...] //latest packet here
   *   ]
   */
  this.getDataReceivedHistory = function () {
    return data_received_history;
  };

  /**
   * Returns the latest data received array from the data received history. Returns null if non exist
   * @function getLatestDataReceivedFromHistory
   * @returns {null|Array}
   */
  this.getLatestDataReceivedFromHistory = function () {
    if(data_received_history.length > 0){
      return data_received_history[data_received_history.length - 1];
    } else {
      return null;
    }
  };

  /**
   * Adds a data packet string to the data received history
   * @function addDataReceivedHistoryFromString
   * @param {String} data
   * @example <caption>Adding a data packet to the received history</caption>
   * TelemetryData.addDataToReceivedHistoryFromString('4,3,45,5,5,234,4,4,5,211,2, etc..');
   */
  this.addDataToReceivedHistoryFromString = function (data) {
    data_received_history.push(PacketParser.convertDataStringToArray(data));
  };

  /**
   * Clears the stored data received history
   * @function clearDataReceivedHistory
   */
  this.clearDataReceivedHistory = function () {
    data_received_history = [];
  };

  /**
   * Emits the telemetry data's current state as a variety of packets
   * @function emitPackets
   * @example <caption> Usage example </caption>
   * TelemetryData.setCurrentState({
   *    packet_name: {
   *      packet_data1: 'packet_value1',
   *      packet_data2: 'packet_value2'
   *    }
   *    packet_name2: {
   *        ...
   *    }
   * })
   * //this will emit a 'packet_name' and 'packet_name2' events each with their respective data
   * TelemetryData.emitPackets();
   */
  this.emitPackets = function () {
    if (current_state) {
      _.each(current_state, function (packet_data, packet_name) {
        this.emit(packet_name, packet_data);
      }.bind(this));
    }
  };

  EventEmitter.call(this);
};

//give TelemetryData the ability to emit and listen to events
util.inherits(TelemetryData, EventEmitter);

var telemetry_data_instance = new TelemetryData();
telemetry_data_instance.setMaxListeners(advanced_config.get('telemetrydata_max_listeners'));

module.exports = telemetry_data_instance;