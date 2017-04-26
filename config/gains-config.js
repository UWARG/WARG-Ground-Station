var SettingsLoader=require('../app/util/PersistentSettings');

//NOTE: all of these MUST be numbers
var gains_config={
  roll_rate_kp: 1,
  pitch_rate_kp: 1,
  yaw_rate_kp: 1,
  roll_angle_kp: 1,
  pitch_angle_kp: 1,
  heading_kp: 1,
  altitude_kp: 1,
  ground_speed_kp: 1,
  orbit_kp: 1,
  path_kp: 1,
  
  roll_rate_kd: 0,
  pitch_rate_kd: 0,
  yaw_rate_kd: 0,
  roll_angle_kd: 0,
  pitch_angle_kd: 0,
  heading_kd: 0,
  altitude_kd: 0,
  ground_speed_kd: 0,

  roll_rate_ki: 0,
  pitch_rate_ki: 0,
  yaw_rate_ki: 0,
  roll_angle_ki: 0,
  pitch_angle_ki: 0,
  heading_ki: 0,
  altitude_ki: 0,
  ground_speed_ki: 0,
};

module.exports=new SettingsLoader('gains_config',gains_config);