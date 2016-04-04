var map_config=require('../../config/map-config');

var ACTIONS={
	APPEND: 1,
	DELETE: 2,
	INSERT: 3, 
	NOTHING: 4, 
	UPDATE: 5
}
var Waypoint=function(lat,lng,alt,radius, action){
	if(!lat || !lng || !alt || !radius){
		throw new Error('Waypoint in pathmanager must be inialized with a latitude, longitude, altitude, and radius');
	}
	this.lat=lat;
	this.lng=lng;
	this.alt=alt;
	this.orbit_radius=radius;
	this.action=action || ACTIONS.APPEND; //what to do with the waypoint during the next sync
};

var PathManager={
	plane_trail_coordinates: [],
	local_waypoints: [],
	remove_waypoints: [],
	current_waypoint: 0, //the waypoint the plane is currently heading to

	clearTrail: function(){
		this.plane_trail_coordinates=[];
	},

	appendWaypoint: function(coordinates){
		this.local_waypoints.push(new Waypoint(coordinates.lat, coordinates.lng, coordinates.alt, map_config.get('default_waypoint_radius'),ACTIONS.APPEND));
	},

	removeWaypoint: function(){

	},

	insertWaypoint: function(){

	},

	moveWaypoint: function(){

	},
	sendWaypoint: function(){
		
	}
};

module.exports=PathManager;