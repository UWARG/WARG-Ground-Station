//Attitude view (the one with all the dials)
//Note: this view should never be re-rendered
var Template=require('../util/Template');
var TelemetryData=require('../models/TelemetryData');
var Logger=require('../util/Logger');
var Validator=require('../util/Validator');
var Commands=require('../models/Commands');

module.exports=function(Marionette){

  return Marionette.ItemView.extend({
    template:Template('AttitudeView'), 
    className:'attitudeView', 

    ui:{ 
     attitude_dials:'.dial-picture',
     pitch_dial:'.pitch-dial .dial-picture .fluid',
     roll_dial:'.roll-dial .dial-picture .fluid',
     heading_dial:'.heading-dial .dial-picture .image-overlay',
     horizon_dial:'.horizon-dial .dial-picture .fluid',
     pitch_text:'.pitch-dial .current-value',
     roll_text:'.roll-dial .current-value',
     heading_text:'.heading-dial .current-value',
     pitch_setpoint:'.pitch-dial .auto-pilot-setpoint',
     roll_setpoint:'.roll-dial .auto-pilot-setpoint',
     heading_setpoint:'.heading-dial .auto-pilot-setpoint',
     roll_input:'.roll-dial form input',
     pitch_input:'.pitch-dial form input',
     heading_input:'.heading-dial form input'
    },

    events:{
      'submit .roll-dial form':'sendSetRoll',
      'submit .pitch-dial form':'sendSetPitch',
      'submit .heading-dial form':'sendSetHeading'
    },

    initialize: function(){
      this.current_pitch=null;
      this.current_roll=null;
      this.current_heading=null;

      this.telemetry_callback=null;
    },
    onRender:function(){
      this.ui.attitude_dials.parent().resize(this.setCanvasDimensions.bind(this));

      this.telemetry_callback=this.telemetryCallback.bind(this);
      TelemetryData.addListener('data_received',this.telemetry_callback);
    },
    onBeforeDestroy:function(){
      TelemetryData.removeListener('data_received',this.telemetry_callback);
    },
    telemetryCallback: function(data){
      this.setPitch(data.pitch);
      this.setRoll(data.roll);
      this.setHeading(data.heading);
      this.setPitchSetpoint(data.pitch_setpoint);
      this.setRollSetpoint(data.roll_setpoint);
      this.setHeadingSetpoint(data.heading_setpoint);
    },
    setCanvasDimensions: function(){
      var canvas_dimensions=Math.min(this.ui.attitude_dials.parent().width()-12,this.ui.attitude_dials.parent().height()-105);
      if(canvas_dimensions){
        this.ui.attitude_dials.css({
        width:canvas_dimensions,
        height:canvas_dimensions
       });
      }
    },
    setPitch:function(pitch){
      if(Validator.isValidPitch(pitch)){
        this.ui.pitch_text.text(Number(pitch).toFixed(1));
        var int_pitch=Math.round(Number(pitch));
        if(int_pitch!==this.current_pitch){ //we only update the display if its something different
          this.current_pitch=int_pitch;
          var pitchPercent=(Number(pitch)/90).toFixed(2);
          var dial_height=this.ui.pitch_dial.parent().height()/2;
          this.ui.horizon_dial.css('height',Math.round(dial_height+dial_height*pitchPercent)+'px');
          this.ui.pitch_dial.css('transform','rotate('+int_pitch+'deg) scale(2)');
        }  
      }else{
        this.ui.pitch_dial.css('height','0px');
        Logger.warn('Invalid pitch value received! Pitch: '+pitch);
      }
    },
    setRoll: function(roll){
      if(Validator.isValidRoll(roll)){
        this.ui.roll_text.text(Number(roll).toFixed(1));
        var int_roll=Math.round(Number(roll));
        if(int_roll!==this.current_roll){ //we only update the display if its something different
          this.current_roll=int_roll;
          this.ui.horizon_dial.css('transform','rotate('+int_roll+'deg) scale(2)');
          this.ui.roll_dial.css('transform','rotate('+int_roll+'deg) scale(2)');
        }  
      }else{
        this.ui.roll_dial.css('height','0px');
        Logger.warn('Invalid roll value received! Roll: '+roll);
      }
    },
    setHeading:function(heading){
      if(Validator.isValidHeading(heading)){
        this.ui.heading_text.text(Number(heading).toFixed(1));
        var int_heading=Math.round(Number(heading));
        if(int_heading!==this.current_heading){ //we only update the display if its something different
          this.current_heading=int_heading;
          this.ui.heading_dial.css('transform','rotate('+int_heading+'deg)');
        }  
      }else{
        this.ui.heading_dial.css('transform','rotate('+0+'deg)');
        Logger.warn('Invalid heading value received! Heading: '+heading);
      }
    },
    setRollSetpoint: function(roll){
      if(Validator.isValidRoll(roll)){
        this.ui.roll_setpoint.text(Number(roll).toFixed(2));
      }
      else{
        this.ui.roll_setpoint.text('--');
        Logger.warn('Invalid setRoll value received!! Roll: '+roll);
      }
    },
    setPitchSetpoint: function(pitch){
      if(Validator.isValidPitch(pitch)){
        this.ui.pitch_setpoint.text(Number(pitch).toFixed(2));
      }
      else{
        this.ui.pitch_setpoint.text('--');
        Logger.warn('Invalid setPoll value received!! Pitch: '+pitch);
      }
    },
    setHeadingSetpoint: function(heading){
      if(Validator.isValidHeading(heading)){
        this.ui.heading_setpoint.text(Number(heading).toFixed(2));
      }
      else{
        this.ui.heading_setpoint.text('--');
        Logger.warn('Invalid setHeading value received!! Heading: '+heading);
      }
    },
    sendSetPitch: function(e){
      e.preventDefault();
      Commands.sendPitch(this.ui.pitch_input.val());
      this.ui.pitch_input.val('');
    },
    sendSetRoll: function(e){
      e.preventDefault();
      Commands.sendRoll(this.ui.roll_input.val());
      this.ui.roll_input.val('');
    },
    sendSetHeading: function(e){
      e.preventDefault();
      Commands.sendHeading(this.ui.heading_input.val());
      this.ui.heading_input.val('');
    }
  });
};