var map_config=require('../../config/map-config');
var Coordinates=require('../models/Coordinates');
var Waypoint=require('../models/Waypoint');

var ACTIONS={
	APPEND: 1,
	DELETE: 2,
	INSERT: 3, 
	NOTHING: 4, //meaning the waypont is synced with the remote 
	UPDATE: 5
}

var PathManager={
	plane_trail_coordinates: [],
	local_waypoints: [],
	remove_waypoints: [],
	current_waypoint: 0, //the waypoint the plane is currently heading to

	//formats the local_waypoints in an array of arrays (this is for drawing the polyline between waypoints)
	getMultiPolylineCoords: function(){
		var synced_polylines=[];
		var unsynced_polylines=[];

		var currently_synced=false;
		var next_synced=false;
		for(var i=0;i<this.local_waypoints.length-1;i++){
			currently_synced=this.local_waypoints[i].action===ACTIONS.NOTHING;
			next_synced=this.local_waypoints[i+1].action===ACTIONS.NOTHING;

			if(currently_synced && next_synced){
				synced_polylines.push([this.local_waypoints[i],this.local_waypoints[i+1]]);
			}
			else{
				unsynced_polylines.push([this.local_waypoints[i],this.local_waypoints[i+1]]);
			}
		}
		console.log(synced_polylines);
		console.log(unsynced_polylines);
		return {
			synced_polylines: synced_polylines,
			unsynced_polylines: unsynced_polylines
		}
		
	},

	clearTrail: function(){
		this.plane_trail_coordinates=[];
	},

	appendWaypoint: function(coordinates){
		var coords=Coordinates(coordinates);
		if(coords){
			this.local_waypoints.push(new Waypoint(coordinates.lat, coordinates.lng, coordinates.alt, map_config.get('default_waypoint_radius'),ACTIONS.NOTHING));
		}
		else{
			console.error('Invalid parameter in PathManager.appendWaypoit: '+coordinates);
		}
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