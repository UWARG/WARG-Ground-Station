var SettingsLoader=require('../app/util/SettingsLoader');

var network_config={
	datarelay_host:'127.0.0.1',
	datarelay_port:'1234',
  datarelay_timeout:'5000', //in milliseconds, the amount of time a socket will wait idle before declaring itself as timed out and closing the connection
	multiecho_host:'127.0.0.1',
	multiecho_port:'4321',
  multiecho_timeout:'5000' //in milliseconds, the amount of time a socket will wait idle before declaring itself as timed out and closing the connection
};

module.exports=new SettingsLoader('network_config',network_config);