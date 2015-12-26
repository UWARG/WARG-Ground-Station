var advanced_config={
  logger_max_listeners:20, //maximum number of listeners that can attach to the Logger object (should increase if you plan on having lots of consoles open)
  connection_max_listeners:40 //maximum number of listeners that can attach to the Connection object (should increase if lots of things need telemetry data and what not)
};

module.exports=advanced_config;