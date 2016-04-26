//a wrapper around leaflet that configures the map
var MapDraw=require('./map/MapDraw');
var MapMeasure=require('./map/MapMeasure');
var PathManager=require("./map/PathManager");
var Waypoint=require('./models/Waypoint');
var Template=require('./util/Template');
var Coordinates=require('./models/Coordinates');
var map_config=require('../config/map-config');
var path=require('path');

var MAP_STATE=Object.freeze({
  MOVE: 1,
  ADD_WAYPOINT:2,
  DELETE_WAYPOINT: 3,
  INSERT_WAYPOINT: 4
});

var Map=function(L){
  var leaflet=L;//reference to the window leaflet object
  var map=null; //reference to the window context map
  var current_state=MAP_STATE.MOVE; //current map state

  var waypoints=[]; //contains all the leaflet waypoint objects
  var current_changing_waypoint=null;

  //Set up of all the layers
  var waypointsLayer=L.featureGroup();
  var waypointsConnectionsLayer=L.featureGroup();
  var pathLayer=L.layerGroup();
  
  var unsyncedWaypointLine = leaflet.multiPolyline([[[0,0]]], {color: 'red'});
  var syncedWaypointLine = leaflet.multiPolyline([[[0,0]]], {color: 'blue'});

  waypointsConnectionsLayer.addLayer(unsyncedWaypointLine);
  waypointsConnectionsLayer.addLayer(syncedWaypointLine);
  pathLayer.addLayer(waypointsConnectionsLayer);
  pathLayer.addLayer(waypointsLayer);

  current_state=MAP_STATE.MOVE; //default state of the map

  PathManager.on('update_trail', function(){

  });

  PathManager.on('synced', function(){ //triggered when local path is synced with remote path
    this.updateWaypointConnectionLines();
  }.bind(this));

  PathManager.on('append_waypoint', function(coords){
    this.appendWaypoint(coords);
  }.bind(this));

  PathManager.on('set_deleted_waypoint', function(index){
    this.setDeletedWaypoint(index);
  }.bind(this));

   PathManager.on('remove_waypoint', function(index){
    this.removeWaypoint(index);
  }.bind(this));

  PathManager.on('insert_waypoint', function(index, coords){
    this.insertWaypoint(index, coords);
  }.bind(this));

  PathManager.on('update_waypoint', function(index, waypoint){
    this.updateWaypoint(index,waypoint);
  }.bind(this));

  this.updateWaypointConnectionLines=function(){
    var new_coords=PathManager.getMultiPolylineCoords();
    unsyncedWaypointLine.setLatLngs(new_coords.unsynced_polylines);
    syncedWaypointLine.setLatLngs(new_coords.synced_polylines);
  };

  this.appendWaypoint=function(coords){
    var waypoint=new leaflet.waypoint(coords,{
      waypointCount: PathManager.waypoints.length-1,
      radius: map_config.get('default_waypoint_radius')
    });
    waypointsLayer.addLayer(waypoint);
    waypoints.push(waypoint);
    waypoint.on('drag',events.drag_waypoint); //note: doing this on a drag event instaed of a dragend event may cause performance issues, however it makes it look better
    this.updateWaypointConnectionLines();
    waypoint.bindPopup(Template('WaypointPopup')());
  };

  this.updateWaypoint=function(index, waypoint){
    waypoints[index].setLatLng(Coordinates(waypoint));
    waypoints[index].changeAltitude(waypoint.alt);
    waypoints[index].changeRadius(waypoint.radius);
    waypoints[index].setProbeDrop(waypoint.type==='probe_drop');
    this.updateWaypointConnectionLines();
  };

  this.setDeletedWaypoint=function(index){
    waypoints[index].setDeleted(true);
    this.updateWaypointConnectionLines();
  };

  this.removeWaypoint=function(index){
    map.removeLayer(waypoints[index]);
    waypoints.splice(index, 1);
    for(var i=index;i<waypoints.length;i++){
      waypoints[i].changeWaypointCount(i);
    }
    this.updateWaypointConnectionLines();
  };

  this.insertWaypoint=function(index, coords){
    var waypoint=new leaflet.waypoint(coords,{
      waypointCount: index,
      radius: map_config.get('default_waypoint_radius')
    });
    waypointsLayer.addLayer(waypoint);
    waypoints.splice(index, 0, waypoint);
    waypoint.on('drag',events.drag_waypoint); //note: doing this on a drag event instaed of a dragend event may cause performance issues, however it makes it look better
    waypoint.bindPopup(Template('WaypointPopup')());
    this.updateWaypointConnectionLines();
    for(var i=index+1;i<waypoints.length;i++){
      waypoints[i].changeWaypointCount(i);
    }
  };

  this.events={
    add_waypoint_click: function(e){
      var coords=e.latlng;
      coords.alt=map_config.get('default_waypoint_altitude'); //set the default altitude
      PathManager.appendWaypoint(coords);
    },

    drag_waypoint: function(e){
      PathManager.updateWaypoint(e.target.waypointCount,e.target._latlng);
    },

    remove_waypoint_click: function(e){
      e.layer._popup._close(); //close the popup
      var waypoint=e.layer;
      PathManager.removeWaypoint(waypoint.waypointCount);
    },

    insert_waypoint_click: function(e){
      var coords=e.latlng;
      coords.alt=map_config.get('default_waypoint_altitude'); //set the default altitude
      
      var insert_index=0;
      var found_waypoint=false;
      //find the index of where to insert the new waypoint
      for(insert_index=0;insert_index<PathManager.waypoints.length;insert_index++){
        if(PathManager.waypoints[insert_index].lat===e.layer._latlngs[0].lat && PathManager.waypoints[insert_index].lng===e.layer._latlngs[0].lng){
          found_waypoint=true;
          break;
        }
      }
      if(found_waypoint){
        insert_index++; //this will be the index or number of the new waypoint
        PathManager.insertWaypoint(insert_index,coords); 
      }
      else{
        console.error('Something went wrong with the waypoint insert! Could not find index location of where to insert!');
      }
    },
    popupOpen: function(e){
      current_changing_waypoint=e.popup._source.waypointCount; //this is the waypoint we change on a form submission
    },
    popUpClosed: function(e){
      current_changing_waypoint=null;
    }
  };

var events=this.events;

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

  overlay_layers['Path']=pathLayer;

  var centerToPlaneButton=L.easyButton( 'icon ion-pinpoint', function(){
    if (overlay_layers['Plane']) {
      map.panTo(overlay_layers['Plane'].getLatLng());
    }
  });
  
  this.createMap=function(id){
    map = leaflet.map(id,{
      center: map_config.get('default_lat_lang'),
      zoom: 17,
      layers: [base_layers['Google Satellite'], overlay_layers['Plane'],overlay_layers['Plane Trail'],overlay_layers['Path']] //the default layers of the map
    });

    map.on('popupopen', this.events.popupOpen);
    map.on('popupclose', this.events.popUpClosed);

    //allow the user to turn on and off specific layers
    leaflet.control.layers(base_layers, overlay_layers).addTo(map);
    leaflet.control.mousePosition().addTo(map); //displays lat and lon coordinates at bottom left of the map
    map.addControl(centerToPlaneButton);

    MapMeasure(leaflet).addTo(map);
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
    if(status){ //if in add waypoint already, turn it off
      current_state=MAP_STATE.ADD_WAYPOINT;
      map.on('click', this.events.add_waypoint_click);
      waypointsConnectionsLayer.on('click',this.events.insert_waypoint_click);
    }
    else{
      current_state=MAP_STATE.MOVE;
      map.off('click', this.events.add_waypoint_click); //get rid of the event listener
      waypointsConnectionsLayer.off('click',this.events.insert_waypoint_click); 
    }
  };

  this.deleteWaypointMode=function(status){
    if(status){ //if in add waypoint already, turn it off
      current_state=MAP_STATE.DELETE_WAYPOINT;
      waypointsLayer.on('click', this.events.remove_waypoint_click); 
    }
    else{
      current_state=MAP_STATE.MOVE;
      waypointsLayer.off('click', this.events.remove_waypoint_click);
    }
  };

  this.addWaypoint=function(waypoint){
    this.waypoints= this.waypoints || [];
    this.waypoints.push(waypoint);
  };

  this.popupSubmitted=function(new_alt, new_radius,is_probe_drop){
    if(new_alt){
      PathManager.updateWaypointAltitude(current_changing_waypoint, new_alt);
    }
    if(new_radius){
      PathManager.updateWaypointRadius(current_changing_waypoint, new_radius);
    }
    PathManager.updateWaypointType(current_changing_waypoint, is_probe_drop);
    PathManager.debugPrint();
  };

};

module.exports=Map;