var Template=require('../util/Template');
var Map=require('../Map');
var TelemetryData=require('../models/TelemetryData');
var Validator=require('../util/Validator');
var Logger=require('../util/Logger');
var PathManager=require('../map/PathManager');
var AircraftStatus=require('../AircraftStatus');
var Commands=require('../models/Commands');

module.exports=function(Marionette,L,$){

  return Marionette.ItemView.extend({
    template:Template('MapView'),
    className:'mapView', 

    ui:{
      map:'#leaflet-map',
      plane_location_lat:'.plane-latitude',
      plane_location_lon:'.plane-longitude',
      path_verified:'#path-verified',
      start_following_button:'#start-following-button',
      new_target_waypoint: '#new-follow-index input',
      remote_waypoint_index:'#remote-waypoint-index',
      marker_lat:'#marker-lat',
      marker_lon:'#marker-lon'
    },
    events:{
      'click #clear-plane-trail-button': 'clearPlaneTrail',
      'click #add-waypoint-button':'addWaypointToggle',
      'click #delete-waypoint-button':'deleteWaypointToggle',
      'click #send-path-button':'sendPath',
      'submit .waypointPopupForm':'clickedWaypointPopupSubmit',
      'click #start-following-button':'togglePathFollowing',
      'click #clear-path-button': 'clearPath',
      'submit #new-follow-index':'followNewWaypoint',
      'click #new-marker-button':'addNewMarker'
    },

    initialize: function(){
      this.map=new Map(L);
      this.add_waypoint_mode=false;
      this.delete_waypoint_mode=false;
    },
    onRender:function(){
      TelemetryData.addListener('data_received',function(data){
        if(Validator.isValidLatitude(data.lat) && Validator.isValidLongitude(data.lon)){
          if(Validator.isValidHeading(data.heading)){
            this.map.movePlane(data.lat,data.lon,data.heading);
          }
          this.map.expandPlaneTrail(data.lat,data.lon);
          this.setLatitudeLongitude(data.lat,data.lon);
        }
        if(Validator.isValidNumber(data.path_checksum)){
          PathManager.remote_path_checksum=Number(data.path_checksum);
          if(Number(data.path_checksum).toFixed(4)===PathManager.current_path_checksum.toFixed(4)){
            this.ui.path_verified.text('Yes');
            PathManager.setSynced();
          }
          else{
            this.ui.path_verified.text('No. A: '+Number(data.path_checksum).toFixed(4)+', L: '+PathManager.current_path_checksum.toFixed(4));
          }
        }
        else{
          Logger.warn('Invalid value for path_checksum received. Value: '+data.path_checksum);
        }
        if(AircraftStatus.following_path){
          this.ui.start_following_button.text('Stop Following');
        }
        else{
          this.ui.start_following_button.text('Start Following');
        }
        if(Validator.isValidNumber(data.waypoint_count)){
          PathManager.remote_waypoint_count=Number(data.waypoint_count);
        }
        if(Validator.isValidNumber(data.waypoint_index)){
          PathManager.remote_waypoint_index=Number(data.waypoint_index);
          this.ui.remote_waypoint_index.text(data.waypoint_index);
        }
      }.bind(this));
      this.ui.map.ready(function(){
       this.map.createMap('leaflet-map');
      }.bind(this));
      this.ui.map.resize(function(){
        this.map.resize();
      }.bind(this));
    },
    onBeforeDestroy:function(){
      
    },
    setLatitudeLongitude: function(lat,lon){
      if(Validator.isValidLatitude(lat) && Validator.isValidLongitude(lon)){
        this.ui.plane_location_lat.text(Number(lat).toFixed(5));
        this.ui.plane_location_lon.text(Number(lon).toFixed(5));
      }else{
        Logger.warn('Invalid longitude or latitude received! Latitude: '+lat+' Longitude: '+lon);
        this.ui.plane_location_lat.text('Invalid');
        this.ui.plane_location_lon.text('Invalid');
      }
    },

    sendPath: function(){
      PathManager.sendPath();
    },

    clearPath: function(){
      PathManager.clearPath();
    },

    followNewWaypoint: function(e){
      e.preventDefault();
      Commands.setTargetWaypoint(Number(this.ui.new_target_waypoint.val()));
      this.ui.new_target_waypoint.val('');
    },

    clearPlaneTrail: function(e){
      this.map.clearPlaneTrail();
    },
    addWaypointToggle: function(e){
      this.map.addWaypointMode(!this.add_waypoint_mode);
      this.add_waypoint_mode=!this.add_waypoint_mode;
    },
    deleteWaypointToggle: function(e){
      this.map.deleteWaypointMode(!this.delete_waypoint_mode);
      this.delete_waypoint_mode=!this.delete_waypoint_mode;
    },
    clickedWaypointPopupSubmit: function(e){
      e.preventDefault();
      this.map.popupSubmitted(Number($('.waypoint-altitude').val()),Number($('.waypoint-radius').val()), $('.is-probe').is(":checked"));
    },
    togglePathFollowing: function(){
      if(AircraftStatus.following_path){ //if the plane is currently following a path
        Commands.followPath(false);
      }
      else{
        Commands.followPath(true);
      }
    },
    addNewMarker: function(e){
      var marker_lat=Number(this.ui.marker_lat.val());
      var marker_lon=Number(this.ui.marker_lon.val());
      this.map.addMarker(marker_lat, marker_lon);
    }
  });
};