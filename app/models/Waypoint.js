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
	this.radius=radius;
	this.type=false; //can be false or 'probe_drop'
	this.sync_status=sync_status || this.SYNC_STATUS.APPEND; //what to do with the waypoint during the next remote sync

	this.getCoordinates=function(){
		return{
			lat: this.lat,
			lng: this.lng,
			alt: this.alt
		}
	};

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
	APPEND: 'append',
	DELETE: 'delete',
	INSERT: 'insert', 
	NOTHING: 'synced', //meaning the waypont is synced with the remote 
	UPDATE: 'update'
});

module.exports=Waypoint;