//This file configures the datarelay connection and parses its data
var network_config=require('../../config/network-config');
var Network=require('../Network');
var Logger=require('../util/Logger');
var TelemetryData=require('../models/TelemetryData');

module.exports=function(){
	var data_relay=Network.connections['data_relay'] || Network.addConnection('data_relay',network_config.multiecho_host,network_config.multiecho_port);

	data_relay.on('connect',function(){
		data_relay.write("commander\r\n");
	});

	data_relay.on('close',function(had_error){
		TelemetryData.headers=[];
	});

	data_relay.on('write',function(data){
		TelemetryData.sent.push({
			time: new Date(),
			data: data
		});
	});

	data_relay.on('data',function(data){
		data = data.toString();
		
		TelemetryData.received.push({
			time: new Date(),
			data: data
		});

	    // First transmission is header columns
	    if (TelemetryData.headers.length === 0) {
	        Logger.debug('Network '+data_relay.name+' Received headers: ' + data);
	        TelemetryData.headers = data.split(",").map(function (str) {
	            return str.trim();
	        });
	        Logger.debug('Network '+data_relay.name+' Parsed headers: ' + JSON.stringify(TelemetryData.headers));
        	Logger.data(TelemetryData.headers,'DATA_RELAY_HEADERS');       
	    }
	    else{ //if its the non-header columns(actual data)
	        var split_data = data.split(",");
	        for (var i = 0; i < split_data.length; i++) {
	            TelemetryData.current_state[TelemetryData.headers[i]] = split_data[i].trim().toString().replace('(', '').replace(')', '');
	        }
	        TelemetryData.state_history.push(TelemetryData.current_state);
	        TelemetryData.emit('data_received',TelemetryData.current_state);
	        Logger.data(JSON.stringify(TelemetryData.current_state),'DATA_RELAY_DATA');       
	    }
	});
};
