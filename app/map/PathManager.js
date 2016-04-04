
var PathManager={
	plane_trail_coordinates: [],
	local_waypoints: [],
	remove_waypoints: [],
	current_waypoint: 0, //the waypoint the plane is currently heading to

	clearTrail: function(){
		this.plane_trail_coordinates=[];
	},

	addWaypoint: function(coordinates){
		this.local_waypoints.push(coordinates);
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