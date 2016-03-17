var fdialogs = require('node-webkit-fdialogs');
var csv=require('fast-csv');

var TelemetryData=require('../models/TelemetryData');
var Template=require('../util/Template');
var Logger=require('../util/Logger');
var SimulationManager=require('../SimulationManager');

module.exports=function(Marionette){

  return Marionette.ItemView.extend({
    template:Template('SimulationView'),
    className:'simulationView',

    ui:{
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

    onRender:function(){
      this.ui.file_path.text(SimulationManager.default_simulation_path);
      this.ui.transmission_speed.text(SimulationManager.transmission_frequency);

      if(SimulationManager.simulationActive){
        this.changeToStopButton();
      }
      else{
        this.changeToStartButton();
      }

      csv.fromPath(SimulationManager.default_simulation_path, {
        headers: true, //Set to true if you expect the first line of your CSV to contain headers, alternatly you can specify an array of headers to use.
        ignoreEmpty: true, //If you wish to ignore empty rows.
        discardUnmappedColumns: true, //If you want to discard columns that do not map to a header.
        delimiter: ',',
        trim: true //If you want to trim all values parsed set to true.
      })
      .on('data-invalid', function(){
          Logger.warn('Invalid data detected in simulation file');
       })
     .on("data", function(data){
        SimulationManager.addDataEntry(data);
     });
    },

    toggleSimulation: function(){
      SimulationManager.toggleSimulation();
      if(SimulationManager.simulationActive){
        this.changeToStopButton();
      }
      else{
        this.changeToStartButton();
      }
    },

    openSimulationFile: function(){
      var dialog = new fdialogs.FDialog({
        type: 'open',
        accept: ['.csv'],
        path: '~/Documents'
      });

      dialog.readFile(function (err, content, path) {
        if(err){
          Logger.error('There was an error reading the simulation file. Error: '+err);
        }
        else{
          this.ui.file_path.text(path);

          SimulationManager.clearData();

          csv.fromString(content, {
              headers: true, //Set to true if you expect the first line of your CSV to contain headers, alternatly you can specify an array of headers to use.
              ignoreEmpty: true, //If you wish to ignore empty rows.
              discardUnmappedColumns: true, //If you want to discard columns that do not map to a header.
              delimiter: ',',
              trim: true //If you want to trim all values parsed set to true.
            })
            .on('data-invalid', function(){
                Logger.warn('Invalid data detected in simulation file');
             })
           .on("data", function(data){
              SimulationManager.addDataEntry(data);
           });
        }
      }.bind(this));
    },

    changeTransmissionSpeed: function(){
      SimulationManager.changeTransmissionFrequency(this.ui.change_speed_slider.val());
      this.ui.transmission_speed.text(SimulationManager.transmission_frequency);
    },

    changeToStartButton: function(){
      this.ui.start_button.text('Start Simulation');
      this.ui.start_button.removeClass('button-error');
      this.ui.start_button.addClass('button-success');
    },
    changeToStopButton: function(){
      this.ui.start_button.text('Stop Simulation');
      this.ui.start_button.addClass('button-error');
      this.ui.start_button.removeClass('button-success');
    }
  });
};