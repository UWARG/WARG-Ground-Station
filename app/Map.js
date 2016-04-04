//a wrapper around leaflet that configures it as well
var map_config=require('../config/map-config');
var path=require('path');
var MapDraw=require('./map/MapDraw');
var MapMeasure=require('./map/MapMeasure');
var MapPath=require('./map/MapPath');
var PathManager=require("./map/PathManager");
var Waypoint=require('./models/Waypoint');

var map_states=Object.freeze({ //freeze keeps anything else from changing these values
  MOVE: 1,
  ADD_WAYPOINT:2,
  DELETE_WAYPOINT: 3
});

var Map=function(L){
  var leaflet=L;//reference to the window leaflet object
  var map=null;
  var unsyncedWaypointLine = leaflet.multiPolyline([[[0,0]]], {color: 'red'});
  var syncedWaypointLine = leaflet.multiPolyline([[[0,0]]], {color: 'blue'});

  this.state=map_states.MOVE;

  this.events={
    add_waypoint_click: function(e){
      var coords=e.latlng;
      coords.alt=map_config.get('default_waypoint_altitude'); //set the default altitude
      PathManager.appendWaypoint(coords);
      unsyncedWaypointLine.setLatLngs(PathManager.getMultiPolylineCoords().unsynced_polylines);
      syncedWaypointLine.setLatLngs(PathManager.getMultiPolylineCoords().synced_polylines);
      var waypoint=new leaflet.waypoint(coords,{
        waypointCount: PathManager.current_waypoint
      });
      PathManager.current_waypoint++;
      waypoint.addTo(map);
      waypoint.on('drag',events.drag_waypoint.bind(waypoint));
      waypoint.bindPopup('Altitude: <input type="number"><br>Radius: <input type="number"><br><button onclick="alert(\"hello!\")" >Send</button>');
    },
    drag_waypoint: function(){
      PathManager.waypoints[this.waypointCount].updateCoordinates(this._latlng);
      PathManager.waypoints[this.waypointCount].sync_status=Waypoint.SYNC_STATUS.UPDATE;
      unsyncedWaypointLine.setLatLngs(PathManager.getMultiPolylineCoords().unsynced_polylines);
      syncedWaypointLine.setLatLngs(PathManager.getMultiPolylineCoords().synced_polylines);
    }
  };
var events=this.events;
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
    unsyncedWaypointLine.addTo(map);
    syncedWaypointLine.addTo(map);

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
      map.off('click', this.events.add_waypoint_click); //get rid of the event listener
    }
    else{
      this.state=map_states.ADD_WAYPOINT;
      map.on('click', this.events.add_waypoint_click);
    }
  };

  

};

module.exports=Map;