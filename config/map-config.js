//Map settings and configuration
var SettingsLoader=require('../app/util/SettingsLoader');

var map_config={
  default_lat_lang:[43.53086, -80.5772], //[48.508809, -71.638846] Alma, Quebec Others: [49.906576, -98.274078] -Southport, Manitoba and [43.53086, -80.5772];   // Waterloo North field
  send_home_coords: [43.53086, -80.5772], 
  default_waypoint_altitude: 100, //in m
  default_waypoint_radius: 5 //in m
};

module.exports=new SettingsLoader('map_config',map_config);