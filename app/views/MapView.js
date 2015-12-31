var Template=require('../util/Template');
var Map=require('../Map');
var TelemetryData=require('../models/TelemetryData');
var Validator=require('../util/Validator');
var Logger=require('../util/Logger');

module.exports=function(Marionette,L){

  return Marionette.ItemView.extend({
    template:Template('MapView'),
    className:'mapView', 

    ui:{
      map:'#leaflet-map',
      plane_location_lat:'.plane-latitude',
      plane_location_lon:'.plane-longitude'
    },

    initialize: function(){
      this.map=new Map(L);

    },
    onRender:function(){
      TelemetryData.addListener('data_received',function(data){
        this.map.movePlane(data.lat,data.lon,data.heading);
        this.map.expandPlaneTrail(data.lat,data.lon);
        this.setLatitudeLongitude(data.lat,data.lon);
      }.bind(this));
      this.ui.map.ready(function(){
       this.map.createMap('leaflet-map');
      }.bind(this));
    },
    onBeforeDestroy:function(){
      
    },
    setLatitudeLongitude: function(lat,lon){
      if(Validator.isValidLatitude(lat) && Validator.isValidLongitude(lon)){
        this.ui.plane_location_lat.text(Number(lat).toFixed(5));
        this.ui.plane_location_lon.text(Number(lon).toFixed(5));
      }else{
        Logger.warn('Invalid longitude or latitude received! Latitude: '+lat+' Longitude: '+lon);
        this.ui.plane_location_lat.text('Invalid');
        this.ui.plane_location_lon.text('Invalid');
      }
    }
  });
};