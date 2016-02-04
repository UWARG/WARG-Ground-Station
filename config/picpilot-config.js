var SettingsLoader=require('../app/util/SettingsLoader');

//Picpilot specific options and settings
var picpilot_config={
  command_password:"1234"
};

module.exports=new SettingsLoader('picpilot_config',picpilot_config);