var Coordinates=require('./Coordinates');

//Waypoint class used in the PathManager
var Waypoint=function(coordinates, radius, action){
	var coords=Coordinates(coordinates);
	if(!coords){
		throw new Error('Waypoint in pathmanager must be inialized with a latitude, longitude, altitude, and radius');
	}
	this.lat=coords.lat;
	this.lng=coords.lng;
	this.alt=coords.alt;
	this.orbit_radius=radius;
	this.action=action || ACTIONS.APPEND; //what to do with the waypoint during the next sync

	this.updateCoordinates=function(coordinates){
		var coords=Coordinates(coordinates);
		if(coords){
			if(coords.lat){
			this.lat=coords.lat;
			}
			if(coords.lng){
				this.lng=coords.lng;
			}
			if(coords.alt){
				this.alt=coords.alt;
			}
		}
		else{
			console.error('Invalid argument passed into Waypoint.updateCoordinates function. '+coordinates);
		}
	}
};

module.exports=Waypoint;