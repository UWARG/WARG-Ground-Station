/**
 * @author Serge Babayan
 * @module util/Commands
 * @requires util/Validator
 * @requires managers/SimulationManager
 * @requires util/Logger
 * @requires managers/NetworkManager
 * @requires config/picpilot-config
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Manages sending the picpilot commands. Writes to the data relay connection to send commands. Validates
 * data before sending it out using the Validator module.
 * @see http://docs.uwarg.com/picpilot/datalink/
 */
var picpilot_config = require('../../config/picpilot-config');
var NetworkManager = require('../managers/NetworkManager');
var Logger = require('../util/Logger');
var Validator = require('../util/Validator');
var SimulationManager = require("../managers/SimulationManager");

var Commands = {
  /**
   * Checks whether there is an active data relay connection
   * @function checkConnection
   * @returns {boolean} Connection status
   */
  checkConnection: function () {
    if (SimulationManager.isActive()) {
      return false;
    }
    if (NetworkManager.getConnectionByName('data_relay') && !NetworkManager.getConnectionByName('data_relay').isClosed()) {
      return true;
    }
    else {
      Logger.warn('Cannot send command as the data_relay connection has not yet been established or the connection is closed');
      return false;
    }
  },

  /**
   * Sends a protected command (a command requiring a password appended after the command)
   * @function sendProtectedCommand
   * @param command {string}
   * @returns {boolean} Whether the command was successfully sent. Will return false if there is no connection and the simulator isn't active
   */
  sendProtectedCommand: function (command) {
    if (this.checkConnection()) {
      NetworkManager.getConnectionByName('data_relay').write(command + ':' + picpilot_config.get('command_password') + '\r\n');
      return true;
    }
    if (SimulationManager.isActive()) {
      Logger.info('[Simulation] Successfully sent command ' + command + ':' + picpilot_config.get('command_password') + '\r\n');
      return true;
    }
    return false;
  },

  /**
   * Sends a regular command to the data relay
   * @function sendCommand
   * @param command {string} The command name
   * @param value {string | Number} The value of the command. This can be lots of different parameters
   * @returns {boolean} Whether the command was successfully sent. Will return false if there is no connection and the simulator isn't active
   * @example
   * Commands.sendCommand('awesomeCommand', 'value1', 'value2', 'value3');
   * //will send this through the data relay
   * //awesomeCommand:value1, value2, value3
   */
  sendCommand: function (command, value) { //value can be an indefinite number of arguments
    var value_string = '';
    for (var arg = 1; arg < arguments.length - 1; arg++) { //we start at one cause we only care about the values
      value_string += arguments[arg] + ',';
    }

    value_string += arguments[arguments.length - 1];

    if (this.checkConnection()) {
      NetworkManager.getConnectionByName('data_relay').write(command + ':' + value_string + '\r\n');
      return true;
    }
    if (SimulationManager.isActive()) {
      Logger.info('[Simulation] Successfully sent command ' + command + ':' + value_string + '\r\n');
      return true;
    }
    return false;
  },

  /**
   * Sends a raw command (no formatting) to the data relay
   * @function sendRawCommand
   * @param command {string} The command string
   * @returns {boolean} Whether the command was successfully sent. Will return false if there is no connection and the simulator isn't active
   */
  sendRawCommand: function (command) {
    if (this.checkConnection()) {
      NetworkManager.getConnectionByName('data_relay').write(command + '\r\n');
      return true;
    }
    if (SimulationManager.isActive()) {
      Logger.info('[Simulation] Successfully sent command: ' + command);
      return true;
    }
    return false;
  },

  /**
   * Actives write mode for the groundstation, allowing the groundstation to send commands that affect the autopilot
   * @function activateWriteMode
   * @returns {boolean} Whether the command sent successfully
   */
  activateWriteMode: function () {
    return this.sendRawCommand('commander');
  },

  /**
   * Sends a roll value to the autopilot
   * @function sendRoll
   * @param roll {string|Number} The roll in degrees
   * @returns {boolean} Whether the command sent successfully
   */
  sendRoll: function (roll) {
    if (Validator.isValidRoll(roll)) {
      return this.sendCommand('set_rollAngle', roll);
    }
    else {
      Logger.error('Command to not sent since invalid roll value detected! Roll:' + roll);
      return false;
    }
  },

  /**
   * Sends a pitch value to the autopilot
   * @function sendPitch
   * @param pitch {string|Number} The pitch in degrees
   * @returns {boolean} Whether the command sent successfully
   */
  sendPitch: function (pitch) {
    if (Validator.isValidPitch(pitch)) {
      return this.sendCommand('set_pitchAngle', pitch);
    }
    else {
      Logger.error('Command to not sent since invalid pitch value detected! Pitch:' + pitch);
      return false;
    }
  },

  /**
   * Sends a heading value to the autopilot
   * @function sendHeading
   * @param heading {string|Number} The heading in degrees (0-360)
   * @returns {boolean} Whether the command sent successfully
   */
  sendHeading: function (heading) {
    if (Validator.isValidHeading(heading)) {
      return this.sendCommand('set_heading', heading);
    }
    else {
      Logger.error('Command to not sent since invalid heading value detected! Heading:' + heading);
      return false;
    }
  },

  /**
   * Sends a altitude value to the autopilot
   * @function sendAltitude
   * @param altitude {string|Number} The altitude in m
   * @returns {boolean} Whether the command sent successfully
   */
  sendAltitude: function (altitude) {
    if (Validator.isValidAltitude(altitude)) {
      return this.sendCommand('set_altitude', altitude);
    }
    else {
      Logger.error('Command to not sent since invalid altitude value detected! Altitude:' + altitude);
      return false;
    }
  },

  /**
   * Sends a throttle value to the autopilot
   * @function sendThrottle
   * @param throttle {string|Number} The percentage value of the throttle
   * @returns {boolean} Whether the command sent successfully
   */
  sendThrottle: function (throttle) {
    if (Validator.isValidPercentage(throttle)) {
      return this.sendCommand('set_throttle', (Number(throttle) * 2048 / 100 - 1024).toFixed(0));
    }
    else {
      Logger.error('Command to not sent since invalid throttle value detected! Throttle:' + throttle);
      return false;
    }
  },

  /**
   * Sends a flap value to the autopilot
   * @function sendFlap
   * @param flap {string|Number} The flap percentage (0 is no flaps, 100% is full flaps)
   * @returns {boolean} Whether the command sent successfully
   */
  sendFlap: function (flap) {
    if (Validator.isValidPercentage(flap)) {
      return this.sendCommand('set_flap', (Number(flap) * 2048 / 100 - 1024).toFixed(0));
    }
    else {
      Logger.error('Command to not sent since invalid flap value detected! Flap Setpoint:' + flap);
      return false;
    }
  },

  /**
   * Sends a path gain value to the autopilot
   * @function sendPathGain
   * @param gain {string|Number} The gain value
   * @returns {boolean} Whether the command sent successfully
   */
  sendPathGain: function (gain) {
    if (Validator.isValidNumber(gain)) {
      return this.sendCommand('set_pathGain', gain);
    }
    else {
      Logger.error('Command to not sent since invalid path gain value detected! Gain value:' + gain);
      return false;
    }
  },

  /**
   * Sends a orbital gain value to the autopilot
   * @function sendOrbitGain
   * @param gain {string|Number} The gain value
   * @returns {boolean} Whether the command sent successfully
   */
  sendOrbitGain: function (gain) {
    if (Validator.isValidNumber(gain)) {
      return this.sendCommand('set_orbitGain', gain);
    }
    else {
      Logger.error('Command to not sent since invalid orbit gain value detected! Gain value:' + gain);
      return false;
    }
  },

  /**
   * Sends an autonomous level to the picpilot. Check the datalink docs for more info
   * @function sendAutoLevel
   * @param level {string|Number} The autonomous level as a decimal value
   * @returns {boolean} Whether the command sent successfully
   */
  sendAutoLevel: function (level) {
    if (Validator.isInteger(level) && Validator.isPositiveNumber(level)) {
      return this.sendCommand('set_autonomousLevel', level);
    }
    else {
      Logger.error('Command not sent since invalid autonomous level value detected! Value: ' + level);
      return false;
    }
  },

  /**
   * Arms the plane
   * @function armPlane
   * @returns {boolean} Whether the command sent successfully
   */
  armPlane: function () {
    return this.sendProtectedCommand('arm_vehicle');
  },

  /**
   * Disarms the plane
   * @function disarmPlane
   * @returns {boolean} Whether the command sent successfully
   */
  disarmPlane: function () {
    return this.sendProtectedCommand('dearm_vehicle');
  },

  /**
   * Kills the plane
   * @function killPlane
   * @returns {boolean} Whether the command sent successfully
   */
  killPlane: function () {
    return this.sendProtectedCommand('kill_plane');
  },

  /**
   * Unkills the plane
   * @function unkillPlane
   * @returns {boolean} Whether the command sent successfully
   */
  unkillPlane: function () {
    return this.sendProtectedCommand('unkill_plane');
  },

  /**
   * Drop a probe
   * @function dropProbe
   * @param number {string|Number} The probe number of which to drop
   * @returns {boolean} Whether the command sent successfully
   */
  dropProbe: function (number) {
    if (Validator.isInteger(number) && Validator.isPositiveNumber(number)) {
      return this.sendCommand('drop_probe', number);
    }
    else {
      Logger.error('dropProbe command not since invalid probe number was passed in. Number: ' + number);
    }
  },

  /**
   * Reset a probe
   * @function resetProbe
   * @param number {string|Number} The probe number of which to drop
   * @returns {boolean} Whether the command sent successfully
   */
  resetProbe: function (number) {
    if (Validator.isInteger(number) && Validator.isPositiveNumber(number)) {
      return this.sendCommand('reset_probe', number);
    }
    else {
      Logger.error('resetProbe command not since invalid probe number was passed in. Number: ' + number);
      return false;
    }
  },

  /**
   * Clears all the waypoints for the path manager
   * @function clearWaypoints
   * @returns {boolean} Whether the command sent successfully
   */
  clearWaypoints: function () {
    return this.sendCommand('clear_waypoints', 1);
  },

  /**
   * Sets the target waypoint for the autopilot's path manager
   * @function setTargetWaypoint
   * @param number {String | Number} The id of the waypoint
   * @returns {boolean} Whether the command sent successfully
   */
  setTargetWaypoint: function (number) {
    if (Validator.isInteger(number) && Validator.isPositiveNumber(number)) {
      return this.sendCommand('set_targetWaypoint', number);
    }
    else {
      Logger.error('setTargetWaypoint command not since invalid waypoint number was passed in. Number: ' + number);
      return false;
    }
  },

  /**
   * Tells the aircraft to go to it's home waypoint
   * function returnHome
   * @returns {boolean} Whether the command sent successfully
   */
  returnHome: function () {
    return this.sendCommand('return_home', 1);
  },

  /**
   * Cancels the return home command
   * function cancelReturnHome
   * @returns {boolean} Whether the command sent successfully
   */
  cancelReturnHome: function () {
    return this.sendCommand('cancel_returnHome', 1);
  },

  /**
   * Sets the home coordinates for the autopilot
   * @param lat {string | Number} Latitude of home target
   * @param lon {string | Number} Longitude of home target
   * @param alt {string | Number} Altitude of home target
   * @returns {boolean} Whether the command sent successfully
   */
  sendHomeCoordinates: function (lat, lon, alt) {
    if (Validator.isValidLatitude(lat) && Validator.isValidLongitude(lon) && Validator.isValidAltitude(alt)) {
      return this.sendCommand('set_ReturnHomeCoordinates', lon, lat, alt);
    }
    else {
      Logger.error(`sendHomeCoordinates command not since invalid coordinates were passed in. Altitude: ${alt}, Latitude: ${lat}, Longitude: ${lon}`);
    }

  },

  /**
   * Appends a waypoint to the autopilots flight plan
   * @function appendWaypoint
   * @param lat {string | Number} Latitude of waypoint
   * @param lon {string | Number} Longitude of waypoint
   * @param alt {string | Number} Altitude of waypoint
   * @param radius {string | Number} Radius, in m, of the waypoint
   * @param probe_drop {boolean} Whether the waypoint is a probe drop location
   * @returns {boolean} Whether the command sent successfully
   */
  appendWaypoint: function (lat, lon, alt, radius, probe_drop) {
    if (Validator.isValidLatitude(lat) && Validator.isValidLongitude(lon) && Validator.isValidAltitude(alt) && Validator.isPositiveNumber(radius)) {
      return this.sendCommand('new_waypoint', lon, lat, alt, radius, (!!probe_drop) * 1);
    }
    else {
      Logger.error(`appendWaypoint command not since invalid coordinates or radius were passed in. Altitude: ${alt}, Latitude: ${lat}, Longitude: ${lon}, Radius: ${radius}`);
      return false;
    }
  },

  /**
   * Inserts a waypoint at a specified index to the autopilot's flight plan
   * @function insertWaypoint
   * @param index {int} The index of the waypoint
   * @param lat {string | Number} Latitude of waypoint
   * @param lon {string | Number} Longitude of waypoint
   * @param alt {string | Number} Altitude of waypoint
   * @param radius {string | Number} Radius, in m, of the waypoint
   * @returns {boolean} Whether the command sent successfully
   */
  insertWaypoint: function (index, lat, lon, alt, radius) { //note: Probe drop type hasn't been implemented here yet
    if (Validator.isInteger(index) && Validator.isPositiveNumber(index) && Validator.isValidLatitude(lat) && Validator.isValidLongitude(lon) && Validator.isValidAltitude(alt) && Validator.isPositiveNumber(radius)) {
      return this.sendCommand('insert_Waypoint', lon, lat, alt, radius, index - 1, index + 1);
    }
    else {
      Logger.error(`insertWaypoint command not since invalid coordinates or radius were passed in. Index: ${index}, Altitude: ${alt}, Latitude: ${lat}, Longitude: ${lon}, Radius: ${radius}`);
      return false;
    }
  },

  /**
   * Inserts a waypoint at a specified index to the autopilot's flight plan
   * @function insertWaypoint
   * @param index {int} The index of the waypoint
   * @param lat {string | Number} Latitude of waypoint
   * @param lon {string | Number} Longitude of waypoint
   * @param alt {string | Number} Altitude of waypoint
   * @param radius {string | Number} Radius, in m, of the waypoint
   * @param probe_drop {boolean} Whether the waypoint is a probe drop location
   * @returns {boolean} Whether the command sent successfully
   */
  updateWaypoint: function (index, lat, lon, alt, radius, probe_drop) {
    if (Validator.isInteger(index) && Validator.isPositiveNumber(index) && Validator.isValidLatitude(lat) && Validator.isValidLongitude(lon) && Validator.isValidAltitude(alt) && Validator.isPositiveNumber(radius)) {
      return this.sendCommand('update_waypoint', lon, lat, alt, radius, (!!probe_drop) * 1, index);
    }
    else {
      Logger.error(`updateWaypoint command not since invalid coordinates or radius were passed in. Index: ${index}, Altitude: ${alt}, Latitude: ${lat}, Longitude: ${lon}, Radius: ${radius}`);
      return false;
    }
  },

  /**
   * Removes a waypoint from the autopilot's flight plan
   * @function removeWaypoint
   * @param index {String | Number} The id of the waypoint
   * @returns {boolean} Whether the command sent successfully
   */
  removeWaypoint: function (index) {
    if (Validator.isInteger(index) && Validator.isPositiveNumber(index)) {
      return this.sendCommand('remove_waypoint', index);
    }
    else {
      Logger.error('removeWaypoint command not since invalid waypoint number was passed in. Number: ' + index);
      return false;
    }
  },

  /**
   * Tell the aircraft to follow the flight plan
   * @function followPath
   * @param status {boolean} Whether the plane should follow the flight plan
   * @returns {boolean} Whether the command sent successfully
   */
  followPath: function (status) {
    if (status) {
      return this.sendCommand('follow_path', 1);
    }
    else {
      return this.sendCommand('follow_path', 0);
    }
  },

  /**
   * Send a heartbeat to the plane
   * @function sendHeartbeat
   * @returns {boolean} Whether the command sent successfully
   */
  sendHeartbeat: function () {
    if (this.sendCommand('send_heartbeat', 1)) {
      Logger.debug('[HEARTBEAT] Sent heartbeat to the picpilot');
    }
  },

  /**
   * Tells the autopilot to send a gains packet down
   * @function requestGains
   * @returns {boolean} Whether the command sent successfully
   */
  requestGains: function(){
    return this.sendCommand('show_gains', 1);
  },

  /**
   * @function sendPitchAngleGains
   * @param kp
   * @param kd
   * @param ki
   * @returns {boolean} Whether the command send successfully
   */
  sendPitchAngleGains: function (kp, kd, ki) {
    return this.sendCommand('set_pitch_angle_gains', kp, ki, kd);
  },

  /**
   * @function sendRollAngleGains
   * @param kp
   * @param kd
   * @param ki
   * @returns {boolean} Whether the command send successfully
   */
  sendRollAngleGains: function (kp, kd, ki) {
    return this.sendCommand('set_roll_angle_gains', kp, ki, kd);
  },

  /**
   * @function sendRollRateGains
   * @param kp
   * @param kd
   * @param ki
   * @returns {boolean} Whether the command send successfully
   */
  sendRollRateGains: function (kp, kd, ki) {
    return this.sendCommand('set_roll_rate_gains', kp, ki, kd);
  },
  
  
  /**
  * @function sendPitchRate
  * @param rate
  * @returns {boolean} Whether the command send successfully
  */
  sendRollRate: function(rate) {
    return this.sendCommand('set_rollRate', rate);
  },


 /**
   * @function sendPitchRateGains
   * @param kp
   * @param kd
   * @param ki
   * @returns {boolean} Whether the command send successfully
   */
  sendPitchRateGains: function (kp, kd, ki) {
    return this.sendCommand('set_pitch_rate_gains', kp, ki, kd);
  },

/**
  * @function sendPitchRate
  * @param rate
  * @returns {boolean} Whether the command send successfully
  */
  sendPitchRate: function(rate) {
    return this.sendCommand('set_pitchRate', rate);
  },
  
  
 /**
   * @function sendYawRateGains
   * @param kp
   * @param kd
   * @param ki
   * @returns {boolean} Whether the command send successfully
   */
  sendYawRateGains: function (kp, kd, ki) {
    return this.sendCommand('set_yaw_rate_gains', kp, ki, kd);
  },


/**
  * @function sendYawRate
  * @param rate
  * @returns {boolean} Whether the command send successfully
  */
  sendYawRate: function(rate) {
    return this.sendCommand('set_yawRate', rate);
  },


/**
   * @function sendAltitudeGains
   * @param kp
   * @param kd
   * @param ki
   * @returns {boolean} Whether the command send successfully
   */
  sendAltitudeGains: function (kp, kd, ki) {
    return this.sendCommand('set_altitude_gains', kp, ki, kd);
  },

 /**
   * @function sendHeadingGains
   * @param kp
   * @param kd
   * @param ki
   * @returns {boolean} Whether the command send successfully
   */
  sendHeadingGains: function (kp, kd, ki) {
    return this.sendCommand('set_heading_gains', kp, ki, kd);
  },

/**
   * @function sendGroundSpeedGains
   * @param kp
   * @param kd
   * @param ki
   * @returns {boolean} Whether the command send successfully
   */
  sendGroundSpeedGains: function (kp, kd, ki) {
    return this.sendCommand('set_ground_speed_gains', kp, ki, kd);
  },

  /**
   * Sets the adverse yaw scale factor. ie. How much yaw to apply in
   * proportion to a roll
   *
   * @param      {float}  factor  The factor
   * @return     {boolean} Whether the command send successfully
   */
  setAdverseYawScaleFactor: function(factor){
    return this.sendCommand('set_adverseYawMix', factor);
  },

  /**
   * Sets the pitch turn factor. ie how much pitch to apply in proportion
   * to a roll
   *
   * @param      {float}  factor  The factor
   * @return     {boolean} Whether the command send successfully
   */
  setPitchTurnFactor: function(factor){
    return this.sendCommand('set_turnFactor', factor);
  }
};

module.exports = Commands;