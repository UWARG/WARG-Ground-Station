var EventEmitter = require('events');
var util = require('util');

var map_config = require('../../config/map-config');
var advanced_config = require('../../config/advanced-config');
var Coordinates = require('../models/Coordinates');
var Waypoint = require('../models/Waypoint');
var Logger = require('../util/Logger');
var Commands = require('../models/Commands');

var PathManager = function () {
  this.plane_trail_coordinates = [];
  this.waypoints = [];
  this.remote_waypoint_index = 0; //the waypoint the plane is currently heading to
  this.remote_waypoint_count = 0;
  this.current_path_checksum = 0; //current path checksum
  this.remote_path_checksum = 0;
  this.sending_path_interval = null;

  //formats the waypoints in two arrays of polylines (this is for drawing the polyline between waypoints)
  this.getMultiPolylineCoords = function () {
    var synced_polylines = [];
    var unsynced_polylines = [];

    var currently_synced = false;
    var next_synced = false;
    for (var i = 0; i < this.waypoints.length - 1; i++) {
      currently_synced = this.waypoints[i].sync_status === Waypoint.SYNC_STATUS.NOTHING;
      next_synced = this.waypoints[i + 1].sync_status === Waypoint.SYNC_STATUS.NOTHING;

      if (currently_synced && next_synced) {
        synced_polylines.push([this.waypoints[i], this.waypoints[i + 1]]);
      }
      else {
        unsynced_polylines.push([this.waypoints[i], this.waypoints[i + 1]]);
      }
    }
    return {
      synced_polylines: synced_polylines,
      unsynced_polylines: unsynced_polylines
    }
  };

  this.addToTrail = function (coordinates) {
    var coords = Coordinates(coordinates);
    if (coords) {
      this.plane_trail_coordinates.push(coords);
      this.emit('update_trail', true);
    }
    else {
      console.error('PathManager.addToTrail was passed in incorrect coordinates. Coordinates: ' + coordinates);
    }
  };

  this.clearTrail = function () {
    this.plane_trail_coordinates = [];
  };

  this.appendWaypoint = function (coordinates) {
    var coords = Coordinates(coordinates);
    if (coords) {
      this.waypoints.push(new Waypoint(coordinates, map_config.get('default_waypoint_radius'), Waypoint.SYNC_STATUS.APPEND));
      this.emit('append_waypoint', coordinates);
      this.calculatePathChecksum();
    }
    else {
      console.error('Invalid parameter in PathManager.appendWaypoint: ' + coordinates);
    }
  };

  this.resyncWaypoint = function (index) {
    if (this.waypoints[index]) {
      var waypoint = this.waypoints[index];
      Commands.updateWaypoint(index, waypoint.lat, waypoint.lng, waypoint.alt, waypoint.radius, waypoint.type === 'probe_drop');
    }
  };

  this.removeWaypoint = function (index) {
    if (this.waypoints[index]) {
      this.waypoints.splice(index, 1);
      this.emit('remove_waypoint', index);
      //if its an unsynced waypoint (so one that was recentely appended or inserted), delete it straight up
      // if(this.waypoints[index].sync_status===Waypoint.SYNC_STATUS.APPEND || this.waypoints[index].sync_status===Waypoint.SYNC_STATUS.INSERT){
      // 	this.waypoints.splice(index, 1);
      // 	this.emit('remove_waypoint',index);
      // }
      // else{
      // 	this.changeWaypointSyncStatus(this.waypoints[index],Waypoint.SYNC_STATUS.DELETE);
      // 	this.emit('set_deleted_waypoint',index);
      // }
      this.calculatePathChecksum();
    }
    else {
      console.error('PathManager.removeWaypoint was passed in an index that does not exist. Index: ' + index);
    }
  };

  this.insertWaypoint = function (index, coordinates) {
    var coords = Coordinates(coordinates);
    if (this.waypoints[index] && coords) {
      var sync_status = Waypoint.SYNC_STATUS.INSERT;
      //if the previous waypoint was appended, then append this one as well
      if (this.waypoints[index - 1] && this.waypoints[index - 1].sync_status === Waypoint.SYNC_STATUS.APPEND) {
        sync_status = Waypoint.SYNC_STATUS.APPEND;
      }
      this.waypoints.splice(index, 0, new Waypoint(coords, map_config.get('default_waypoint_radius'), sync_status));
      this.emit('insert_waypoint', index, coordinates);
      this.calculatePathChecksum();
    }
    else {
      console.error('PathManager insertWaypoint was passed in either a waypoint index that does not exist or invalid coordinates. Coords: ' + coordinates);
    }
  };

  this.updateWaypoint = function (index, coordinates) {
    var coords = Coordinates(coordinates);
    if (this.waypoints[index] && coords) {
      coords.lat ? this.waypoints[index].lat = coords.lat : null;
      coords.lng ? this.waypoints[index].lng = coords.lng : null;
      coords.alt ? this.waypoints[index].alt = coords.alt : null;
      this.changeWaypointSyncStatus(this.waypoints[index], Waypoint.SYNC_STATUS.UPDATE);
      this.emit('update_waypoint', index, this.waypoints[index]);
      this.calculatePathChecksum();
    }
    else {
      console.error('PathManager.updateWaypoint called on a waypoint index that does not exist or passed in invalid coordinates.Coords: ' + coordinates);
    }
  };

  this.updateWaypointRadius = function (index, radius) {
    if (this.waypoints[index] && radius) {
      this.changeWaypointSyncStatus(this.waypoints[index], Waypoint.SYNC_STATUS.UPDATE);
      this.waypoints[index].radius = radius;
      this.emit('update_waypoint', index, this.waypoints[index]);
    }
    else {
      console.error('PathManager.updateWaypointRadius called on a waypoint index that does not exist or passed in invalid coordinates.Radius: ' + radius);
    }
  };

  this.updateWaypointAltitude = function (index, alt) {
    if (this.waypoints[index] && alt) {
      this.waypoints[index].alt = alt;
      this.changeWaypointSyncStatus(this.waypoints[index], Waypoint.SYNC_STATUS.UPDATE);
      this.emit('update_waypoint', index, this.waypoints[index]);
      this.calculatePathChecksum();
    }
    else {
      console.error('PathManager.updateWaypointAltitude called on a waypoint index that does not exist or passed in invalid coordinates.Alt: ' + alt);
    }
  };

  this.updateWaypointType = function (index, is_probe_drop) {
    if (this.waypoints[index]) {
      this.waypoints[index].type = is_probe_drop ? "probe_drop" : false;
      this.changeWaypointSyncStatus(this.waypoints[index], Waypoint.SYNC_STATUS.UPDATE);
      this.emit('update_waypoint', index, this.waypoints[index]);
    }
  }

  this.changeWaypointSyncStatus = function (waypoint, new_status) {
    //only set it as update if it was synced with the remote before
    if (new_status === Waypoint.SYNC_STATUS.UPDATE) {
      if (waypoint.sync_status === Waypoint.SYNC_STATUS.NOTHING) {
        waypoint.sync_status = new_status;
      }
    }
    else {
      waypoint.sync_status = new_status;
    }
  };

  this.debugPrint = function () {
    for (var i = 0; i < this.waypoints.length; i++) {
      var string = 'Waypoint #' + i + '\n';
      string += 'Altitude: ' + this.waypoints[i].alt + '\n';
      string += 'Radius: ' + this.waypoints[i].radius + '\n';
      string += 'Type: ' + this.waypoints[i].type + '\n';
      string += 'Sync Status: ' + this.waypoints[i].sync_status + '\n\n';
      console.log(string);
    }
  };

  this.calculatePathChecksum = function () {
    this.current_path_checksum = this.getChecksum(this.waypoints);
  };

  this.getChecksum = function (waypoint_array) {
    var checksum = 0;
    for (var i = 0; i < waypoint_array.length; i++) {
      checksum += waypoint_array[i].lat;
      checksum += waypoint_array[i].lng;
      checksum += waypoint_array[i].alt;
      checksum += waypoint_array[i].radius;
      checksum += (waypoint_array[i].type === 'probe_drop') * 1;
    }
    return checksum;
  };

  this.clearPath = function () {
    for (var i = 0; i < this.waypoints.length; i++) {
      this.removeWaypoint(i);
    }
    Commands.clearWaypoints();
    Logger.info('[Path Manager] Cleared all waypoints');
  };

  this.stopSendingPath = function(){
    if (this.sending_path_interval) {
      clearInterval(this.sending_path_interval);
    }
  };

  this.sendPath = function () {
    this.stopSendingPath();

    Logger.info('[Path Manager] Clearing all waypoints');
    Commands.clearWaypoints();
    var total_waypoints = this.waypoints.length;

    var current_waypoint_to_send = 0;
    var verifying_last = false;
    this.sending_path_interval = setInterval(function () {
      if (!this.waypoints[current_waypoint_to_send] && !verifying_last) {
        clearInterval(this.sending_path_interval);
      }
      else if (current_waypoint_to_send === 0 && this.remote_waypoint_count !== 0) {
        Commands.clearWaypoints();
      }
      else if (current_waypoint_to_send === this.remote_waypoint_count) {
        if (!verifying_last) {
          Logger.info('[Path Manager] Sending waypoint ' + (current_waypoint_to_send + 1) + '/' + total_waypoints);
          Logger.debug('[Path Manager] Sending waypoint ' + (current_waypoint_to_send + 1) + '/' + total_waypoints + ' with: Lat: ' + this.waypoints[current_waypoint_to_send].lat + ' Lon: ' + this.waypoints[current_waypoint_to_send].lng + ' A: ' + this.waypoints[current_waypoint_to_send].alt + ' R: ' + this.waypoints[current_waypoint_to_send].radius);
          Commands.appendWaypoint(
            this.waypoints[current_waypoint_to_send].lat,
            this.waypoints[current_waypoint_to_send].lng,
            this.waypoints[current_waypoint_to_send].alt,
            this.waypoints[current_waypoint_to_send].radius,
            this.waypoints[current_waypoint_to_send].type === 'probe_drop');
        }

        if (verifying_last) {
          verifying_last = false;
        }

        current_waypoint_to_send++;

        if (current_waypoint_to_send === total_waypoints) { //if we just sent the last waypoint
          verifying_last = true;
        }
        else {
          verifying_last = false;
        }
      }
      else {
        Logger.info('[Path Manager] Re-Sending waypoint ' + current_waypoint_to_send + '/' + total_waypoints);
        Logger.debug('[Path Manager] Re-Sending waypoint ' + current_waypoint_to_send + '/' + total_waypoints + ' with: Lat: ' + this.waypoints[current_waypoint_to_send - 1].lat + ' Lon: ' + this.waypoints[current_waypoint_to_send - 1].lng + ' A: ' + this.waypoints[current_waypoint_to_send - 1].alt + ' R: ' + this.waypoints[current_waypoint_to_send - 1].radius);
        Commands.appendWaypoint(
          this.waypoints[current_waypoint_to_send - 1].lat,
          this.waypoints[current_waypoint_to_send - 1].lng,
          this.waypoints[current_waypoint_to_send - 1].alt,
          this.waypoints[current_waypoint_to_send - 1].radius,
          this.waypoints[current_waypoint_to_send - 1].type === 'probe_drop');
      }
    }.bind(this), advanced_config.get('path_send_interval'));

    this.calculatePathChecksum();
  };

  this.setSynced = function () {
    for (var i = 0; i < this.waypoints.length; i++) {
      this.waypoints[i].sync_status = Waypoint.SYNC_STATUS.NOTHING;
    }
    this.emit('synced');
  }
};

util.inherits(PathManager, EventEmitter);

module.exports = new PathManager();