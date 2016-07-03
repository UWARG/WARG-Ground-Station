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
      this.headers = headers_string.split(",").map(function (str) {
        return str.trim();
      });
    }
  };

  /**
   * Sets the telemetry data headers
   * @function setHeaders
   * @returns {Array} The array of headers
   */
  this.getHeaders = function () {
    return this.headers;
  };

  /**
   * Sets the telemetry data headers
   * @function setHeaders
   * @param {Array} headers An array of headers
   */
  this.setHeaders = function (headers) {
    this.headers = headers;
  };

  /**
   * Clears the telemetry data headers
   * @function clearHeaders
   */
  this.clearHeaders = function () {
    this.headers = [];
  };

  /**
   * Takes in a packet object and emits each one with its own payload. Packet object should be in the same format as
   * the PacketTypes model, only the value being the value of the actual header.
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
  this.emitPackets = function (packets) {
    if (packets) {
      _.each(packets, function (packet_data, packet_name) {
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