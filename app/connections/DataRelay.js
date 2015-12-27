//This file configures the datarelay connection and parses its data
var network_config=require('../../config/network-config');
var Network=require('../Network');
var Logger=require('../util/Logger');
var TelemetryData=require('../models/TelemetryData');
var StatusManager=require('../StatusManager');

module.exports=function(){
  if(Network.connections['data_relay']){ //if a connection has already been established (occurs on a page refresh), destroy it
    Network.connections['data_relay'].disconnect();
  }

	var data_relay=Network.addConnection('data_relay',network_config.datarelay_host,network_config.datarelay_port);

  data_relay.socket.setTimeout(network_config.datarelay_timeout);

	data_relay.on('connect',function(){
    StatusManager.addStatus('Connected to data_relay',1,0);
		data_relay.write("commander\r\n");
	});

	data_relay.on('close',function(had_error){
		TelemetryData.headers=[];
    StatusManager.addStatus('Disconnected from data_relay',1,0);
	});

  data_relay.on('timeout',function(){
    StatusManager.addStatus('No data received or sent on data_relay (timeout)',2,5000);
  });

	data_relay.on('write',function(data){
    StatusManager.addStatus('Sent command to data_relay',3,2000);
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
	        TelemetryData.headers = data.split(",").map(function (str) {
	            return str.trim();
	        });
          Logger.debug('Network '+data_relay.name+' Received headers: ' + data);
	        Logger.debug('Network '+data_relay.name+' Parsed headers: ' + JSON.stringify(TelemetryData.headers));
        	Logger.data(TelemetryData.headers,'DATA_RELAY_HEADERS');  
          StatusManager.removeStatus('Disconnected from data_relay',1,0); //NOTE: this is a hack to remove the disconnected message when doing a page refresh (there is a timing issue).
          StatusManager.addStatus('Received headers from data_relay',3,3000);  
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
