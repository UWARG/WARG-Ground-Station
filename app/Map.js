//a wrapper around leaflet that configures it as well
var map_config=require('../config/map-config');
var path=require('path');
var MapDraw=require('./map/MapDraw');
var MapMeasure=require('./map/MapMeasure');
var MapPath=require('./map/MapPath');
var PathManager=require("./map/PathManager");

var map_states=Object.freeze({ //freeze keeps anything else from changing these values
  MOVE: 1,
  ADD_WAYPOINT:2,
  DELETE_WAYPOINT: 3
});

var Map=function(L){
  var leaflet=L;//reference to the window leaflet object
  var map=null;
  var waypointLine = leaflet.polyline([[0,0]], {color: 'red'});

  this.state=map_states.MOVE;

  this.eventListeners={
    add_waypoint_click: function(e){
      var coords=e.latlng;
      coords.alt=100;
      PathManager.addWaypoint(coords);
      waypointLine.setLatLngs(PathManager.local_waypoints);
      var waypoint=new leaflet.waypoint(coords,{
        waypointCount: PathManager.current_waypoint
      });
      PathManager.current_waypoint++;
      waypoint.addTo(map);
      waypoint.on('drag',eventListeners.drag_waypoint.bind(waypoint));
    },
    drag_waypoint: function(){
      PathManager.local_waypoints[this.waypointCount]=this._latlng;
      waypointLine.setLatLngs(PathManager.local_waypoints);
    }
  };
var eventListeners=this.eventListeners;
  var mapPath= new MapPath(leaflet);

  //Set up paths
  var tiles_path=path.join(__dirname,'../assets/sat_tiles');
  var images_path=path.join(__dirname,'../assets/images');
  leaflet.Icon.Default.imagePath = path.join(__dirname,'../assets/leaflet');

  //draw the map layers
  var base_layers={};
  var overlay_layers={};
 
  base_layers['Satellite']=leaflet.tileLayer(tiles_path+'/{z}/{x}/{y}.png', {
    maxZoom: 19
  });

  base_layers['Streets']=leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  });

  base_layers['Google Satellite']=new leaflet.Google('SATELLITE');

  overlay_layers['Plane']=new leaflet.RotatedMarker(map_config.get('default_lat_lang'), {
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

  

  var centerToPlaneButton=L.easyButton( 'icon ion-pinpoint', function(){
    if (overlay_layers['Plane']) {
      map.panTo(overlay_layers['Plane'].getLatLng());
    }
  });
  
  this.createMap=function(id){
    map = leaflet.map(id,{
      center: map_config.get('default_lat_lang'),
      zoom: 17,
      layers: [base_layers['Google Satellite'], overlay_layers['Plane'],overlay_layers['Plane Trail']] //the default layers of the map
    });

    //allow the user to turn on and off specific layers
    leaflet.control.layers(base_layers, overlay_layers).addTo(map);
    leaflet.control.mousePosition().addTo(map); //displays lat and lon coordinates at bottom left of the map
    map.addControl(centerToPlaneButton);

    mapPath.addTo(map);
    MapMeasure(leaflet).addTo(map);
    waypointLine.addTo(map);
    new MapDraw(leaflet).addTo(map); //adds draw controls to map
  };

  this.movePlane=function(lat,lng, heading){
    overlay_layers['Plane'].setLatLng([lat,lng]);
    overlay_layers['Plane'].angle = heading;
    overlay_layers['Plane'].update();
  };

  this.expandPlaneTrail=function(lat,lng){
    overlay_layers['Plane Trail'].addLatLng([lat,lng]);
  };

  this.clearPlaneTrail=function(){
    overlay_layers['Plane Trail'].setLatLngs([]);
  };

  this.resize=function(){
    map.invalidateSize(true);
  };

  this.addWaypointMode=function(status){
    if(!status){ //if in add waypoint already, turn it off
      this.state=map_states.MOVE;
      map.off('click', this.eventListeners.add_waypoint_click); //get rid of the event listener
    }
    else{
      this.state=map_states.ADD_WAYPOINT;
      map.on('click', this.eventListeners.add_waypoint_click);
    }
  };

  

};

module.exports=Map;