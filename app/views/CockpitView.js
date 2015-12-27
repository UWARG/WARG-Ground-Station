var Template=require('../util/Template');

module.exports=function(Marionette,fabric){

  return Marionette.ItemView.extend({
    template:Template('CockpitView'), 
    className:'cockpitView', 

    ui:{ 
     attitude_dials:'.attitude-dial canvas',
     pitch_dial:'.pitch_dial'
    },

    events:{
      
    },

    initialize: function(){
      
    },
    onRender:function(){
      this.setCanvasDimensions();
      this.ui.attitude_dials.parent().resize(this.setCanvasDimensions.bind(this));
    },
    onBeforeDestroy:function(){
      
    },
    onDestroy:function(){
      
    },
    setCanvasDimensions: function(){
      var canvas_dimensions=Math.min(this.ui.attitude_dials.parent().width()-12,this.ui.attitude_dials.parent().height()-85);
      if(canvas_dimensions){
        this.ui.attitude_dials.css({
        width:canvas_dimensions,
        height:canvas_dimensions
       });
      }
    }
  });
};