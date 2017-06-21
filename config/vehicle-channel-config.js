var SettingsLoader=require('../app/util/PersistentSettings');

var vehicle_channel_config = {
  fixed_wing: {
    throttle: "ch1_in",
    roll: "ch2_in",
    pitch: "ch3_in",
    rudder_yaw: "ch4_in",
    autopilot_on_off: "ch5_in",
  },
}

module.exports=new SettingsLoader('vehicle_channel_config',vehicle_channel_config);