var SettingsLoader=require('../app/util/PersistentSettings');

var vehicle_config = {
  fixed_wings: {
    throttle: "ch1_in",
    roll: "ch2_in",
    pitch: "ch3_in",
    rudder_yaw: "ch4_in",
    autopilot_ON_OFF: "ch5_in",
  },
}

module.exports=new SettingsLoader('vehicle_config',vehicle_config);