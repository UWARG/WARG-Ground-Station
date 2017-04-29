/**
 * @author Serge Babayan
 * @module AircraftStatus
 * @listens models/TelemetryData:data_received
 * @requires models/TelemetryData
 * @requires StatusManager
 * @requires util/Logger
 * @requires util/Validator
 * @requires util/Bitmask
 * @requires models/Commands
 * @requires config/picpilot-config
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Keeps track of the current state of the autopilot, and informs the StatusManger about any important
 * changes
 * @see http://docs.uwarg.com/picpilot/datalink/
 */

var TelemetryData = require('./models/TelemetryData');
var StatusManager = require('./StatusManager');
var Bitmask = require('./util/Bitmask');
var Validator = require('./util/Validator');
var Logger = require('./util/Logger');
var picpilot_config = require('../config/picpilot-config');
var Commands = require('./models/Commands');

var AircraftStatus = function () {
  /**
   * @var following_path {boolean} Whether the aircraft is currently following a path
   */
  this.following_path = false;

  /**
   * Information on the current autopilot status
   * @var autopilot_status
   * @type {{initializing: boolean, running: boolean, armed: boolean, killModeWarning: boolean, killModeActive: boolean}}
   */
  this.autopilot_status = {
    initializing: false, //Whether the aircraft is initializing
    running: false, //Whether the aircraft is in its main loop
    armed: false, //Whether the aircraft is armed
    killModeWarning: false, //Whether the aircraft is about to go into kill mode
    killModeActive: false //Whether the aircraft is currently in kill mode
  };

  /**
   * Whether the autopilot is on or off
   * @var manualMode
   * @type {boolean}
   */
  this.manualMode = false;

  /**
   * Current xbee connection status
   * @var xbee
   * @type {{status: boolean, timeSinceLost: null}}
   */
  this.xbee = {//has not been implemented yet from the picpilots side
    status: false,
    timeSinceLost: null
  };

  /**
   * Current gps connection status
   * var gps
   * @type {{status: boolean, timeSinceLost: null}}
   */
  this.gps = {
    status: false,
    timeSinceLost: null
  };

  /**
   * Current UHF connection status
   * @var uhf
   * @type {{status: boolean, timeSinceLost: null}}
   */
  this.uhf = {
    status: false,
    timeSinceLost: null
  };

  /**
   * What the last received error code was
   * @type {null | number}
   */
  this.pastErrorCode = null;

  /**
   * Startup errors that occurred on the autopilot
   * @var startup_errors
   * @type {{POWER_ON_RESET: boolean, BROWN_OUT_RESET: boolean, IDLE_MODE_RESET: boolean, SLEEP_MODE_RESET: boolean, SOFTWARE_WATCH_DOG_RESET: boolean, SOFTWARE_RESET: boolean, EXTERNAL_RESET: boolean, VOLTAGE_REGULATOR_RESET: boolean, ILLEGAL_OPCODE_RESET: boolean, TRAP_RESET: boolean}}
   */
  this.startup_errors = {
    POWER_ON_RESET: false,
    BROWN_OUT_RESET: false,
    IDLE_MODE_RESET: false,
    SLEEP_MODE_RESET: false,
    SOFTWARE_WATCH_DOG_RESET: false,
    SOFTWARE_RESET: false,
    EXTERNAL_RESET: false,
    VOLTAGE_REGULATOR_RESET: false,
    ILLEGAL_OPCODE_RESET: false,
    TRAP_RESET: false
  };

  /**
   * For keeping track and clearing the interval function when sending heartbeats to the picpilot
   * @var heartBeatInterval
   * @type {number}
   * @private
   */
  var heartBeatInterval;

  var heartbeat_on = false;

  /**
   * Starts sending heartbeats at the rate as specified in the picpilot config. Will clear and restart it if called multiple times
   * @function startHeartbeat
   */
  this.startHeartbeat = function () {
    this.stopHeartbeat();

    heartbeat_on = true;
    heartBeatInterval = setInterval(function () {
      Commands.sendHeartbeat();
    }.bind(this), picpilot_config.get('heartbeat_timeout'));
  }.bind(this);

  /**
   * Stops sending heartbeats at an interval.
   * @function stopHeartbeat
   */
  this.stopHeartbeat = function(){
    if (heartbeat_on) {
      clearInterval(heartBeatInterval);
      heartbeat_on = false;
    }
  }

  /**
   * Determines if heartbeat on
   *
   * @return     {boolean}  True if heartbeat on, False otherwise.
   */
  this.isHeartbeatOn = function(){
    return heartbeat_on;
  }

  /**
   * @function telemetryCallback
   * @private
   * @param data {Object}
   * @param data.startup_error_codes {number | null}
   * @param data.gps_status {number | null}
   * @param data.wireless_connection {number | null}
   * @param data.autopilot_active {number | null}
   * @param data.path_following {number | null}
   */
  var telemetryCallback = function (data) {
    checkErrorCodes(data.startup_errors);
    checkUHFStatus(data.uhf_channel_status);
    // checkGPS(data.gps_status);
    
    // checkManualMode(data.wireless_connection);
    checkPlaneStatus(data.program_state);
    checkPathFollowing(data.path_following);
  };

  TelemetryData.on('aircraft_status', telemetryCallback);

  /**
   * Checks whether the plane is currently following a path
   * @param status {number | null}
   */
  var checkPathFollowing = function (status) {
    if (status !== null) {
      this.following_path = (Number(status) === 1);
    }
  }.bind(this);

  /**
   * Checks the current autopilot status based on telemetry data
   * @param number {number | null}
   */
  var checkPlaneStatus = function (number) {
    if(number !== null){
      this.initializing = (number === 0);
      if (number === 1) { //only set armed to false if the number is ONLY 1
        this.armed = false;
      }
      this.armed = (number === 2);
      this.running = (number === 3);
      this.killModeWarning = (number === 4);
      this.killModeActive = (number === 5);

      StatusManager.setStatusCode('AIRCRAFT_INITIALIZE', this.initializing);
      StatusManager.setStatusCode('AIRCRAFT_UNARMED', !this.armed);
      StatusManager.setStatusCode('AIRCRAFT_ARMED', this.armed);
      StatusManager.setStatusCode('AIRCRAFT_RUNNING', this.running);
      StatusManager.setStatusCode('AIRCRAFT_KILLMODE_WARNING', this.killModeWarning);
      StatusManager.setStatusCode('AIRCRAFT_KILLMODE', this.killModeActive);
    }
  }.bind(this);

  var checkUHFStatus = function (data) {
    if(data !== null){
      this.uhf.status = (data != 0xFF); //255 means we've disconnected

      if (this.uhf.status) { //has been turned to true
        this.uhf.timeSinceLost = null;
      }
      else { //has been turned to false
        this.uhf.timeSinceLost = Date.now();
      }
      StatusManager.setStatusCode('UHF_LOST', !this.uhf.status);
    }
  }.bind(this);

  var checkManualMode = function (data) {
    // if(data !== null){
    //   var bitmask = new Bitmask(data);
    //   this.manualMode = !bitmask.getBit(0);
    //   StatusManager.setStatusCode('MANUAL_MODE', this.manualMode);
    // }
  }.bind(this);

  var checkGPS = function (data) {
   // if(data !== null) {
   //   var connection_status = ((data & 0xf0) >> 4) > 0; // if theres at least 1 fix
   //   if (connection_status !== this.gps.status) { //if its a different status
   //     this.gps.status = connection_status;
   //     StatusManager.setStatusCode('GPS_LOST', !this.gps.status);
   //     if (this.gps.status === false) { //if it was set to false, start the timer
   //       this.gps.timeSinceLost = Date.now();
   //     }
   //     else {
   //       this.gps.timeSinceLost = null;
   //     }
   //   }
   // }
  }.bind(this);

  var checkErrorCodes = function (dataNumber) {
    if (dataNumber !== null && this.pastErrorCode !== dataNumber) { //if we got an error code value thats different from last time
      var error_codes = new Bitmask(dataNumber);
      this.pastErrorCode = dataNumber;

      this.startup_errors.POWER_ON_RESET = error_codes.getBit(0);
      this.startup_errors.BROWN_OUT_RESET = error_codes.getBit(1);
      this.startup_errors.IDLE_MODE_RESET = error_codes.getBit(2);
      this.startup_errors.SLEEP_MODE_RESET = error_codes.getBit(3);
      this.startup_errors.SOFTWARE_WATCH_DOG_RESET = error_codes.getBit(4);
      this.startup_errors.SOFTWARE_RESET = error_codes.getBit(5);
      this.startup_errors.EXTERNAL_RESET = error_codes.getBit(6);
      this.startup_errors.VOLTAGE_REGULATOR_RESET = error_codes.getBit(7);
      this.startup_errors.ILLEGAL_OPCODE_RESET = error_codes.getBit(8);
      this.startup_errors.TRAP_RESET = error_codes.getBit(9);


      StatusManager.setStatusCode('AIRCRAFT_ERROR_POWER_ON_RESET', this.startup_errors.POWER_ON_RESET);
      StatusManager.setStatusCode('AIRCRAFT_ERROR_BROWN_OUT_RESET', this.startup_errors.BROWN_OUT_RESET);
      StatusManager.setStatusCode('AIRCRAFT_ERROR_IDLE_MODE_RESET', this.startup_errors.IDLE_MODE_RESET);
      StatusManager.setStatusCode('AIRCRAFT_ERROR_SLEEP_MODE_RESET', this.startup_errors.SLEEP_MODE_RESET);
      StatusManager.setStatusCode('AIRCRAFT_ERROR_SOFTWARE_WATCH_DOG_RESET', this.startup_errors.SOFTWARE_WATCH_DOG_RESET);
      StatusManager.setStatusCode('AIRCRAFT_ERROR_SOFTWARE_RESET', this.startup_errors.SOFTWARE_RESET);
      StatusManager.setStatusCode('AIRCRAFT_ERROR_EXTERNAL_RESET', this.startup_errors.EXTERNAL_RESET);
      StatusManager.setStatusCode('AIRCRAFT_ERROR_VOLTAGE_REGULATOR_RESET', this.startup_errors.VOLTAGE_REGULATOR_RESET);
      StatusManager.setStatusCode('AIRCRAFT_ERROR_ILLEGAL_OPCODE_RESET', this.startup_errors.ILLEGAL_OPCODE_RESET);
      StatusManager.setStatusCode('AIRCRAFT_ERROR_TRAP_RESET', this.startup_errors.TRAP_RESET);
    }
  }.bind(this)
};

module.exports = new AircraftStatus();