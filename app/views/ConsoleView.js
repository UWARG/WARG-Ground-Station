var Template=require('../util/Template');

module.exports=function(Marionette,_){

  return Marionette.LayoutView.extend({
    template:Template('ConsoleView'),
    className:'consoleView',

    regions:{
      status_region:"#status"
    },

    initialize: function(){

    }
  });
}