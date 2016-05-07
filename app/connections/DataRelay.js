//This file configures the datarelay connection and parses its data
var network_config=require('../../config/network-config');
var Network=require('../Network');
var Logger=require('../util/Logger');
var TelemetryData=require('../models/TelemetryData');
var StatusManager=require('../StatusManager');
var Commands=require('../models/Commands');
var map_config=require('../../config/map-config');

module.exports=function(){
  if(Network.connections['data_relay']){ //if a connection has already been established (occurs on a page refresh), destroy it
    Network.connections['data_relay'].disconnect();
  }

	var data_relay=Network.addConnection('data_relay',network_config.get('datarelay_host'),network_config.get('datarelay_port'));

  data_relay.socket.setTimeout(network_config.get('datarelay_timeout'));

	data_relay.on('connect',function(){
    	StatusManager.setStatusCode('CONNECTED_DATA_RELAY',true);

    	setTimeout(function(){
    		Commands.activateWriteMode();
    		Commands.sendHomeCoordinates(map_config.get('send_home_coords')[0], map_config.get('send_home_coords')[1], map_config.get('send_home_altitude'));
    	},500);//SERGE: GET RID OF THIS TIMEOUT SHIT ONCE YOU fiGURE THIS SHIT OUT
    	
	});

	data_relay.on('close',function(had_error){
		TelemetryData.headers=[];
    	StatusManager.setStatusCode('DISCONNECTED_DATA_RELAY',true);
	});

	  data_relay.on('timeout',function(){
	    StatusManager.setStatusCode('TIMEOUT_DATA_RELAY',true);
	  });

	data_relay.on('write',function(data){
    	StatusManager.addStatus('Sent command to data_relay',3,2000);
		TelemetryData.sent.push({
			time: new Date(),
			data: data
		});
	});

	data_relay.on('data',function(data){
		if(!data){ //dont do anything if we get blank data or anything thats not an object
			Logger.error('Got a blank packet from the data relay station. Value: '+data);
			return;
		}
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
          StatusManager.addStatus('Received headers from data_relay',3,3000);  
	    }
	    else{ //if its the non-header columns(actual data)
	        var split_data = data.split(",");
	        for (var i = 0; i < split_data.length; i++) {
	            TelemetryData.current_state[TelemetryData.headers[i]] = split_data[i].trim().toString().replace('(', '').replace(')', ''); //the replace is required because theres a chance of random brackets being in the values
	        }
	        TelemetryData.state_history.push(TelemetryData.current_state);
	        TelemetryData.emit('data_received',TelemetryData.current_state);
	        Logger.data(JSON.stringify(TelemetryData.current_state),'DATA_RELAY_DATA'); 
	        StatusManager.setStatusCode('TIMEOUT_DATA_RELAY',false);      
	    }
	});
};
