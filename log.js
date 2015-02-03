var Log = (function ($) {

	function write(text) {
	    var logDiv = $('#log')
	    if (logDiv.children().length === 3) {
	        logDiv.children()[0].remove();
	    }
	    var newItem = $('<div class="logText">' + text + '</div>');
	    logDiv.append(newItem);
	}

	return {
		write: write
	};

})($);
