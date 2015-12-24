// Load native UI library
var gui = require('nw.gui');
var app_config=require('./config/application-config');
var Logger=require('./app/logger');

if(app_config.mode==='developmet'){
  require('livereload').start();
  Logger.debug('Live reload server started!');
}
Logger.debug('Live reload server started!');
Logger.error('This is a test error');
Logger.warn('This is a warning');
Logger.info('This is a log');