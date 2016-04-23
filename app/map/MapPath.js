var MapPath=function(leaflet){
  var map=null;
  var leaflet=leaflet;

  this.set_waypoints=[];
  this.local_waypoints=[];

  //the path the picpilot is currently executing
  var setPath=leaflet.Polyline.Plotter(this.set_waypoints,{
      weight: 5,
      readOnly: true
  });

  //ie the path the user is currently creating and hasnt set to the picpilot yet
  var localPath=leaflet.Polyline.Plotter(this.local_waypoints,{
      weight: 5,
      readOnly: false
  });

  this.addTo=function(m){
    map=m;
    setPath.addTo(map);
    localPath.addTo(map);
  };

  this.sendWaypoints=function(){

  };

  this.clearAllWaypoints=function(){

  };
  this.addWaypoint=function(lat,lon,lat){

  };
};

module.exports=MapPath;