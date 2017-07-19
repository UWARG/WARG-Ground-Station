/**
 * @author Bingzheng Feng
 * @module views/SignalCalibrationView
 * @requires electron
 * @requires util/Template
 * @requires models/TelemetryData
 * @requires util/Validator
 * @requires models/Commands
 * @listens models/TelemetryData~TelemetryData:data_received
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Responsible for display and calibrate RC signal inputs.
 */

var remote = require('electron').remote;
var Template = require('../util/Template');
var TelemetryData = remote.require('./app/models/TelemetryData');
var Validator = require('../util/Validator');
var Commands = remote.require('./app/models/Commands');

module.exports = function (Marionette) {

  return Marionette.ItemView.extend( {
    template: Template('SignalCalibrationView'),
    className: 'signalCalibrationView',

    ui: {
      record_btn: '.record',
      table: 'table',
      error_log: '.error-log',
	  scaled: '#show_pwm_scaled',
    },

    events: {
      'click .record': 'startRecord',
      'click .clear': 'clearData',
	  'click #show_pwm_scaled': 'scalingSwitcher',
    },

    initialize: function () {
      this.channels = {}
      // boolean to show the ground station is recording the range or not
      this.record = false;
      this.write_mode = false;
	  this.pwm_scaled = null;
      // boolean to indicate if ranges dictionary is empty
      // initialize it with kv pairs
      this.channelDictInit();
    },
    
    serializeData: function () {
      return {
        channels: this.channels,
      }
    },
    
    channelDictInit: function() {
      for(var count = 1; count <= 8; count++) {
        this.channels['ch' + count.toString() + '_in'] = {'upper': null, 'lower': null};
      }
    },
    
    onRender: function () {
	  this.channel_range_callback = this.channelRangeCallback.bind(this);
      TelemetryData.addListener('aircraft_channels', this.channel_range_callback);
    },
    
    onBeforeDestroy: function () {
      TelemetryData.removeListener('aircraft_channels', this.channel_range_callback);
    },
	
	// this function turns on write mode, if it is on, it does nothing
	turnOnWriteMode: function() {
	  if(!this.write_mode){
		Commands.activateWriteMode();
		this.write_mode = true;
	  }
	},
    
    startRecord: function() {
      if(!this.record) {
        this.turnOnWriteMode();
        this.record = true;
        this.ui.record_btn.text("Calibrate");
      } else {
        this.record = false;
        var channel_count = 1;
        var empty_channel = [];
        var invalid_channel = [];
        this.ui.record_btn.text("Record");
        for(var key in this.channels) {
          var offset = Math.round((this.channels[key]['upper'] + this.channels[key]['lower'])/2);
          if(Validator.isValidNumber(offset)) {
            var scale = 1024.0 / (offset-this.channels[key]['lower']);
            // check each parameter
            if(Validator.isFloat(scale) && Validator.isInteger(offset)) {
              // send offset and scale to picpilot
              Commands.setChannelFactor(channel_count, offset, scale);
			  //debug only
			  console.log(channel_count, offset, scale);
            } else {
              invalid_channel.push(channel_count);
            }
          } else {
            empty_channel.push(channel_count);
          }
          channel_count ++;
        }
        // give feedback to user on each channel
        var msg = "";
        if(empty_channel.length) {
          msg += "The following channels receives null: ";
          for(var i in empty_channel) {
            msg += i.toString() + " ";
          }
          msg += '\n';
        }
        if(invalid_channel.length) {
          msg += "The following channels has invalid value received: ";
          for(var i in invalid_channel) {
            msg += invalid_channel[i].toString() + " ";
          }
        }
        this.ui.error_log.text(msg);
        this.turnOnWriteMode();
      }
    },
    
    clearData: function() {
      this.turnOnWriteMode();
      this.record = false;
      this.channelDictInit();
      this.ui.error_log.text("");
      this.render();
    },
	
	scalingSwitcher: function() {
	  this.turnOnWriteMode();
	  if(!this.scaled) {
		Commands.setScaled(1);
		this.ui.scaled.text('Turn Off PWM Scaling');
		this.ui.scaled.attr('class', 'pure-button button-error');
		this.scaled = false;
	  } else {
		Commands.setScaled(0);
		this.ui.scaled.text('Turn On PWM Scaling');
		this.ui.scaled.attr('class', 'pure-button button-success');
		this.scaled = true;
	  }
	},
		
    
    isValidNewVal: function(val) {
      return (val!=null) && ((val != -10000 && this.scaled) || (!this.scaled && val != 0) ) ;
    },
    
    channelRangeCallback: function (data) {
	  if(data['channels_scaled'] != null) {
	    this.scaled = data['channels_scaled'];
	  }
	  if(this.scaled) {
		this.ui.scaled.text('Turn Off PWM Scaling');
		this.ui.scaled.attr('class', 'pure-button button-error');
	  } else if(this.scaled != null && (!this.scaled)){
		this.ui.scaled.text('Turn On PWM Scaling');
		this.ui.scaled.attr('class', 'pure-button button-success');
	  }
      if(this.record) {
        // key stands for channel name, e.g. ch1_in
        for(var key in this.channels) {
          var current_val = data[key];
          var channel = this.channels[key];
          var channel_tbody = this.ui.table.find(("."+key));
          // record if the recorded value is null, not max/min, or -10000(off)
          if((channel['upper'] == null || channel['upper'] < current_val) && this.isValidNewVal(current_val)) {
            this.channels[key]['upper'] = current_val;
            channel_tbody.find(".upper").text(this.channels[key]['upper']);
          }
          if((channel['lower'] == null || channel['lower'] > current_val) && this.isValidNewVal(current_val)) {
            this.channels[key]['lower'] = current_val;
            channel_tbody.find(".lower").text(this.channels[key]['lower']);
          }
          // fill in the ui
        }
      }
    },
  });
};