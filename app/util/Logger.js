//A logger wrapper that handles logging to the groundstation, the console, and the filesystem
//There are 5 levels of logs: error, warn, info, and debug, and data
//error and warning level are saved to the error log, debug and info are saved to the debug log, and everything is stored in the "all" log
//data is stored in its own data file so as not to spam the other logs

var fs=require('fs');
var mkdirp = require('mkdirp');
var app_config=require('../../config/application-config');
var util = require('util');
var EventEmitter = require('events');
var advanced_config=require('../../config/advanced-config');

var date=new Date();
var string_date=date.toDateString() + ' ' + date.toLocaleTimeString(); //output format is like: "Thu Dec 24 2015 2:33:20 AM"

//create the logs directory if it doesnt yet exist
mkdirp.sync(app_config.get('log_dir'));

var all_log = fs.createWriteStream(app_config.get('log_dir')+"GCS-" + string_date.replace(/\s/g, "-")+'-all' + ".log");
var debug_log = fs.createWriteStream(app_config.get('log_dir')+"GCS-" + string_date.replace(/\s/g, "-")+'-debug' + ".log");
var error_log = fs.createWriteStream(app_config.get('log_dir')+"GCS-" + string_date.replace(/\s/g, "-")+'-error' + ".log");
var data_log = fs.createWriteStream(app_config.get('log_dir')+"GCS-" + string_date.replace(/\s/g, "-")+'-data' + ".log"); //writes whatever we received from the groundstation


var Logger=function(){
 	// Initialize necessary properties from `EventEmitter` in this instance
	EventEmitter.call(this);

	var getStringDate=function(){
		var date=new Date();
		return date.toDateString() + ' ' + date.toLocaleTimeString();
	};
	var writeDebugFile=function(text) {
      debug_log.write(text.trim() + "\r\n");
      all_log.write(text.trim() + "\r\n");
    };
    var writeErrorFile=function(text) {
      error_log.write(text.trim() + "\r\n");
      all_log.write(text.trim() + "\r\n");
    };
    var writeDataFile=function(text) {
      data_log.write(text.trim() + "\r\n");
    };
    this.data=function(text,label) {
      var string_date=getStringDate();
      writeDataFile("["+label+"] " +string_date+' '+ text);
      this.emit('data',string_date,text,label);
    };
    this.debug=function(text) {
    	var string_date=getStringDate();
      writeDebugFile("[DEBUG] " +string_date+' '+ text);
      console.log("[DEBUG] " +string_date+' '+ text);
      this.emit('debug',string_date,text);
    };
    this.info=function(text) {
    	var string_date=getStringDate();
      writeDebugFile("[INFO] " +string_date+' '+ text);
      console.log("[INFO] " +string_date+' '+ text);
      this.emit('info',string_date,text);
    };
    this.warn=function(text) {
    	var string_date=getStringDate();
      writeErrorFile("[WARNING] " +string_date+' '+ text);
      console.warn("[WARNING] " +string_date+' '+ text);
      this.emit('warn',string_date,text);
    };
    this.error=function(text) {
    	var string_date=getStringDate();
      writeErrorFile("[ERROR] " +string_date+' '+ text);
      console.error("[ERROR] " +string_date+' '+ text);
      this.emit('error-log',string_date,text); //cant be error because otherwise this would throw an error
    }
};

util.inherits(Logger,EventEmitter);

var logger=new Logger();

logger.setMaxListeners(advanced_config.get('logger_max_listeners'));

module.exports=logger;