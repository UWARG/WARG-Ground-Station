var Template=require('../util/Template');
var TelemetryData=require('../models/TelemetryData');

module.exports=function(Marionette){

  return Marionette.ItemView.extend({
    template:Template('GainsAdjustView'), 
    className:'gainsAdjustView', 
    ui:{
      yaw_kd:'#yaw-kd',
      yaw_ki:'#yaw-ki',
      yaw_kp:'#yaw-kp',
      pitch_kd:'#pitch-kd',
      pitch_ki:'#pitch-ki',
      pitch_kp:'#pitch-kp',
      roll_kd:'#roll-kd',
      roll_ki:'#roll-ki',
      roll_kp:'#roll-kp',
      heading_kd:'#heading-kd',
      heading_ki:'#heading-ki',
      heading_kp:'#heading-kp',
      altitude_kd:'#altitude-kd',
      altitude_ki:'#altitude-ki',
      altitude_kp:'#altitude-kp',
      throttle_kd:'#throttle-kd',
      throttle_ki:'#throttle-ki',
      throttle_kp:'#throttle-kp',
      flap_kd:'#flap-kd',
      flap_ki:'#flap-ki',
      flap_kp:'#flap-kp',
      send_all:'#send-all-gains-button',
      reset_all:'#reset-default-gains-button'
    },

    initialize: function(){
      
    },
    onRender:function(){
      TelemetryData.addListener('data_received'. function(){
        console.log('data_received');
      });
    },
    onBeforeDestroy:function(){
      
    },
    onDestroy:function(){
     
    },

    clickCallback:function(event){ 

    }
  });
};