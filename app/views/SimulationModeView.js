var Template=require('../util/Template');

module.exports=function(Marionette){

  return Marionette.ItemView.extend({
    template:Template('SimulationView'),
    className:'simulationView',

    initialize: function(){
    
    },
    onRender:function(){
      
    },
    onBeforeDestroy:function(){
      
    }
  });
};