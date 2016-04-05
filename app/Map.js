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
  DELETE_WAYPOINT: 3,
  INSERT_WAYPOINT: 4
});

var Map=function(L){
  var leaflet=L;//reference to the window leaflet object
  var map=null;

  var pathLayer=L.layerGroup();
  var waypointsLayer=L.featureGroup();
  var waypointsConnectionsLayer=L.featureGroup();

  var unsyncedWaypointLine = leaflet.multiPolyline([[[0,0]]], {color: 'red'});
  var syncedWaypointLine = leaflet.multiPolyline([[[0,0]]], {color: 'blue'});

  waypointsConnectionsLayer.addLayer(unsyncedWaypointLine);
  waypointsConnectionsLayer.addLayer(syncedWaypointLine);
  pathLayer.addLayer(waypointsConnectionsLayer);
  pathLayer.addLayer(waypointsLayer);

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
      waypointsLayer.addLayer(waypoint);
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
    },

    remove_waypoint_click: function(e){
      var waypoint=e.layer;
      PathManager.removeWaypoint(waypoint.waypointCount);
      waypoint.setDeleted(true);
      unsyncedWaypointLine.setLatLngs(PathManager.getMultiPolylineCoords().unsynced_polylines);
      syncedWaypointLine.setLatLngs(PathManager.getMultiPolylineCoords().synced_polylines);
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
          console.log('Found it! '+insert_index);
          break;
        }
      }

      if(found_waypoint){
        insert_index++; //this will be the index or number of the new waypoint
        PathManager.insertWaypoint(insert_index,coords); 
        PathManager.current_waypoint++; 
        var waypoint=new leaflet.waypoint(coords,{
          waypointCount: insert_index
        });
        waypoint.addTo(map);
        waypoint.on('drag',events.drag_waypoint.bind(waypoint));
        waypoint.bindPopup('Altitude: <input type="number"><br>Radius: <input type="number"><br><button onclick="alert(\"hello!\")" >Send</button>');
        console.log(waypointsLayer);
        unsyncedWaypointLine.setLatLngs(PathManager.getMultiPolylineCoords().unsynced_polylines);
        syncedWaypointLine.setLatLngs(PathManager.getMultiPolylineCoords().synced_polylines);
        //todo: update the waypoint counter on the rest of them
        // for(insert_index++;insert_index<PathManager.waypoints.length;insert_index++){
        //   PathManager.waypoints[insert_index].changeWaypointCount(insert_index);
        // }
      }
      else{
        console.error('Something went wrong with the waypoint insert! Could not find index location of where to insert!');
      }
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

    //allow the user to turn on and off specific layers
    leaflet.control.layers(base_layers, overlay_layers).addTo(map);
    leaflet.control.mousePosition().addTo(map); //displays lat and lon coordinates at bottom left of the map
    map.addControl(centerToPlaneButton);

    mapPath.addTo(map);
    MapMeasure(leaflet).addTo(map);
    //unsyncedWaypointLine.addTo(map);
    //syncedWaypointLine.addTo(map);
    //waypointsLayer.addTo(map);
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
      this.state=map_states.ADD_WAYPOINT;
      map.on('click', this.events.add_waypoint_click);
      waypointsConnectionsLayer.on('click',this.events.insert_waypoint_click);
    }
    else{
      this.state=map_states.MOVE;
      map.off('click', this.events.add_waypoint_click); //get rid of the event listener
      waypointsConnectionsLayer.off('click',this.events.insert_waypoint_click); 
    }
  };

  this.deleteWaypointMode=function(status){
    console.log(status);
    if(status){ //if in add waypoint already, turn it off
      this.state=map_states.DELETE_WAYPOINT;
      waypointsLayer.on('click', this.events.remove_waypoint_click); 
    }
    else{
      this.state=map_states.MOVE;
      waypointsLayer.off('click', this.events.remove_waypoint_click);
    }
  };

  this.addWaypoint=function(waypoint){
    this.waypoints= this.waypoints || [];
    this.waypoints.push(waypoint);
  }

};

module.exports=Map;