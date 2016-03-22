var Template = require('../util/Template');
var Logger = require('../util/Logger');
var Commands = require('../models/Commands');
var TelemetryData = require('../models/TelemetryData');
var StatusManager = require('../StatusManager');
var moment = require('moment');
var Validator = require('../util/Validator');

var range=1024;
var gain=10;
module.exports = function (Marionette,$) {

    return Marionette.ItemView.extend({
        template: Template('RadioInputView'),
        className: 'radioInputView',
        ui: {
            left_stick:".bounding-box .left-stick",
            right_stick:".bounding-box .right-stick"
        },
        events: {
        },
        intialize: function(){
        this.data_callback=null;    
        },
        onRender: function () {
            this.data_callback = this.onDataCallback.bind(this);
            TelemetryData.addListener('data_received', this.data_callback);
        },
        onBeforeDestroy: function () {
            TelemetryData.removeListener('data_received', this.data_callback);
        },
        onDataCallback: function (data) {
            this.setPitch(data.int_pitch_setpoint);
            this.setRoll(data.int_roll_setpoint);
            this.setYaw(data.int_yaw_setpoint);
            //Logger.debug("callback");
        },
        setPitch: function (pitch){
          if(Validator.isValidInput(pitch))
          {
          var temp=pitch/range;
          var shift=(40+(temp*gain))+'%';
          Logger.debug("setting pitch to "+shift+" from "+ pitch);
          this.ui.right_stick.css('bottom',shift);
          }
        },
        setRoll: function (roll){
            if(Validator.isValidInput(roll))
            {
        var temp=roll/range;
          var shift=(19+(temp*gain))+'%';
          Logger.debug("setting roll to "+shift+" from "+ roll);
          this.ui.left_stick.css('left',shift);    
            }
        },
        setYaw: function (yaw){
            if(Validator.isValidInput(yaw))
            {
        var temp=yaw/range;
          var shift=(61.5+(temp*gain))+'%';
          Logger.debug("setting yaw to "+shift+" from "+ yaw);
          this.ui.right_stick.css('left',shift);    
            }
        }
    });
    };
