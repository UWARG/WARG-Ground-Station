var EventEmitter = require('events');
var util = require('util');

var map_config=require('../../config/map-config');
var Coordinates=require('../models/Coordinates');
var Waypoint=require('../models/Waypoint');
var Logger=require('../util/Logger');
var Commands=require('../models/Commands');

var PathManager=function(){
	this.plane_trail_coordinates=[];
	this.waypoints=[];
	this.current_waypoint=0; //the waypoint the plane is currently heading to
	this.current_path_checksum=0; //current path checksum

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
			this.waypoints.push(new Waypoint(coordinates,map_config.get('default_waypoint_radius'),Waypoint.SYNC_STATUS.APPEND));
			this.emit('append_waypoint', coordinates);
		}
		else{
			console.error('Invalid parameter in PathManager.appendWaypoint: '+coordinates);
		}
	};

	this.removeWaypoint=function(index){
		if(this.waypoints[index]){
			//if its an unsynced waypoint (so one that was recentely appended or inserted), delete it straight up
			if(this.waypoints[index].sync_status===Waypoint.SYNC_STATUS.APPEND || this.waypoints[index].sync_status===Waypoint.SYNC_STATUS.INSERT){
				this.waypoints.splice(index, 1);
				this.emit('remove_waypoint',index);
			}
			else{
				this.changeWaypointSyncStatus(this.waypoints[index],Waypoint.SYNC_STATUS.DELETE);
				this.emit('set_deleted_waypoint',index);
			}
		}
		else{
			console.error('PathManager.removeWaypoint was passed in an index that does not exist. Index: '+index);
		}
	};

	this.insertWaypoint=function(index,coordinates){
		var coords=Coordinates(coordinates);
		if(this.waypoints[index] && coords){
			var sync_status=Waypoint.SYNC_STATUS.INSERT;
			//if the previous waypoint was appended, then append this one as well
			if(this.waypoints[index-1] && this.waypoints[index-1].sync_status===Waypoint.SYNC_STATUS.APPEND){
				sync_status=Waypoint.SYNC_STATUS.APPEND;
			}
			this.waypoints.splice(index, 0, new Waypoint(coords,map_config.get('default_waypoint_radius'),sync_status));
			this.emit('insert_waypoint',index, coordinates);
		}
		else{
			console.error('PathManager insertWaypoint was passed in either a waypoint index that does not exist or invalid coordinates. Coords: '+ coordinates);
		}
	};

	this.updateWaypoint=function(index, coordinates){
		var coords=Coordinates(coordinates);
		if(this.waypoints[index] && coords){
			coords.lat ? this.waypoints[index].lat= coords.lat : null;
			coords.lng ? this.waypoints[index].lng= coords.lng : null;
			coords.alt ? this.waypoints[index].alt= coords.alt : null;
			this.changeWaypointSyncStatus(this.waypoints[index],Waypoint.SYNC_STATUS.UPDATE);
			this.emit('update_waypoint',index, this.waypoints[index].getCoordinates());
		}
		else{
			console.error('PathManager.updateWaypoint called on a waypoint index that does not exist or passed in invalid coordinates.Coords: '+coordinates);
		}
	};

	this.updateWaypointRadius=function(index, radius){
		if(this.waypoints[index] && radius){
			this.changeWaypointSyncStatus(this.waypoints[index],Waypoint.SYNC_STATUS.UPDATE);
			this.waypoints[index].radius=radius;
		}
		else{
			console.error('PathManager.updateWaypointRadius called on a waypoint index that does not exist or passed in invalid coordinates.Radius: '+radius);
		}
	};

	this.updateWaypointAltitude=function(index, alt){
		if(this.waypoints[index] && alt){
			this.waypoints[index].alt=alt;
			this.changeWaypointSyncStatus(this.waypoints[index],Waypoint.SYNC_STATUS.UPDATE);
			this.emit('update_waypoint',index, Coordinates(this.waypoints[index]));
		}
		else{
			console.error('PathManager.updateWaypointAltitude called on a waypoint index that does not exist or passed in invalid coordinates.Alt: '+alt);
		}
	};

	this.changeWaypointSyncStatus=function(waypoint,new_status){
		//only set it as update if it was synced with the remote before
		if(new_status===Waypoint.SYNC_STATUS.UPDATE){
			if(waypoint.sync_status===Waypoint.SYNC_STATUS.NOTHING){
				waypoint.sync_status=new_status;
			}
		}
		else{
			waypoint.sync_status=new_status;
		}
	};

	this.debugPrint=function(){
		for(var i=0;i<this.waypoints.length;i++){
			var string='Waypoint #'+i+'\n';
			string+='Altitude: '+this.waypoints[i].alt+'\n';
			string+='Radius: '+this.waypoints[i].radius+'\n';
			string+='Sync Status: '+this.waypoints[i].sync_status+'\n\n';
			console.log(string);
		}
	};

	this.calculatePathChecksum=function(){
		var checksum=0;
		for(var i=0;i<this.waypoints.length;i++){
			checksum+=this.waypoints[i].lat;
			checksum+=this.waypoints[i].lng;
			checksum+=this.waypoints[i].alt;
		}
		this.current_path_checksum=checksum;
		return checksum;
	}

	this.sendPath=function(){
		Logger.info('[Path Manager] Clearing all waypoints');
		Commands.clearWaypoints();
		var total_waypoints=this.waypoints.length;
		for(var i=0;i<this.waypoints.length;i++){
			Logger.info('[Path Manager] Sending waypoint '+(i+1) + '/'+total_waypoints);
			Commands.appendWaypoint(this.waypoints[i],this.waypoints[i].radius);
			this.waypoints[i].sync_status=Waypoint.SYNC_STATUS.NOTHING;
		}
		this.calculatePathChecksum();
		this.emit('synced');
	};
};

util.inherits(PathManager,EventEmitter);

module.exports=new PathManager();