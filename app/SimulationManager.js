var path = require('path');
var TelemetryData = require('./models/TelemetryData');
var Logger = require('./util/Logger');
var StatusManager = require('./StatusManager');
var Network = require('./Network');

//this simulation manager fakes the data relay station by inputting data straight into the telemetryData module
var SimulationManager = {
  simulated_data: [],
  current_index: 0,
  transmission_frequency: 5, //how many times a second we want to transmit the data
  default_simulation_path: path.join(__dirname, '../assets/simulation/default_flight_data.csv'),
  simulationActive: false,
  intervalID: null,

  clearData: function () {
    this.simulated_data = [];
    this.current_index = 0;
  },

  //emits the data to the telemetry data
  emitData: function () {
    if (this.simulated_data.length > 0) {
      TelemetryData.current_state = this.simulated_data[this.current_index];
      TelemetryData.state_history.push(TelemetryData.current_state);
      TelemetryData.emit('data_received', TelemetryData.current_state);
      Logger.data(JSON.stringify(TelemetryData.current_state), 'DATA_RELAY_DATA');

      if (this.transmission_frequency < 0) { //if transmission frequency is negative
        if (this.current_index - 1 < 0) {
          this.current_index = this.simulated_data.length - 1;
        }
        else {
          this.current_index--;
        }
      }
      else {
        if (this.current_index + 1 > this.simulated_data.length) {
          this.current_index = 0;
        }
        else {
          this.current_index++;
        }
      }
    }
  },

  addDataEntry: function (data) {
    if (this.simulated_data.length === 0) { //add the headers
      TelemetryData.headers = Object.keys(data);
      Logger.debug('Headers from simulation file: ' + TelemetryData.headers);
    }
    //get rid of any stupid brackets because old versions of the flight data files may have them
    var keys = Object.keys(data);
    for (var i = 0; i < keys.length; i++) {
      data[keys[i]] = data[keys[i]].replace('(', '').replace(')', '');
    }
    this.simulated_data.push(data);
  },

  toggleSimulation: function () {
    if (!this.simulationActive) { //begin the simulation
      this.intervalID = setInterval(function () {
        this.emitData();
      }.bind(this), 1000 / Math.abs(this.transmission_frequency));
      this.simulationActive = true;
      StatusManager.setStatusCode('SIMULATION_ACTIVE', true);
      Network.disconnectAll();
    }
    else {//end the simulation
      clearInterval(this.intervalID);
      this.simulationActive = false;
      StatusManager.setStatusCode('SIMULATION_ACTIVE', false);
    }
  },

  changeTransmissionFrequency: function (new_frequency) {
    var new_f = parseInt(new_frequency);
    if (parseInt(new_frequency)) {
      this.transmission_frequency = new_f;
      if (this.simulationActive) {
        this.toggleSimulation();
        this.toggleSimulation();
      }
    }
  },
};

module.exports = SimulationManager;