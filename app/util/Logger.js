//A logger wrapper that handles logging to the groundstation, the console, and the filesystem
//There are 4 levels of logs: error, warn, info, and debug
//error and warning level are saved to the error log, debug and info are saved to the debug log, and everything is stored in the "all" log

var fs=require('fs');
var app_config=require('../../config/application-config');
var util = require('util');
var EventEmitter = require('events');

var date=new Date();
var string_date=date.toDateString() + ' ' + date.toLocaleTimeString(); //output format is like: "Thu Dec 24 2015 2:33:20 AM"

var all_log = fs.createWriteStream(app_config.log_dir+"GCS-" + string_date.replace(/\s/g, "-")+'-all' + ".log");
var debug_log = fs.createWriteStream(app_config.log_dir+"GCS-" + string_date.replace(/\s/g, "-")+'-debug' + ".log");
var error_log = fs.createWriteStream(app_config.log_dir+"GCS-" + string_date.replace(/\s/g, "-")+'-error' + ".log");

var Logger=function(){
 	// Initialize necessary properties from `EventEmitter` in this instance
  	EventEmitter.call(this);
  	var that=this;
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
    this.debug=function(text) {
    	var string_date=getStringDate();
        writeDebugFile("[DEBUG] " +string_date+' '+ text);
        console.log("[DEBUG] " +string_date+' '+ text);
    };
    this.info=function(text) {
    	var string_date=getStringDate();
        writeDebugFile("[INFO] " +string_date+' '+ text);
        console.log("[INFO] " +string_date+' '+ text);
    };
    this.warn=function(text) {
    	var string_date=getStringDate();
        writeErrorFile("[WARNING] " +string_date+' '+ text);
        console.warn("[WARNING] " +string_date+' '+ text);
    };
    this.error=function(text) {
    	var string_date=getStringDate();
        writeErrorFile("[ERROR] " +string_date+' '+ text);
        console.error("[ERROR] " +string_date+' '+ text);
    }
};

util.inherits(Logger,EventEmitter);

var logger=new Logger();

module.exports=logger;