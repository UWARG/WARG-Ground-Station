/**
 * @author Serge Babayan
 * @module views/SimulationModeView
 * @requires managers/SimulationManager
 * @requires util/Logger
 * @requires models/TelemetryData
 * @requires util/Template
 * @requires fast-csv
 * @requires electron
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Simulation view that allows the user to select and run a simulation file at a specified speed
 */

var remote = require('electron').remote;
var TelemetryData = remote.require('./app/models/TelemetryData');
var Logger = remote.require('./app/util/Logger');
var PacketParser = remote.require('./app/util/PacketParser');
var SimulationManager = remote.require('./app/managers/SimulationManager');
var Template = require('../util/Template');
var dialog = remote.dialog;
var csv = require('fast-csv');

module.exports = function (Marionette) {

  return Marionette.ItemView.extend({
    template: Template('SimulationView'),
    className: 'simulationView',

    ui: {
      file_path: '#selected-file-path',
      transmission_speed: '#selected_speed',
      start_button: '#toggle-simulation-button',
      change_speed_slider: '#change-speed-slider'
    },

    events: {
      'click #toggle-simulation-button': 'toggleSimulation',
      'click #select-new-file-button': 'openSimulationFile',
      'change #change-speed-slider': 'changeTransmissionSpeed'
    },

    onRender: function () {
      this.ui.file_path.text(SimulationManager.getSimulationFilePath());
      this.ui.transmission_speed.text(SimulationManager.getTransmissionFrequency());

      if (SimulationManager.isActive()) {
        this.changeToStopButton();
      }
      else {
        this.changeToStartButton();
      }

      this.parseSimulationFile(SimulationManager.getSimulationFilePath());
    },

    /**
     * Parses the simulation file, and adds its data entries into the Simulation Manager. Sets TelemetryData headers to be the first line of the file.
     * @function parseSimulationFile
     * @param {String} file_path Simulation file path
     */
    parseSimulationFile: function (file_path) {
      SimulationManager.clearData();

      var headersPacket = true; //the first line of the file is headers

      //Note: this configuration option will output the csv data in an array format
      //ie. ['header1','header2', ...] or [213,23,43,5]
      csv.fromPath(file_path, {
        headers: false, //Set to true if you expect the first line of your CSV to contain headers
        ignoreEmpty: true, //If you wish to ignore empty rows.
        discardUnmappedColumns: true, //If you want to discard columns that do not map to a header.
        delimiter: ',',
        trim: true, //If you want to trim all values parsed set to true.
        objectMode: true //if we want to return the stringified version of the data, set to false
      }).on("data", function (data) {
        if (headersPacket) {
          TelemetryData.setHeaders(data);
          PacketParser.checkForMissingHeaders(TelemetryData.getHeaders());
          Logger.debug('Headers from simulation file: ' + TelemetryData.getHeaders());
          headersPacket = false;
        }
        else {
          SimulationManager.addDataEntry(data);
        }
      });
    },

    /**
     * Toggles the simulation status and sets the appropriate button colors
     * @function toggleSimulation
     */
    toggleSimulation: function () {
      SimulationManager.toggleSimulation();
      if (SimulationManager.isActive()) {
        this.changeToStopButton();
      }
      else {
        this.changeToStartButton();
      }
    },

    /**
     * Opens an electron dialog window, so that the user can select a file. When a file is selected, calls parseSimulationFile
     * with the file path
     * @function openSimulationFile
     */
    openSimulationFile: function () {
      dialog.showOpenDialog({
        properties: ['openFile'],
        title: 'Select Simulation File',
        defaultPath: SimulationManager.getSimulationFilePath(),
        buttonLabel: 'Open',
        filters: [
          {name: 'CSV Simulation File', extensions: ['csv']},
          {name: 'All Files', extensions: ['*']}
        ]
      }, function (file_path) {
        if (!file_path) {
          Logger.debug('No simulation file selected');
          return;
        }
        file_path = file_path[0];
        this.ui.file_path.text(file_path);
        SimulationManager.setSimulationFilePath(file_path);
        this.parseSimulationFile(file_path);
      }.bind(this));
    },

    /**
     * Changes the transmission frequency of the simulation manager based on the slider value
     * @function changeTransmissionSpeed
     */
    changeTransmissionSpeed: function () {
      SimulationManager.setTransmissionFrequency(this.ui.change_speed_slider.val());
      this.ui.transmission_speed.text(SimulationManager.getTransmissionFrequency());
    },

    /**
     * Modifies the Start Simulation/Stop Simulation button to be the start simulation button
     * @function changeToStartButton
     */
    changeToStartButton: function () {
      this.ui.start_button.text('Start Simulation');
      this.ui.start_button.removeClass('button-error');
      this.ui.start_button.addClass('button-success');
    },

    /**
     * Modifies the Start Simulation/Stop Simulation button to be the stop simulation button
     * @function changeToStopButton
     */
    changeToStopButton: function () {
      this.ui.start_button.text('Stop Simulation');
      this.ui.start_button.addClass('button-error');
      this.ui.start_button.removeClass('button-success');
    }
  });
};