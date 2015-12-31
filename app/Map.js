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

  overlay_layers['Plane Trail']=new leaflet.Polyline([], {
      color: '#190019',
      opacity: 0.6,
      weight: 5,
      clickable: true,
  });

  var centerToPlane=leaflet.control.button({
    name: 'recenter',
    text: 'C',
    title: 'Center on plane',
    onclick: function () {
        if (overlay_layers['Plane']) {
            map.panTo(overlay_layers['Plane'].getLatLng());
        }
    }
  });

  this.createMap=function(id){
    map = leaflet.map(id,{
      center: map_config.default_lat_lang,
      zoom: 17,
      layers: [base_layers['Satellite'], overlay_layers['Plane'],overlay_layers['Plane Trail']] //the default layers of the map
    });

    map.setView(map_config.default_lat_lang, 17);
    map.attributionControl.setPrefix(false);

    //allow the user to turn on and off specific layers
    L.control.layers(base_layers, overlay_layers).addTo(map);
    map.addControl(centerToPlane);
  };

  this.movePlane=function(lat,lng, heading){
    overlay_layers['Plane'].setLatLng([lat,lng]);
    overlay_layers['Plane'].angle = heading;
    overlay_layers['Plane'].update();
  };

  this.expandPlaneTrail=function(lat,lng){
    overlay_layers['Plane Trail'].addLatLng([lat,lng]);
  };
};

module.exports=Map;