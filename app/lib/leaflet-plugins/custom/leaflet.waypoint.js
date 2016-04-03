//created by Serj Babayan for the Waterloo Aerial Robotics Group on March 19, 2016
//This file contains the waypoint class used within the MapView

var waypointIcon = L.divIcon({className: 'waypointIcon',html:'<div class="inner-circle"><p>#1</p><p>100m</p></div>'});

L.waypoint= L.Marker.extend({
	initialize: function (latlngalt, options) { //latlngalt is an array of size 3 in this manner: [lat, lon, alt]
      options=options || {};
      options.icon=waypointIcon; //give it the proper icon
      options.draggable=true;
      L.Marker.prototype.initialize.call(this, latlngalt, options); //i dont think this is necessary
    	// if (!(L.Util.isArray(latlngalt) && latlngalt.length === 3)) {
    	// 	throw new Error("L.AltitudeMarker must be initialized with an array latitude, longitude, and altitude [lat,lon,alt]");
    	// }

     //  else if (isNaN(latlngalt[0]) || isNaN(latlngalt[1]) || isNaN(latlngalt[2]) || Number(latlngalt[2])<=0){
     //     throw new Error("L.AltitudeMarker must be initialized with a valid longitude, latitude, and altitude values and have a positive altitude value"); 
     //  }
     //  else{
        
     //  }
    }
});