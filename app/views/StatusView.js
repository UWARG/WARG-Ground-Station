//The view for the status bar
//NOTE: this view should NEVER be rendered more than once (otherwise we're leaving unclosed listeners on the TelemetryData)
var Template=require('../util/Template');
var TelemetryData=require('../models/TelemetryData');
var StatusManager=require('../StatusManager');
var Logger=require('../util/Logger');
var moment=require('moment');

module.exports=function(Marionette,$){

  return Marionette.ItemView.extend({
    template:Template('StatusView'), //name of the file in the views folder at the project root
    className:'statusView',

    ui:{
      statuses:".statuses",
      vehicle_time:".time-view .vehicle-time",
      elapsed_time:".time-view .elapsed-time",
      battery_percent:".battery-percentage",
      battery_message:".battery-message",
      battery_picture:".battery-picture .battery-base .percentage",
      gps_message:".gps-status .gps-message"
    },
    events:{
      'click #reset-elapsed-time':'resetElapsedTime',
      'click #clear-statuses-button':'clearStatuses'
    },

    initialize: function(){
      this.starting_time=null;
      this.current_battery_level=-1;

      this.data_callback=null; //so that we can get rid of the listener safely
      this.new_status_callback=null;
      this.remove_status_callback=null;

      this.status_messages=[];
    },
    onRender:function(){
      this.data_callback=this.onDataCallback.bind(this);
      TelemetryData.addListener('data_received',this.data_callback);

      this.new_status_callback=this.onNewStatusCallback.bind(this);
      StatusManager.addListener('new_status',this.new_status_callback);

      this.remove_status_callback=this.onRemoveStatusCallback.bind(this);
      StatusManager.addListener('remove_status',this.remove_status_callback);
    },
    onBeforeDestroy:function(){
      TelemetryData.removeListener('data_received',this.data_callback);
      StatusManager.removeListener('new_status',this.new_status_callback);
      StatusManager.removeListener('remove_status',this.remove_status_callback);
    },
    onDataCallback:function(data){
      if(!this.starting_time && this.validTime(data.time)){
        time=Number(data.time).toFixed(2);
        this.starting_time=moment(time,'HHmmss.SS');
      }
      this.setTime(data.time);
      this.setBatteryLevel(data.batteryLevel);
      this.setGpsLevel(data.Gps_status);
    },
    onNewStatusCallback: function(message, priority, timeout){
      if(priority===1){
        var element=$('<p class="status status-high">'+message+'</p>');
      }
      else if (priority===2){
        var element=$('<p class="status status-medium">'+message+'</p>');
      }
      else{
        var element=$('<p class="status status-low">'+message+'</p>');
      }
      this.status_messages.push({
          element: element,
          message: message,
          priority: priority,
          timeout: timeout
        });
      this.ui.statuses.append(element);
      this.ui.statuses[0].scrollTop=0;
    },
    onRemoveStatusCallback: function(message, priority, timeout){
      for(var i=0;i<this.status_messages.length;i++){
        if(this.status_messages[i].message===message && this.status_messages[i].priority===priority &&this.status_messages[i].timeout===timeout){
          this.status_messages[i].element.remove();
          this.status_messages.splice(i,1);
          return;
        }
      }
    },
    setTime:function(time){
      if(!this.validTime(time)){
        Logger.warn('Got invalid value for the time! Time: '+time);
        this.ui.vehicle_time.text('Invalid Time Received');
        this.ui.elapsed_time.text('--');
      }
      else{
        time=Number(time).toFixed(2);
        var date=moment(time,'HHmmss.SS');
        var elapsed_time=moment(date.diff(this.starting_time));
        this.ui.vehicle_time.text(date.format('HH:mm:ss:SS'));
        this.ui.elapsed_time.text(elapsed_time.minute()+' min '+elapsed_time.second()+' sec');
      }
    },
    setBatteryLevel:function(battery_level){
      if(!this.validBattery(battery_level)){
        Logger.warn('Got an invalid value for the battery level! Battery Level: '+battery_level);
        this.ui.battery_percent.text('Invalid Battery Level');
      }
      else if(Number(battery_level)!==this.current_battery_level){
        var percent=Math.round(Number(battery_level));
        this.current_battery_level=percent;
        this.ui.battery_percent.text(percent+'%');
        this.ui.battery_picture.css('width',percent+'%');
        if(percent>50 && percent <=100){
          this.ui.battery_picture.css('background-color','green');
          this.ui.battery_message.text('');
        }else if (percent>=20 && percent<=50){
          this.ui.battery_picture.css('background-color','orange');
          this.ui.battery_message.text('Low');
          this.ui.battery_message.css('color','orange');
        }else{
          this.ui.battery_picture.css('background-color','red');
          this.ui.battery_message.text('Very Low');
          this.ui.battery_message.css('color','red');
        }
      }
    },
    setGpsLevel:function(gps_level)
    {
      if(!this.validGPS(gps_level))
      {
        Logger.warn('Got an invalid value for the GPS level! GPS Level: '+gps_level);
        this.ui.gps_message.css('color','orange');
        this.ui.gps_message.text('Invalid GPS Level');
      }
      else if(gps_level===0)
      {
        Logger.warn('no GPS connection');
        this.ui.gps_message.css('color','red');
        this.ui.gps_message.text('NOT CONNECTED'); 
      }
      else
      {
        this.ui.gps_message.css('color','green');
        this.ui.gps_message.text('Connected to '+ (gps_level & 0x0f) + ' satelites'); 
      }
    },
    resetElapsedTime:function(){
      this.starting_time=null;
    },
    clearStatuses: function(){ //removes all persistent statuses
      StatusManager.removeStatusesByTimeout(0);
    },
    validTime: function(timestring){
      if(typeof timestring==='undefined' || timestring===null || !Number(timestring) || Number(timestring).toFixed(2)<=0){
        return false;
      }
      return true;
    },
    validBattery: function(battery){
      if(typeof battery!=='undefined' && battery!==null && Number(battery)!=='NaN' && Number(battery)>=0 && Number(battery)<=100){
        return true;
      }
      return false;
    },
    validGPS:function(gps)
    {
      if(typeof gps!=='undefined' && gps!==null && Number(gps)!=='NaN'){
        return true;
      }
      return false;  
    }
  });
};