var Template=require('../util/Template');
var PlaneScene=require('../models/PlaneScene');
var TelemetryData=require('../models/TelemetryData');
var Validator=require('../util/Validator');

module.exports=function(Marionette,THREE,window){

  return Marionette.ItemView.extend({
    template:Template('3dView'), 
    className:'3dView',

    ui:{
      plane_scene:'#plane-scene'
    },

    initialize: function(){
      this.planeScene=new PlaneScene(THREE,window);
    },
    onRender:function(){
     this.ui.plane_scene.append(this.planeScene.renderer.domElement);

     TelemetryData.on('data_received',function(data){
        var set_pitch=0,set_roll=0,set_yaw=0;
        console.log('data received');
        console.log(this.planeScene);
        if(Validator.isValidHeading(data.heading)){
          set_yaw=data.heading;
        }
        if(Validator.isValidPitch(data.pitch)){
          set_pitch=data.pitch;
        }
        if(Validator.isValidRoll(data.roll)){
          set_roll=data.roll;
        }
        console.log('exited if statemnet');

        this.planeScene.rotateAircraft(set_pitch,set_yaw,set_roll);
        console.log('exited function');
     }.bind(this));
    },
    onBeforeDestroy:function(){
     
    },
    onDestroy:function(){
      
    }
  });
};