var remote = require('electron').remote;
var Template=require('../util/Template');
var TelemetryData=remote.require('./app/models/TelemetryData');
var Logger=remote.require('./app/util/Logger');

module.exports=function(Marionette){
  var AttitudeView=require('./AttitudeView')(Marionette);
  var AltitudeView=require('./AltitudeView')(Marionette);
  var ThrottleView=require('./ThrottleView')(Marionette);

  return Marionette.LayoutView.extend({
    template:Template('CockpitLayoutView'), 
    className:'cockpitLayoutView', 

    regions:{
      attitude_region:'.attitude-region',
      altitude_region:'.altitude-region',
      throttle_region:'.throttle-region'
    },

    initialize: function(){

    },
    onRender:function(){
      this.getRegion('attitude_region').show(new AttitudeView());
      this.getRegion('altitude_region').show(new AltitudeView());
      this.getRegion('throttle_region').show(new ThrottleView());
    },
    onBeforeDestroy:function(){

    }
  });
};