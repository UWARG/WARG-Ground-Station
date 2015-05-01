(function () {
	window.Tooltip = function (id) {
		var self = this;

		this.id = id;
		
		var tooltip = $('<div>').attr('id', id).css({position: 'fixed', padding: '2px', fontSize: '13px'});
		this.attr = tooltip.attr;
		this.text = tooltip.text;

		var mousemove = function (e) {
	        tooltip.css({
	            left: (e.screenX + 15) + 'px',
	            top: e.screenY + 'px',
	        });
	    };

		$(document).ready(function () {
			$(document.body).append(tooltip);
		});

		this.show = function () {
			tooltip.show();
        	$(document.body).on('mousemove', mousemove);
        	return this;
		};

		this.hide = function () {
			tooltip.hide();
        	$(document.body).off('mousemove', mousemove);
        	return this;
		};

		this.attr = function (key, value) {
			tooltip.attr(key, value);
			return this;
		};

		this.text = function (value) {
			tooltip.text(value);
			return this;
		}
	}
})();