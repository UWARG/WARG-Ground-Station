/**
 * @author Serge Babayan
 * @module models/TelemetryData
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

var util = require('util');
var advanced_config = require('../../config/advanced-config');
var EventEmitter = require('events');

/**
 * When a new data packet has been received on the data relay connection
 * @event TelemetryData:data_received
 * @property {Object} data - The received data from the data relay connection. Data is in the same format as `TelemetryData.current_state`
 */

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
   * @var headers {Array}
   * An array of headers in the order that the groundstation will be receiving them, as specified from the data relay
   * @example
   * console.log(TelemetryData.headers)
   * ['lat', 'lon', 'time', ...]
   */
  this.headers = [];

  /**
   * @var received {Array}
   * All [{time, data}] received from data relay station (one item per transmission, increasing index more recent)
   * @example
   * console.log(TelemetryData.received)
   * [
   *  {
   *    time: 126549876,
   *    data: [34, 5656, 234, 123, ..]
   *  }
   *  ...
   * ]
   */
  this.received = [];

  /**
   * @var current_state {Hash}
   * Current flight state. In the format of a hash, where the keys are the header names, and the values are the data
   * @example
   * console.log(TelemetryData.current_state)
   * {
   *  lat: 45.45455,
   *  lon: 324234,
   *  time: 234324324,
   *  ...
   * }
   */
  this.current_state = {};

  /**
   * @var state_history {Array}
   * All past flight states. Unlike the `received` property, the contents of the array are hashes in the same form as `current_state`
   */
  this.state_history = [];

  /**
   * @var sent {Array}
   * All [time, data] data sent to the data relay station (one item per transmission, increasing index more recent)
   */
  this.sent = [];

  EventEmitter.call(this);
};

util.inherits(TelemetryData, EventEmitter); //give TelemetryData events functionality, so that we can emit and recieve events

var td = new TelemetryData();
td.setMaxListeners(advanced_config.get('telemetrydata_max_listeners'));

module.exports = td;