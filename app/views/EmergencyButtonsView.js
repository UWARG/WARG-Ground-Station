var Template=require('../util/Template');
var Commands=require('../models/Commands');

//Note this view requires the global window object for the alert boxes (at least for now)
module.exports=function(Marionette, window){

  return Marionette.ItemView.extend({
    template:Template('EmergencyButtonsView'), 
    className:'emergencyButtonsView',

    events:{
      'click #arm-plane-button':'armPlane',
      'click #disarm-plane-button':'disarmPlane',
      'click #kill-plane-button':'killPlane',
      'click #unkill-plane-button':'unkillPlane',
      'click #drop-probe-button':'dropProbe',
      'click #reset-probe-button':'resetProbe'
    },


    initialize: function(){
      
    },

    onRender:function(){
      
    },

    armPlane: function(){
      if(window.confirm('This command arms the plane. Is everyone away from the propeller?')){
        Commands.armPlane();
      }
    },

    disarmPlane: function(){
      Commands.disarmPlane();
    },

    killPlane: function(){
      if(window.confirm('Are you sure you want to kill the plane? This WILL crash the plane. (1/2)') && window.confirm('Are you ABSOLUTELY SURE you want to do this? (2/2)')){
        Commands.killPlane();
      }
    },

    unkillPlane: function(){
      Commands.unkillPlane();
    },

    dropProbe: function(){
      Commands.dropProbe();
    },

    resetProbe: function(){
      Commands.resetProbe();
    }
  });
};