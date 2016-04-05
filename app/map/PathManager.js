var EventEmitter = require('events');
var util = require('util');

var map_config=require('../../config/map-config');
var Coordinates=require('../models/Coordinates');
var Waypoint=require('../models/Waypoint');

var PathManager=function(){
	this.plane_trail_coordinates=[];
	this.waypoints=[];
	this.current_waypoint=0; //the waypoint the plane is currently heading to

	//formats the waypoints in two arrays of polylines (this is for drawing the polyline between waypoints)
	this.getMultiPolylineCoords=function(){
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
	};

	this.addToTrail=function(coordinates){
		var coords=Coordinates(coordinates);
		if(coords){
			this.plane_trail_coordinates.push(coords);
			this.emit('update_trail', true);
		}
		else{
			console.error('PathManager.addToTrail was passed in incorrect coordinates. Coordinates: '+coordinates);
		}
	};

	this.clearTrail=function(){
		this.plane_trail_coordinates=[];
	};

	this.appendWaypoint=function(coordinates){
		var coords=Coordinates(coordinates);
		if(coords){
			this.waypoints.push(new Waypoint(coordinates,map_config.get('default_waypoint_radius'),Waypoint.SYNC_STATUS.NOTHING));
			this.emit('append_waypoint', coordinates);
		}
		else{
			console.error('Invalid parameter in PathManager.appendWaypoint: '+coordinates);
		}
	};

	this.removeWaypoint=function(index){
		if(this.waypoints[index]){
			this.waypoints[index].sync_status=Waypoint.SYNC_STATUS.DELETE;
			this.emit('set_deleted_waypoint',index);
		}
		else{
			console.error('PathManager.removeWaypoint was passed in an index that does not exist. Index: '+index);
		}
	};

	this.insertWaypoint=function(index,coordinates){
		var coords=Coordinates(coordinates);
		if(this.waypoints[index] && coords){
			this.waypoints.splice(index, 0, new Waypoint(coords,map_config.get('default_waypoint_radius'),Waypoint.SYNC_STATUS.INSERT));
			this.emit('insert_waypoint',index, coordinates);
		}
		else{
			console.error('PathManager insertWaypoint was passed in either a waypoint index that does not exist or invalid coordinates. Coords: '+ coordinates);
		}
	};

	this.updateWaypoint=function(index, coordinates){ //eg update its location
		var coords=Coordinates(coordinates);
		if(this.waypoints[index] && coords){
			coords.lat ? this.waypoints[index].lat= coords.lat : null;
			coords.lng ? this.waypoints[index].lng= coords.lng : null;
			coords.alt ? this.waypoints[index].alt= coords.alt : null;
			this.waypoints[index].sync_status=Waypoint.SYNC_STATUS.UPDATE;
			this.emit('update_waypoint',index, coordinates);
		}
		else{
			console.error('PathManager.updateWaypoint called on a waypoint index that does not exist or passed in invalid coordinates.Coords: '+coordinates);
		}
	};

	this.sendWaypoint=function(){
		
	};
};

util.inherits(PathManager,EventEmitter);

module.exports=new PathManager();