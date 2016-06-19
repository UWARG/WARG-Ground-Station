/**
 * @module models/Coordinates
 * @param obj
 * @returns {boolean}
 */
//Code copied from: https://github.com/Leaflet/Leaflet/blob/master/src/geo/LatLng.js
//Used inside the path manager for validating latitude and longitude objects
function isArray(obj) {
  return (Object.prototype.toString.call(obj) === '[object Array]');
};

LatLng = function (lat, lng, alt) {
  if (isNaN(lat) || isNaN(lng)) {
    throw new Error('Invalid LatLng object: (' + lat + ', ' + lng + ')');
  }

  // @property lat: Number
  // Latitude in degrees
  this.lat = +lat;

  // @property lng: Number
  // Longitude in degrees
  this.lng = +lng;

  // @property alt: Number
  // Altitude in meters (optional)
  if (alt !== undefined) {
    this.alt = +alt;
  }
};

latLng = function (a, b, c) {
  if (a instanceof LatLng) {
    return a;
  }
  if (isArray(a) && typeof a[0] !== 'object') {
    if (a.length === 3) {
      return new LatLng(a[0], a[1], a[2]);
    }
    if (a.length === 2) {
      return new LatLng(a[0], a[1]);
    }
    return null;
  }
  if (a === undefined || a === null) {
    return a;
  }
  if (typeof a === 'object' && 'lat' in a) {
    return new LatLng(a.lat, 'lng' in a ? a.lng : a.lon, a.alt);
  }
  if (b === undefined) {
    return null;
  }
  return new LatLng(a, b, c);
};

module.exports = latLng;