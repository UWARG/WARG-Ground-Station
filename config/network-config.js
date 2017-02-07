var SettingsLoader=require('../app/util/PersistentSettings');

var network_config={
	//data relay
	datarelay_port:'1234',
	datarelay_legacy_mode:false,
  datarelay_tcp_timeout:5000, //in milliseconds, the amount of time a socket will wait idle before declaring itself as timed out and closing the connection
	datarelay_udp_timeout:1000, //in milliseconds, the amount of time the udp will wait for a response
	//multiecho
	multiecho_host:'127.0.0.1',
	multiecho_port:'4321',
  multiecho_timeout:5000, //in milliseconds, the amount of time a socket will wait idle before declaring itself as timed out and closing the connection
  //legacy data relay
  datarelay_legacy_host:'127.0.0.1',
  datarelay_legacy_port:'1234'

};

module.exports=new SettingsLoader('network_config',network_config);
