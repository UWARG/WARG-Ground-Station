//Waypoint class used in the PathManager
var Coordinates=require('./Coordinates');

var Waypoint=function(coordinates, radius, sync_status){
	var coords=Coordinates(coordinates);
	if(!coords || !radius){
		throw new Error('Waypoint in pathmanager must be inialized with a latitude, longitude, altitude, and radius');
	}
	this.lat=coords.lat;
	this.lng=coords.lng;
	this.alt=coords.alt;
	this.orbit_radius=radius;
	this.sync_status=sync_status || this.SYNC_STATUS.APPEND; //what to do with the waypoint during the next remote sync

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

//when a sync happens with the picpilot, this is the status of the waypoint and what needs to be done to it (ie upload, dont upload, etc)
Waypoint.SYNC_STATUS=Object.freeze({
	APPEND: 1,
	DELETE: 2,
	INSERT: 3, 
	NOTHING: 4, //meaning the waypont is synced with the remote 
	UPDATE: 5
});

module.exports=Waypoint;