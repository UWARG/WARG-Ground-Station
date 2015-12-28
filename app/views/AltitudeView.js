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
     attitude_dials:'.dial-picture'
    },

    events:{
     
    },

    initialize: function(){
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
      
    },
    setCanvasDimensions: function(){
      var canvas_dimensions=Math.min(this.ui.attitude_dials.parent().width()-12,this.ui.attitude_dials.parent().height()-105);
      if(canvas_dimensions){
        this.ui.attitude_dials.css({
        width:canvas_dimensions,
        height:canvas_dimensions
       });
      }
    }
  });
};