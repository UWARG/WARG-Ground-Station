var map_config=require('../../config/map-config');
var Coordinates=require('../models/Coordinates');
var Waypoint=require('../models/Waypoint');

var PathManager={
	plane_trail_coordinates: [],
	waypoints: [],
	current_waypoint: 0, //the waypoint the plane is currently heading to

	//formats the waypoints in two arrays of polylines (this is for drawing the polyline between waypoints)
	getMultiPolylineCoords: function(){
		var synced_polylines=[]; 
		var unsynced_polylines=[];

		var currently_synced=false;
		var next_synced=false;
		for(var i=0;i<this.waypoints.length-1;i++){
			currently_synced=this.waypoints[i].sync_status===Waypoint.SYNC_STATUS.NOTHING;
			next_synced=this.waypoints[i+1].sync_status===Waypoint.SYNC_STATUS.NOTHING;

			if(currently_synced && next_synced){
				synced_polylines.push([this.waypoints[i],this.waypoints[i+1]]);
			}
			else{
				unsynced_polylines.push([this.waypoints[i],this.waypoints[i+1]]);
			}
		}
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
			this.waypoints.push(new Waypoint({
				lat: coordinates.lat, 
				lng: coordinates.lng, 
				alt: coordinates.alt}, 
				map_config.get('default_waypoint_radius'),
				Waypoint.SYNC_STATUS.NOTHING)
			);
		}
		else{
			console.error('Invalid parameter in PathManager.appendWaypoint: '+coordinates);
		}
	},

	removeWaypoint: function(index){
		this.waypoints[index].sync_status=Waypoint.SYNC_STATUS.DELETE;
	},

	insertWaypoint: function(){

	},

	moveWaypoint: function(){

	},
	sendWaypoint: function(){
		
	}
};

module.exports=PathManager;