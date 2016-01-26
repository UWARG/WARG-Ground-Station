var Template=require('../util/Template');
var PlaneScene=require('../models/PlaneScene');

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
    },
    onBeforeDestroy:function(){
     
    },
    onDestroy:function(){
      
    }
  });
};