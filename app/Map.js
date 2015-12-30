//a wrapper around leaflet that configures it as well
var map_config=require('../config/map-config');
var path=require('path');

var Map=function(L){
  var leaflet=L;//reference to the window leaflet object
  var map=null;
  var tiles_path=path.join(__dirname,'../assets/sat_tiles');

  this.createMap=function(id){
    map = leaflet.map(id).setView([51.505, -0.09], 13);
    map.setView(map_config.default_lat_lang, 17);
    map.attributionControl.setPrefix(false);
    leaflet.tileLayer(tiles_path+'/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(map);

  };
};

module.exports=Map;