var Template=require('../util/Template');

module.exports=function(Marionette){

  return Marionette.ItemView.extend({
    template:Template('MapView'),
    className:'mapView', 

    initialize: function(){
      
    },
    onRender:function(){
      
    },
    onBeforeDestroy:function(){
      
    }
  });
};