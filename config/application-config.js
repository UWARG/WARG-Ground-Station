var SettingsLoader=require('../app/util/SettingsLoader');

var app_config={
	mode: process.env.NODE_ENV || "development",
	log_dir:"logs/" //relative to the project root
};

module.exports=new SettingsLoader('app_config',app_config);