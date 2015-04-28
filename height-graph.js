var HeightGraph = (function ($, d3) {
	
	var events = require('events');

	var emitter = new events.EventEmitter();
	var svg;	// jQuery object
	var graph;

	var lastLatLng;
	var points = [];

	// Initialize graph
	$(document).ready(function () {
		if (graph) return;

		svg = $('#height-graph');
		
		graph = new SimpleGraph("height-graph", {
			xmin: 0, xmax: 150000,
			ymin: -100, ymax: 100,
		});

		graph.setPoints([
		]);

		emitter.graph = graph;
	});

	emitter.addLatLng = function (latLng) {
		if (!latLng.alt) {
			console.error('LatLng altitude not set', latLng);
			return;
		}

		if (!lastLatLng) {
			lastLatLng = latLng;
			points.push({x: 0, y: latLng.alt});
			Log.debug("HeightGraph Adding first point (" + 0 + ", " + latLng.alt + ")");
		} else {
			var prevPoint = points[points.length-1];
			if (lastLatLng.distanceTo(latLng) == 0) {
				prevPoint.y = latLng.alt;
				Log.debug("HeightGraph Setting previous point to (" + prevPoint.x + ", " + prevPoint.y + ")");
			} else {
				var newPoint = {x: prevPoint.x + lastLatLng.distanceTo(latLng), y: latLng.alt};
				points.push(newPoint);
				Log.debug("HeightGraph Adding new point (" + newPoint.x + ", " + newPoint.y + ")");
			}
		}

		graph.setPoints(points);
	};


	return emitter;

})($, d3);