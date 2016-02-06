var LocalStorage=require('./LocalStorage');

//Loads in configuration from config files into local storage if they dont exist. Subsequent
var SettingsLoader=function(file_name, settings){
  this.file_name=file_name;

  for(var key in settings){
    if(settings.hasOwnProperty(key)){
      if(!LocalStorage.getItem(this.file_name+'_'+key)){ //if it doesnt exist in local storage yet
        LocalStorage.setItem(this.file_name+'_'+key,JSON.stringify(settings[key]));
      }
    }
  }

 this.get=function(key){
  return JSON.parse(LocalStorage.getItem(this.file_name+'_'+key));
 };

 this.set=function(key,value){
    LocalStorage.setItem(this.file_name+'_'+key,JSON.stringify(value));
  };
};

module.exports=SettingsLoader;