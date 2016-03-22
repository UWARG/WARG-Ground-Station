var Template=require('../util/Template');

module.exports=function(Marionette,$,L,window){
  var ConsoleView=require('./ConsoleView')(Marionette);
  var StatusView=require('./StatusView')(Marionette,$);
  var CockpitLayoutView=require('./CockpitLayoutView')(Marionette);
  var MapView=require('./MapView')(Marionette,L);
  var EmergencyButtonsView=require('./EmergencyButtonsView')(Marionette,window);

	return Marionette.LayoutView.extend({
		template:Template('MainLayoutView'),
    className:'mainLayoutView',

    regions:{
      console:"#console-region",
      status:"#status-region",
      map: "#right-region",
      telemetry:"#top-left-region",
      buttons: "#emergency-button-region"
    },

		initialize: function(){

		},
    onRender:function(){
      this.getRegion('console').show(new ConsoleView());
      this.getRegion('status').show(new StatusView());
      this.getRegion('telemetry').show(new CockpitLayoutView());
      this.getRegion('map').show(new MapView());
      this.getRegion('buttons').show(new EmergencyButtonsView());
    }
	});
}