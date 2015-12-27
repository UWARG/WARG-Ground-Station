var Template=require('../util/Template');

module.exports=function(Marionette,$){
  var ConsoleView=require('./ConsoleView')(Marionette);
  var StatusView=require('./StatusView')(Marionette,$);

	return Marionette.LayoutView.extend({
		template:Template('MainLayoutView'),
    className:'mainLayoutView',

    regions:{
      console:"#console-region",
      status:"#status-region",
      map: "#right-region",
      telemetry:"#top-left-region"
    },

		initialize: function(){

		},
    onRender:function(){
      this.getRegion('console').show(new ConsoleView());
      this.getRegion('status').show(new StatusView());
    },
		serializeData: function(){
			return{
				hello:'wasup serge!'
			}
		}
	});
}