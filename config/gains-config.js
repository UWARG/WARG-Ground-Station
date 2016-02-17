var SettingsLoader=require('../app/util/SettingsLoader');

//NOTE: all of these MUST be numbers
var gains_config={
  yaw_kp: 1,
  yaw_kd: 2,
  yaw_ki: 3,
  pitch_kp: 4,
  pitch_kd: 5,
  pitch_ki: 6,
  roll_kp: 7,
  roll_kd: 8,
  roll_ki: 9,
  heading_kp: 10,
  heading_kd: 11,
  heading_ki: 12,
  altitude_kp: 13,
  altitude_kd: 14,
  altitude_ki: 15,
  throttle_kp: 16,
  throttle_kd: 17,
  throttle_ki: 18,
  flap_kp: 19,
  flap_kd: 20,
  flap_ki: 21,
  orbit_kp: 22,
  path_kp: 23
};

module.exports=new SettingsLoader('gains_config',gains_config);