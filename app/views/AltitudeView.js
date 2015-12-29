//Altitude view (the one with the altititude and speed dials)
//Note: this view should never be re-rendered
var Template=require('../util/Template');
var TelemetryData=require('../models/TelemetryData');
var Logger=require('../util/Logger');
var Validator=require('../util/Validator');
var Commands=require('../models/Commands');

module.exports=function(Marionette){

  return Marionette.ItemView.extend({
    template:Template('AltitudeView'), 
    className:'altitudeView', 

    ui:{ 
     altitude_dials:'.dial-picture',
     altitude_hand:'.height-dial .dial-hand',
     altitude_text:'.height-dial .current-value',
     altitude_setpoint_text:'.height-dial .auto-pilot-setpoint',
     altitude_input:'.height-dial input',
     ground_speed_hand:'.ground-speed-dial .dial-hand',
     ground_speed_text:'.ground-speed-dial .current-value',
     air_speed_hand:'.air-speed-dial .dial-hand',    
     air_speed_text:'.air-speed-dial .current-value',
    },

    events:{
     'submit .height-dial form':'sendAltitudeSetpointCommand'
    },

    initialize: function(){
      //For drawing the dial correctly
      this.max_ground_speed=40;
      this.max_air_speed=40;
      this.max_altitude=200;

      this.telemetry_callback=null;
    },
    onRender:function(){
      this.ui.altitude_dials.parent().resize(this.setCanvasDimensions.bind(this));

      this.telemetry_callback=this.telemetryCallback.bind(this);
      TelemetryData.addListener('data_received',this.telemetry_callback);
    },
    onBeforeDestroy:function(){
      TelemetryData.removeListener('data_received',this.telemetry_callback);
    },
    telemetryCallback: function(data){
      this.setAltitude(data.altitude);
      this.setAltitudeSetpoint(data.altitude_setpoint);
      this.setGroundspeed(data.ground_speed);
      //this.setAirspeed(data.airspeed); We dont have the airspeed yet
      this.setAirspeed(24); //TODO: remove this after!
    },
    setCanvasDimensions: function(){
      var canvas_dimensions=Math.min(this.ui.altitude_dials.parent().width()-12,this.ui.altitude_dials.parent().height()-105);
      if(canvas_dimensions){
        this.ui.altitude_dials.css({
        width:canvas_dimensions,
        height:canvas_dimensions
       });
      }
    },
    setAltitude: function(altitude){
      if(Validator.isValidAltitude(altitude)){
        var int_alt=Number(altitude);
        var degrees=(int_alt/this.max_altitude)*360;
        this.ui.altitude_hand.css('transform','rotate('+degrees+'deg)');
        this.ui.altitude_text.text(int_alt.toFixed(1));
      }
      else{
        Logger.warn('Altitude received is not valid! Altitude:'+altitude);
        this.ui.altitude_text.text('--');
        this.ui.altitude_hand.css('transform','rotate(0deg)');
      }
    },
    setGroundspeed: function(speed){
      if(Validator.isValidSpeed(speed)){
        var int_speed=Number(speed);
        var degrees=(int_speed/this.max_ground_speed)*360;
        this.ui.ground_speed_hand.css('transform','rotate('+degrees+'deg)');
        this.ui.ground_speed_text.text(int_speed.toFixed(1));
      }
      else{
        Logger.warn('Groundspeed received is not valid! Groundspeed:'+speed);
        this.ui.ground_speed_text.text('--');
        this.ui.ground_speed_hand.css('transform','rotate(0deg)');
      }
    },
    setAirspeed: function(speed){
      if(Validator.isValidSpeed(speed)){
        var int_speed=Number(speed);
        var degrees=(int_speed/this.max_ground_speed)*360;
        this.ui.air_speed_hand.css('transform','rotate('+degrees+'deg)');
        this.ui.air_speed_text.text(int_speed.toFixed(1));
      }
      else{
        Logger.warn('Airspeed received is not valid! Airspeed:'+speed);
        this.ui.air_speed_text.text('--');
        this.ui.air_speed_hand.css('transform','rotate(0deg)');
      }
    },
    setAltitudeSetpoint: function(altitude){
      if(Validator.isValidNumber(altitude)){
        this.ui.altitude_setpoint_text.text(Number(altitude).toFixed(2));
      }
      else{
        Logger.warn('Invalid setAltitudeText value received! Altitude:'+altitude);
        this.ui.altitude_setpoint_text.text('--');
      }
    },
    sendAltitudeSetpointCommand: function(e){
      e.preventDefault();
      Commands.sendAltitude(this.ui.altitude_input.val());
      this.ui.altitude_input.val('');
    }
  });
};