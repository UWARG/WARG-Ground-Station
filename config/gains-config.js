var SettingsLoader=require('../app/util/SettingsLoader');

var gains_config={
  yaw_kp: 32,
  yaw_kd: 34,
  yaw_ki: 34,
  pitch_kp: 32,
  pitch_kd: 34,
  pitch_ki: 34,
  roll_kp: 32,
  roll_kd: 34,
  roll_ki: 34,
  heading_kp: 32,
  heading_kd: 34,
  heading_ki: 34,
  altitude_kp: 32,
  altitude_kd: 34,
  altitude_ki: 34,
  throttle_kp: 32,
  throttle_kd: 34,
  throttle_ki: 34,
  flap_kp: 32,
  flap_kd: 34,
  flap_ki: 34
};

module.exports=new SettingsLoader('gains_config',gains_config);