//node-persist is a module that provides a local storage api with node.js Docs: https://github.com/simonlast/node-persist
var PersistentStorage = require('node-persist');
var path=require('path');

PersistentStorage.initSync({
  dir: path.join(__dirname,'../../persistent_storage')
});

//Loads in configuration from config files into local storage if they dont exist. Subsequent
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

  this.get=function(key){
    return PersistentStorage.getItemSync(this.file_name+'_'+key);
  };

  this.set=function(key,value){
    PersistentStorage.setItemSync(this.file_name+'_'+key,value);
  };
};

module.exports=PersistentSettings;