//a wrapper around leaflet that configures it as well
var map_config=require('../config/map-config');
var path=require('path');

var Map=function(L){
  var leaflet=L;//reference to the window leaflet object
  var map=null;

  //Set up paths
  var tiles_path=path.join(__dirname,'../assets/sat_tiles');
  var images_path=path.join(__dirname,'../assets/images');
  leaflet.Icon.Default.imagePath = path.join(__dirname,'../assets/leaflet');

  var base_layers={};
  var overlay_layers={};
 
  base_layers['Satellite']=leaflet.tileLayer(tiles_path+'/{z}/{x}/{y}.png', {
    maxZoom: 19
  });

  overlay_layers['Plane']=new leaflet.RotatedMarker(map_config.default_lat_lang, {
    icon: leaflet.icon({
      iconUrl: images_path+'/plane.png',
      iconSize: [30, 30]
    })
  });

  this.createMap=function(id){
    map = leaflet.map(id,{
      center: map_config.default_lat_lang,
      zoom: 17,
      layers: [base_layers['Satellite'], overlay_layers['Plane']] //the default layers of the map
    });

    map.setView(map_config.default_lat_lang, 17);
    map.attributionControl.setPrefix(false);

    //allow the user to turn on and off specific layers
    L.control.layers(base_layers, overlay_layers).addTo(map);
  };
};

module.exports=Map;