//configures the leaflet draw plugin for the map
var SafetyMarkers = require('../models/SafetyMarkers');

var MapDraw = function (leaflet) {
  // Initialise the FeatureGroup to store editable layers
  var drawnItems = new leaflet.FeatureGroup();

  var leaflet_draw_options = {
    position: 'topleft',
    draw: {
      polyline: {
        shapeOptions: {
          color: '#8774FF',
          weight: 4,
          //fillColor:''
        }
      },
      polygon: {
        shapeOptions: {
          color: '#00B0CA',
          weight: 4,
          //fillColor:''
        }
      },
      circle: {
        shapeOptions: {
          color: '#FC2F2F',
          weight: 4,
          //fillColor:''
        }
      },
      rectangle: {
        shapeOptions: {
          color: '#229C00',
          weight: 4,
          //fillColor:''
        }
      },
      marker: {}
    },
    edit: {
      featureGroup: drawnItems //Important!
    }
  };

  // Initialize the draw control and pass it the FeatureGroup of editable layers
  var drawControl = new leaflet.Control.Draw(leaflet_draw_options);

  //adds the draw controls to the map
  this.addTo = function (map) {
    drawnItems.addTo(map);
    drawControl.addTo(map);

    map.on('draw:created', function (event) {
      var layer = event.layer;
      var marker = {
        type: event.layerType,
        latlngs: event.layer._latlngs
      };
      SafetyMarkers.addSafetyMarker(marker);
      drawnItems.addLayer(layer);
    });
  };
}

module.exports = MapDraw;