var jsdom = require('jsdom');

module.exports.setup = function (callback) {
  jsdom.env({
    html: "<html><body></body></html>",
    scripts: [
      './app/lib/jquery-2.1.4.js',
      './app/lib/underscore.js',
      './app/lib/backbone.js',
      './app/lib/backbone.marionette.js'
    ],
    done: function (errs, window) {
      callback({
        window: window,
        Marionette: window.Marionette,
        $: window.$
      });
    }
  });
};