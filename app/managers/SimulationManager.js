/**
 * @author Serge Babayan
 * @module managers/SimulationManager
 * @requires path
 * @requires models/TelemetryData
 * @requires util/Logger
 * @requires util/Validator
 * @requires StatusManager
 * @requires models/Network
 * @requires underscore
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Manager used to run data relay simulations. Takes in data and injects it into the TelemetryData module and
 * sends out the appropriate events. Only used by the SimulationModeView.
 * @see http://docs.uwarg.com/picpilot/datalink/
 */

var path = require('path');
var TelemetryData = require('../models/TelemetryData');
var Logger = require('../util/Logger');
var StatusManager = require('../StatusManager');
var Network = require('../Network');
var Validator = require('../util/Validator');
var _ = require('underscore');

var SimulationManager = new function () {
  var string_data = [];

  /** @type {int} **/
  var current_index = 0;

  /** @type {int|null} **/
  var interval_id = null;

  /** @type {int} **/
  var transmission_frequency = 5;

  /** @type {string} **/
  var simulation_file_path = path.join(__dirname, '../../assets/simulation/default_flight_data.csv');

  /** @type {boolean} **/
  var simulation_active = false;

  /**
   * Whether the simulation is currently active
   * @function isActive
   * @returns {boolean}
   */
  this.isActive = function () {
    return simulation_active;
  };

  /**
   * Sets the simulation file path
   * @function setSimulationFilePath
   * @param {string} new_path New simulation file path
   */
  this.setSimulationFilePath = function (new_path) {
    simulation_file_path = new_path;
  };

  /**
   * Returns the current file path for the simulation file
   * @function getSimulationFilePath
   * @returns {string}
   */
  this.getSimulationFilePath = function () {
    return simulation_file_path;
  };

  /**
   * Returns the current transmission frequency
   * @returns {int}
   */
  this.getTransmissionFrequency = function () {
    return transmission_frequency;
  };

  /**
   * Change the frequency at which data is emitted. Re-toggles the simulation to apply the changes to the emitters immediately.
   * If a non-integer or 0 is passed in will not do anything.
   * @function setTransmissionFrequency
   * @param {int} new_frequency
   */
  this.setTransmissionFrequency = function (new_frequency) {
    if (Validator.isInteger(new_frequency) && new_frequency !== 0) {
      transmission_frequency = parseInt(new_frequency);
      if (simulation_active) {
        this.toggleSimulation();
        this.toggleSimulation();
      }
    }
  };

  /**
   * Clears all the simulation data entires and resets the index to 0
   * @function clearData
   */
  this.clearData = function () {
    string_data = [];
    current_index = 0;
  };

  /**
   * Adds a data entry to be emitted later
   * @function addDataEntry
   * @param {Array} data An array of comma delimited strings, representing data received from the data relay
   */
  this.addDataEntry = function (data) {
    string_data.push(data.join());
  };

  /**
   * Toggles the status of the simulator
   * @function toggleSimulation
   */
  this.toggleSimulation = function () {
    if (!simulation_active) { //begin the simulation
      interval_id = setInterval(function () {
        emitData();
      }, 1000 / Math.abs(transmission_frequency));
      simulation_active = true;
      StatusManager.setStatusCode('SIMULATION_ACTIVE', true);
      Network.disconnectAll();
    }
    else {//end the simulation
      clearInterval(interval_id);
      simulation_active = false;
      StatusManager.setStatusCode('SIMULATION_ACTIVE', false);
    }
  };

  /**
   * Injects the data packet at the current index into the TelemetryData module and emits the appropriate events
   * @private
   * @function emitData
   */
  var emitData = function () {
    if (string_data.length > 0) {
      TelemetryData.setCurrentStateFromString(string_data[current_index]);
      TelemetryData.emitPackets();

      Logger.data(JSON.stringify(TelemetryData.getCurrentState()), 'DATA_RELAY_DATA');
      updateCurrentIndex();
    }
  };

  /**
   * Updates the current data index of the simulation
   * @private
   * @function updateCurrentIndex
   */
  var updateCurrentIndex = function () {
    if (transmission_frequency < 0) { //if transmission frequency is negative
      if (current_index - 1 < 0) {
        current_index = string_data.length - 1;
      }
      else {
        current_index--;
      }
    }
    else {
      if (current_index + 1 > string_data.length) {
        current_index = 0;
      }
      else {
        current_index++;
      }
    }
  };
};

module.exports = SimulationManager;