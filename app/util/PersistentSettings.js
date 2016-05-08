/**
 * @author Serge Babayan
 * @module util/PersistentSettings
 * @requires path
 * @requires node-persist
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence ISC
 * @description This module provides persistent settings support to the app. It uses [node-persist](https://github.com/simonlast/node-persist)
 * which provides a local storage api for saving settings. It takes in a `config` object found in the `project_root/config folder`
 * of the app and returns a new wrapper object for setting and accessing persistent settings.
 */

var PersistentStorage = require('node-persist');
var path=require('path');

//initialize the PersistentStorage module with the specified directory to save its contents to
PersistentStorage.initSync({
  dir: path.join(__dirname,'../../persistent_storage')
});

//Loads in configuration from config files into local storage if they dont exist. Subsequent
/**
 * @class PersistentSettings
 * @param file_name The file name of the config file (ie. 'advanced-settings'). This is used as the prefix to its keys
 * @param settings The contents of the config object. These are used to generate the key-value pairs that are saved in settings
 */
var PersistentSettings=function(file_name, settings){
  this.file_name=file_name;
  this.default_settings=settings;

  for(var key in settings){
    if(settings.hasOwnProperty(key)){
      if(!PersistentStorage.getItemSync(this.file_name+'_'+key)){ //if the key doesn't exist in local storage yet
        PersistentStorage.setItemSync(this.file_name+'_'+key,settings[key]); //create the key in local storage
      }
    }
  }

  /**
   * @param key {string} The key to retrieve the value of
   * @returns {Object} The value that is stored in the key.
   * The object type stays intact (so if its defined as an array in the config object, it will return an array)
   */
  this.get=function(key){
    return PersistentStorage.getItemSync(this.file_name+'_'+key);
  };

  /**
   *
   * @param key {string} The key to set
   * @param value {Object} The value to set
   */
  this.set=function(key,value){
    PersistentStorage.setItemSync(this.file_name+'_'+key,value);
  };
};

module.exports=PersistentSettings;