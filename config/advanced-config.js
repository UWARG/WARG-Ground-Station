var SettingsLoader=require('../app/util/PersistentSettings');

var advanced_config={
  logger_max_listeners:20, //maximum number of listeners that can attach to the Logger object (should increase if you plan on having lots of consoles open)
  connection_max_listeners:40, //maximum number of listeners that can attach to the Connection object (should increase if lots of things need telemetry data and what not)
  telemetrydata_max_listeners: 40,
  max_console_messages: 100,
  path_send_interval: 6000 //how often to send path waypoints/wait for confirmation
};

module.exports=new SettingsLoader('advanced_config',advanced_config);