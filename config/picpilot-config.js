var PersistentSettings=require('../app/util/PersistentSettings');

//Picpilot specific options and settings
var picpilot_config={
  command_password:"1234",
  heartbeat_timeout:5000, //how often to send the heartbeat in milliseconds
  internal_battery_cell_count: 3,
  motor_battery_cell_count: 4
};

module.exports=new PersistentSettings('picpilot_config',picpilot_config);