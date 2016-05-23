var remote = require('electron').remote;
var Template=require('../util/Template');
var PlaneScene=require('../models/PlaneScene');
var TelemetryData=remote.require('./app/models/TelemetryData');
var Validator=require('../util/Validator');

module.exports=function(Marionette,THREE,window){

  return Marionette.ItemView.extend({
    template:Template('3dView'), 
    className:'threeDView',

    ui:{
      plane_scene:'#plane-scene'
    },

    initialize: function(){
      this.planeScene=new PlaneScene(THREE,window);
    },
    onRender:function(){
     this.ui.plane_scene.append(this.planeScene.renderer.domElement);
     this.data_callback=this.dataCallback.bind(this);

     this.ui.plane_scene.resize(function(){
      this.planeScene.resize(this.ui.plane_scene.width(),this.ui.plane_scene.height());
     }.bind(this));

     TelemetryData.addListener('data_received',this.data_callback);
    },

    dataCallback: function(data){
      var set_pitch=0,set_roll=0,set_yaw=0;

      if(Validator.isValidHeading(data.heading)){
        set_yaw=data.heading;
      }
      if(Validator.isValidPitch(data.pitch)){
        set_pitch=data.pitch;
      }
      if(Validator.isValidRoll(data.roll)){
        set_roll=data.roll;
      }
      this.planeScene.rotateAircraft(set_pitch,set_yaw,set_roll);
    },

    onBeforeDestroy:function(){
     TelemetryData.removeListener('data_received',this.data_callback);
    }
  });
};