var HeightGraph = (function ($, d3) {
	
	var events = require('events');

	var emitter = new events.EventEmitter();
	var svg;	// jQuery object
	var graph;

	// Parameters
	// var margins = {top: 20, right: 20, bottom: 25, left: 30};

	// Initialize graph
	$(document).ready(function () {
		if (graph) return;

		svg = $('#height-graph');
		
		graph = new SimpleGraph("height-graph", {
			xmin: 0, xmax: 60,
			ymin: 0, ymax: 40,
		});
		emitter.graph = graph;
	});


	return emitter;

})($, d3);