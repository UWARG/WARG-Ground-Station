/**
 * @author Serge Babayan
 * @module views/MapView
 * @requires models/Commands
 * @requires util/Validator
 * @requires util/Logger
 * @requires models/TelemetryData
 * @requires models/PathManager
 * @requires models/AircraftStatus
 * @requires Map
 * @requires util/Template
 * @requires electron
 * @listens models/TelemetryData~TelemetryData:data_received
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description View for the groundstation map
 */

var remote = require('electron').remote;
var Template = require('../util/Template');
var Map = require('../Map');
var TelemetryData = remote.require('./app/models/TelemetryData');
var Validator = require('../util/Validator');
var Logger = remote.require('./app/util/Logger');
var PathManager = remote.require('./app/map/PathManager');
var AircraftStatus = remote.require('./app/AircraftStatus');
var Commands = remote.require('./app/models/Commands');

module.exports = function (Marionette, L, $) {

  return Marionette.ItemView.extend({
    template: Template('MapView'),
    className: 'mapView',

    ui: {
      map: '#leaflet-map',
      plane_location_lat: '.plane-latitude',
      plane_location_lon: '.plane-longitude',
      path_verified: '#path-verified',
      start_following_button: '#start-following-button',
      new_target_waypoint: '#new-follow-index input',
      remote_waypoint_index: '#remote-waypoint-index',
      marker_lat: '#marker-lat',
      marker_lon: '#marker-lon',

      add_waypoint_button: '#add-waypoint-button'
    },
    events: {
      'click #clear-plane-trail-button': 'clearPlaneTrail',
      'click #add-waypoint-button': 'addWaypointToggle',
      'click #delete-waypoint-button': 'deleteWaypointToggle',
      'click #send-path-button': 'sendPath',
      'submit .waypointPopupForm': 'clickedWaypointPopupSubmit',
      'click #start-following-button': 'togglePathFollowing',
      'click #clear-path-button': 'clearPath',
      'submit #new-follow-index': 'followNewWaypoint',
      'click #new-marker-button': 'addNewMarker'
    },

    initialize: function () {
      this.map = new Map(L);
      this.add_waypoint_mode = false;
      this.delete_waypoint_mode = false;
      this.aircraft_position_callback = this.aircraftPositionCallback.bind(this);
      this.aircraft_status_callback = this.aircraftStatusCallback.bind(this);
      TelemetryData.on('aircraft_position', this.aircraft_position_callback);
      TelemetryData.on('aircraft_status', this.aircraft_status_callback);
    },
    onRender: function () {
      this.ui.map.ready(function () {
        this.map.createMap('leaflet-map');
      }.bind(this));
      this.ui.map.resize(function () {
        this.map.resize();
      }.bind(this));
    },

    onBeforeDestroy: function(){
      TelemetryData.removeListener('aircraft_position', this.aircraft_position_callback);
      TelemetryData.removeListener('aircraft_status', this.aircraft_status_callback);
    },

    aircraftPositionCallback: function(data){
      if (data.lat !== null && data.lon !== null) {
        if (data.heading !== null) {
          this.map.movePlane(data.lat, data.lon, data.heading);
        }
        this.map.expandPlaneTrail(data.lat, data.lon);
        this.setLatitudeLongitude(data.lat, data.lon);
      }
    },

    aircraftStatusCallback: function(data){
      if (data.path_checksum !== null) {
        PathManager.remote_path_checksum = data.path_checksum;
        if (PathManager.remote_path_checksum.toFixed(4) === PathManager.current_path_checksum.toFixed(4)) {
          this.ui.path_verified.text('Yes');
          PathManager.setSynced();
        }
        else {
          this.ui.path_verified.text('No. A: ' + data.path_checksum.toFixed(4) + ', L: ' + PathManager.current_path_checksum.toFixed(4));
        }
      }
      if (AircraftStatus.following_path) {
        this.ui.start_following_button.text('Stop Following');
      }
      else {
        this.ui.start_following_button.text('Start Following');
      }
      if (data.waypoint_count !== null) {
        PathManager.remote_waypoint_count = data.waypoint_count;
      }
      if (data.waypoint_index !== null) {
        PathManager.remote_waypoint_index =data.waypoint_index;
        this.ui.remote_waypoint_index.text(data.waypoint_index);
      }
    },

    setLatitudeLongitude: function (lat, lon) {
      if (Validator.isValidLatitude(lat) && Validator.isValidLongitude(lon)) {
        this.ui.plane_location_lat.text(Number(lat).toFixed(5));
        this.ui.plane_location_lon.text(Number(lon).toFixed(5));
      }
    },

    sendPath: function () {
      PathManager.sendPath();
    },

    clearPath: function () {
      PathManager.clearPath();
    },

    followNewWaypoint: function (e) {
      e.preventDefault();
      Commands.setTargetWaypoint(Number(this.ui.new_target_waypoint.val()));
      this.ui.new_target_waypoint.val('');
    },

    clearPlaneTrail: function (e) {
      this.map.clearPlaneTrail();
    },
    addWaypointToggle: function (e) {
      if (this.add_waypoint_mode){ //if we're currently adding a waypoint
        this.ui.add_waypoint_button.text('Add Waypoint');
        this.ui.add_waypoint_button.removeClass('button-error');
        this.ui.add_waypoint_button.addClass('button-secondary');
      } else {
        this.ui.add_waypoint_button.text('Stop Add');
        this.ui.add_waypoint_button.addClass('button-error');
        this.ui.add_waypoint_button.removeClass('button-secondary');
      }
      this.map.addWaypointMode(!this.add_waypoint_mode);
      this.add_waypoint_mode = !this.add_waypoint_mode;
    },
    deleteWaypointToggle: function (e) {
      this.map.deleteWaypointMode(!this.delete_waypoint_mode);
      this.delete_waypoint_mode = !this.delete_waypoint_mode;
    },
    clickedWaypointPopupSubmit: function (e) {
      e.preventDefault();
      this.map.popupSubmitted(Number($('.waypoint-altitude').val()), Number($('.waypoint-radius').val()), $('.is-probe').is(":checked"));
    },
    togglePathFollowing: function () {
      if (AircraftStatus.following_path) { //if the plane is currently following a path
        Commands.followPath(false);
      }
      else {
        Commands.followPath(true);
      }
    },
    addNewMarker: function (e) {
      var marker_lat = Number(this.ui.marker_lat.val());
      var marker_lon = Number(this.ui.marker_lon.val());
      this.map.addMarker(marker_lat, marker_lon);
    }
  });
};