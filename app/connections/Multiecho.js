//This file configures the datarelay connection and parses its data
var network_config=require('../../config/network-config');
var Network=require('../Network');
var Logger=require('../util/Logger');
var TelemetryData=require('../models/TelemetryData');

module.exports=function(){
  if(Network.connections['multi_echo']){ //if a connection has already been established (occurs on a page refresh), destroy it
    Network.connections['multi_echo'].disconnect();
  }

  var multi_echo=Network.addConnection('multi_echo',network_config.multiecho_host,network_config.multiecho_port);

  multi_echo.socket.setTimeout(network_config.multiecho_timeout);

  //TODO: Implement the new multiecho protocol here
  multi_echo.on('data',function(data){
    data = data.toString().trim();
      //NOTE: this is legacy code!
      // console.log(data);
      // data = data.replace(/TA:/g, '\nTA:');
      // data = data.split('\n');

      // for (var i = 0; i < data.length; ++i) {
      //   var parts = data[i].split(':');
      //   if (parts[0] != "TA") continue;

      //   var arr = parts[1].split(',').map(function (str) {
      //       return str.trim();
      //   });

      //   var comp = Data.compIDs.indexOf(arr[3]);
      //   if (comp == -1) {
      //       comp = Data.compIDs.push(arr[3]) - 1;
      //   }

      //   var target = {
      //       lat: arr[0],
      //       lon: arr[1],
      //       type: arr[2],
      //       comp: comp,
      //   };
      //   Data.targets.push(target);

      //   Log.debug("Network (multiEcho) Parsed: " + JSON.stringify(target));

      //   multiEcho.emitter.emit('data', target);
  });
};
