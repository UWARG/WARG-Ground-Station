var Template=require('../util/Template');
var TelemetryData=require('../models/TelemetryData');
var Logger=require('../util/Logger');

module.exports=function(Marionette,fabric){
  var AttitudeView=require('./AttitudeView')(Marionette);

  return Marionette.LayoutView.extend({
    template:Template('CockpitLayoutView'), 
    className:'cockpitLayoutView', 

    regions:{
      attitude_region:'.attitude-region',
      altitude_region:'.altitude-region',
      throttle_region:'.throttle-region'
    },

    ui:{ 

    },

    events:{
      
    },

    initialize: function(){
      
    },
    onRender:function(){
      this.getRegion('attitude_region').show(new AttitudeView());
    },
    onBeforeDestroy:function(){
      
    }
  });
};