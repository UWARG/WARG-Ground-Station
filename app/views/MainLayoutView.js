var Template=require('../util/Template');

module.exports=function(Marionette,$,fabric){
  var ConsoleView=require('./ConsoleView')(Marionette);
  var StatusView=require('./StatusView')(Marionette,$);
  var CockpitView=require('./CockpitView')(Marionette,fabric);

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
      this.getRegion('telemetry').show(new CockpitView());
    }
	});
}