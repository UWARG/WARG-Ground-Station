var Template=require('../util/Template');

module.exports=function(Marionette,$,L){
  var ConsoleView=require('./ConsoleView')(Marionette);
  var StatusView=require('./StatusView')(Marionette,$);
  var CockpitLayoutView=require('./CockpitLayoutView')(Marionette);
  var MapView=require('./MapView')(Marionette,L);

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
      this.getRegion('telemetry').show(new CockpitLayoutView());
      this.getRegion('map').show(new MapView());
    }
	});
}