//A logger wrapper that handles logging to the groundstation, the console, and the filesystem
//There are 4 levels of logs: error, warn, info, and debug
//error and warning level are saved to the error log, debug and info are saved to the debug log, and everything is stored in the "all" log

var fs=require('fs');
var app_config=require('../config/application-config');

var date=new Date();
var string_date=date.toDateString() + ' ' + date.toLocaleTimeString(); //output format is like: "Thu Dec 24 2015 2:33:20 AM"

var all_log = fs.createWriteStream(app_config.log_dir+"GCS-" + string_date.replace(/\s/g, "-")+'-all' + ".log");
var debug_log = fs.createWriteStream(app_config.log_dir+"GCS-" + string_date.replace(/\s/g, "-")+'-debug' + ".log");
var error_log = fs.createWriteStream(app_config.log_dir+"GCS-" + string_date.replace(/\s/g, "-")+'-error' + ".log");

var Logger={
	getStringDate: function(){
		var date=new Date();
		return date.toDateString() + ' ' + date.toLocaleTimeString();
	},

	writeToWindow:function(text) { //TODO: handle a way of transmitting the data better than this
        // var logDiv = $('#log')
        // var newItem = $('<div>' + text + '</div>');
        // logDiv.append(newItem);
        // var elem = document.getElementById('log');
        // if (elem) {
        //     elem.scrollTop = elem.scrollHeight;
        // }
    },
    writeDebugFile:function(text) {
        debug_log.write(text.trim() + "\r\n");
        all_log.write(text.trim() + "\r\n");
    },
    writeErrorFile:function(text) {
        error_log.write(text.trim() + "\r\n");
        all_log.write(text.trim() + "\r\n");
    },
    debug:function(text) {
    	var string_date=this.getStringDate();
        this.writeDebugFile("[DEBUG] " +string_date+' '+ text);
        this.writeToWindow("[DEBUG] " +string_date+' '+ text);
        console.log("[DEBUG] " +string_date+' '+ text);
    },
    info:function(text) {
    	var string_date=this.getStringDate();
        this.writeDebugFile("[INFO] " +string_date+' '+ text);
        this.writeToWindow("[INFO] " +string_date+' '+ text);
        console.log("[INFO] " +string_date+' '+ text);
    },
    warn:function(text) {
    	var string_date=this.getStringDate();
        this.writeErrorFile("[WARNING] " +string_date+' '+ text);
        this.writeToWindow("[WARNING] " +string_date+' '+ text);
        console.warn("[WARNING] " +string_date+' '+ text);
    },
    error:function(text) {
    	var string_date=this.getStringDate();
        this.writeErrorFile("[ERROR] " +string_date+' '+ text);
        this.writeToWindow("[ERROR] " +string_date+' '+ text);
        console.error("[ERROR] " +string_date+' '+ text);
    }
};

module.exports=Logger;