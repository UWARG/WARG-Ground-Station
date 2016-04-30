var EventEmitter = require('events');
var util=require('util');
var map_config=require('../../config/map-config');

var SafetyMarkers=function(){
	this.safety_markers=[];

	this.addSafetyMarker=function(marker){
		this.safety_markers.push({
			type: marker.type,
			latlngs: marker.latlngs
		});
		this.emit('new_safety_marker',marker);
	};

	this.saveSafetyMarker=function(){
		map_config.set('safety_markers',this.safety_markers);
	};

	this.getSafetyMarkers=function(){
		var markers=map_config.get('safety_markers');
		this.emit('clear_safety_markers');
		for(var i=0;i<markers.length;i++){
			this.addSafetyMarker(markers[i]);
		}
	}
	EventEmitter.call(this);
};

util.inherits(SafetyMarkers,EventEmitter);

module.exports=new SafetyMarkers();