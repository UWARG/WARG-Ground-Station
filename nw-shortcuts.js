(function (Mousetrap) {
	var win = require('nw.gui').Window.get();
	Mousetrap.bind(["f5"], function() { win.reload() });
	Mousetrap.bind(["mod+r"], function() { win.reloadDev() });
	Mousetrap.bind(["mod+shift+r", "shift+f5"], function() { win.reloadIgnoringCache() });
	Mousetrap.bind(["mod+shift+i", "mod+shift+j"], function() { win.isDevToolsOpen() ? win.closeDevTools() : win.showDevTools() });
})(Mousetrap);