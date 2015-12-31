var Template=require('../util/Template');
var Map=require('../Map');
var TelemetryData=require('../models/TelemetryData');

module.exports=function(Marionette,L){

  return Marionette.ItemView.extend({
    template:Template('MapView'),
    className:'mapView', 

    ui:{
      map:'#leaflet-map'
    },

    initialize: function(){
      this.map=new Map(L);

    },
    onRender:function(){
      TelemetryData.addListener('data_received',function(data){
        this.map.movePlane(data.lat,data.lon,data.heading);
      }.bind(this));
      this.ui.map.ready(function(){
       this.map.createMap('leaflet-map');
      }.bind(this));
    },
    onBeforeDestroy:function(){
      
    }
  });
};