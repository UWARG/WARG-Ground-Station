/**
 * @author Serge Babayan
 * @module managers/SimulationManager
 * @requires path
 * @requires models/TelemetryData
 * @requires util/Logger
 * @requires util/Validator
 * @requires util/PacketParser
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
var PacketParser = require('../util/PacketParser');
var Validator = require('../util/Validator');
var _ = require('underscore');

var SimulationManager = new function () {
  var string_data = [];
  var current_index = 0;
  var interval_id = null;

  /**
   * @var {int} transmission_frequency How often a second we want to transmit the data. Default is 5
   */
  this.transmission_frequency = 5;

  /**
   * @var {string} default_simulation_path The default path of the simulation csv file that we'll use
   */
  this.default_simulation_path = path.join(__dirname, '../../assets/simulation/default_flight_data.csv');

  /**
   * @var {bool} simulation_active Whether the simulation is currently running
   */
  this.simulation_active = false;

  /**
   * Clears all the simulation data and resets the index to 0
   * @function clearData
   */
  this.clearData = function () {
    string_data = [];
    current_index = 0;
  };

  /**
   * Add a packet of data to its internal storage, to be emitted later. If the internal
   * storage is empty, will set the headers
   * @function addDataEntry
   * @param {Array} data
   */
  this.addDataEntry = function (data) {
    string_data.push(data.join());
  };

  /**
   * Toggles the status of the simulator
   * @function toggleSimulation
   */
  this.toggleSimulation = function () {
    if (!this.simulation_active) { //begin the simulation
      interval_id = setInterval(function () {
        emitData();
      }, 1000 / Math.abs(this.transmission_frequency));
      this.simulation_active = true;
      StatusManager.setStatusCode('SIMULATION_ACTIVE', true);
      Network.disconnectAll();
    }
    else {//end the simulation
      clearInterval(interval_id);
      this.simulation_active = false;
      StatusManager.setStatusCode('SIMULATION_ACTIVE', false);
    }
  };

  /**
   * Change the frequency at which data is emitted. Re-toggles the simulation to apply the changes to the emitters immediately.
   * If a non-integer is passed in will not do anything.
   * @function setTransmissionFrequency
   * @param {int} new_frequency
   */
  this.setTransmissionFrequency = function (new_frequency) {
    if (Validator.isInteger(new_frequency) && new_frequency !== 0) {
      this.transmission_frequency = parseInt(new_frequency);
      if (this.simulation_active) {
        this.toggleSimulation();
        this.toggleSimulation();
      }
    }
  };

  /**
   * Injects the data packet at the current index into the TelemetryData module and emits the appropriate events
   * @private
   * @function emitData
   */
  var emitData = function () {
    if (string_data.length > 0) {
      TelemetryData.current_state = PacketParser.parseData(string_data[current_index], TelemetryData.headers);
      TelemetryData.emitPackets(TelemetryData.current_state);

      Logger.data(JSON.stringify(TelemetryData.current_state), 'DATA_RELAY_DATA');
      updateCurrentIndex();
    }
  };

  /**
   * Updates the current data index of the simulation
   * @private
   * @function updateCurrentIndex
   */
  var updateCurrentIndex = function () {
    if (SimulationManager.transmission_frequency < 0) { //if transmission frequency is negative
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