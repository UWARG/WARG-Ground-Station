var Template=require('../util/Template');
var Commands=require('../models/Commands');

module.exports=function(Marionette){

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
      Commands.armPlane();
    },

    disarmPlane: function(){
      Commands.disarmPlane();
    },

    killPlane: function(){
      Commands.killPlane();
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