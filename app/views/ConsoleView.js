/**
 * @author Serge Babayan
 * @module views/ConsoleView
 * @requires util/Template
 * @requires config/advanced-config
 * @requires util/Logger
 * @requires models/Commands
 * @requires electron
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Displays a console that communicates directly with the Logger module
 */

var remote = require('electron').remote;
var Template = require('../util/Template');
var Logger = remote.require('./app/util/Logger');
var Commands = remote.require('./app/models/Commands');
var advanced_config = remote.require('./config/advanced-config');

module.exports = function (Marionette) {

  return Marionette.ItemView.extend({
    template: Template('ConsoleView'),

    ui: {
      console: "#console",
      command_input: "#commands-input",
      info_toggle: "#console-info-toggle",
      debug_toggle: "#console-debug-toggle",
      error_toggle: "#console-error-toggle",
      warn_toggle: "#console-warn-toggle",
      data_toggle: "#console-data-toggle"
    },

    events: {
      'click #scroll-bottom-button': 'enableScrollBottom',
      'submit #commands-input-form': 'sendCommand',
      'keyup #commands-input': 'cycleCommandHistory',
      'change #console-info-toggle': 'toggleInfoMessages',
      'change #console-debug-toggle': 'toggleDebugMessages',
      'change #console-error-toggle': 'toggleErrorMessages',
      'change #console-warn-toggle': 'toggleWarnMessages',
      'change #console-data-toggle': 'toggleDataMessages'
    },

    className: 'consoleView',

    initialize: function () {
      this.scroll_bottom = true; //whether the console will scroll down upon new message arrival

      this.command_history = [];
      this.command_history_index = 0;

      this.max_console_messages = advanced_config.get('max_console_messages');
      this.all_displayed_messages = [];

      //whats kinds of messages we want displayed in the console
      this.infoMessages = false;
      this.debugMessages = false;
      this.errorMessages = false;
      this.warnMessages = false;
      this.dataMessages = false;

      this.logger_callbacks = {}; //we need to keep a reference to the add message callbacks so that we can properly remove off the logger listener
    },

    onRender: function () {
      //Turns on the logger listeners
      this.toggleInfoMessages();
      this.toggleDebugMessages();
      this.toggleErrorMessages();
      this.toggleWarnMessages();
      this.toggleDataMessages();

      this.detectScrollUp();
    },
    onBeforeDestroy: function () {
      //Remove any logger listeners
      if (this.logger_callbacks['info']) {
        Logger.removeListener('info', this.logger_callbacks['info']);
      }
      if (this.logger_callbacks['debug']) {
        Logger.removeListener('debug', this.logger_callbacks['debug']);
      }
      if (this.logger_callbacks['error-log']) {
        Logger.removeListener('error-log', this.logger_callbacks['error-log']);
      }
      if (this.logger_callbacks['warn']) {
        Logger.removeListener('warn', this.logger_callbacks['warn']);
      }
      if (this.logger_callbacks['data']) {
        Logger.removeListener('data', this.logger_callbacks['data']);
      }
    },
    toggleInfoMessages: function () {
      if (this.infoMessages) { //if we should stop listening to info level messages
        if (this.logger_callbacks['info']) {
          Logger.removeListener('info', this.logger_callbacks['info']); //stop listening to info level messages from the Logger
        }
        this.infoMessages = false;
      } else { //if we should start listening to info level messages
        var callback = this.addInfoMessage.bind(this);
        this.logger_callbacks['info'] = callback;
        Logger.addListener('info', callback); //call this.addInfoMessage every time an info level message comes in
        this.infoMessages = true;
        this.scroll_bottom = true;
      }
      this.ui.info_toggle.prop('checked', this.infoMessages);
    },
    toggleDebugMessages: function () {
      if (this.debugMessages) {
        if (this.logger_callbacks['debug']) {
          Logger.removeListener('debug', this.logger_callbacks['debug']);
        }
        this.debugMessages = false;
      } else {
        var callback = this.addDebugMessage.bind(this);
        this.logger_callbacks['debug'] = callback;
        Logger.addListener('debug', callback);
        this.debugMessages = true;
        this.scroll_bottom = true;
      }
      this.ui.debug_toggle.prop('checked', this.debugMessages);
    },
    toggleErrorMessages: function () {
      if (this.errorMessages) {
        if (this.logger_callbacks['error-log']) {
          Logger.removeListener('error-log', this.logger_callbacks['error-log']);
        }
        this.errorMessages = false;
      } else {
        var callback = this.addErrorMessage.bind(this);
        this.logger_callbacks['error-log'] = callback;
        Logger.addListener('error-log', callback);
        this.errorMessages = true;
        this.scroll_bottom = true;
      }
      this.ui.error_toggle.prop('checked', this.errorMessages);
    },
    toggleWarnMessages: function () {
      if (this.warnMessages) {
        if (this.logger_callbacks['warn']) {
          Logger.removeListener('warn', this.logger_callbacks['warn']);
        }
        this.warnMessages = false;
      } else {
        var callback = this.addWarnMessage.bind(this);
        this.logger_callbacks['warn'] = callback;
        Logger.addListener('warn', callback);
        this.warnMessages = true;
        this.scroll_bottom = true;
      }
      this.ui.warn_toggle.prop('checked', this.warnMessages);
    },
    toggleDataMessages: function () {
      if (this.dataMessages) {
        if (this.logger_callbacks['data']) {
          Logger.removeListener('data', this.logger_callbacks['data']);
        }
        this.dataMessages = false;
      } else {
        var callback = this.addDataMessage.bind(this);
        this.logger_callbacks['data'] = callback;
        Logger.addListener('data', callback);
        this.dataMessages = true;
        this.scroll_bottom = true;
      }
      this.ui.data_toggle.prop('checked', this.dataMessages);
    },
    addInfoMessage: function (time, text) {
      this.all_displayed_messages.push(this.ui.console.append('<p class="message info-message"><time>' + time + '</time>' + text + '</p>').children('*:last-child'));
      this.scrollToBottom();
      this.checkMaxConsoleMessages();
    },
    addDebugMessage: function (time, text) {
      this.all_displayed_messages.push(this.ui.console.append('<p class="message debug-message"><time>' + time + '</time>' + text + '</p>').children('*:last-child'));
      this.scrollToBottom();
      this.checkMaxConsoleMessages();
    },
    addErrorMessage: function (time, text) {
      this.all_displayed_messages.push(this.ui.console.append('<p class="message error-message"><time>' + time + '</time>' + text + '</p>').children('*:last-child'));
      this.scrollToBottom();
      this.checkMaxConsoleMessages();
    },
    addWarnMessage: function (time, text) {
      this.all_displayed_messages.push(this.ui.console.append('<p class="message warn-message"><time>' + time + '</time>' + text + '</p>').children('*:last-child'));
      this.scrollToBottom();
      this.checkMaxConsoleMessages();
    },
    addDataMessage: function (time, text) {
      this.all_displayed_messages.push(this.ui.console.append('<p class="message data-message"><time>' + time + '</time>' + text + '</p>').children('*:last-child'));
      this.scrollToBottom();
      this.checkMaxConsoleMessages();
    },
    sendCommand: function (e) {
      if (e) e.preventDefault();
      var command = this.ui.command_input.val();
      if (command && command.trim()) {
        Commands.sendRawCommand(command.trim());
        this.ui.command_input.val('');
        this.command_history.push(command.trim());
        this.command_history_index = 0;
      }
    },
    cycleCommandHistory: function (e) {
      if (e.keyCode === 38) { //keyup
        this.ui.command_input.val(this.command_history[this.command_history.length - 1 - this.command_history_index]);
        this.command_history.length - 1 - this.command_history_index > 0 ? this.command_history_index++ : this.command_history_index;
      }
      else if (e.keyCode === 40) { //keydown
        this.ui.command_input.val(this.command_history[this.command_history.length - 1 - this.command_history_index]);
        this.command_history_index > 0 ? this.command_history_index-- : this.command_history_index;
      }
    },
    detectScrollUp: function () { //disables scrollToBottom if it detects an upward scroll
      var lastScrollTop = 0;
      var that = this;
      this.ui.console.scroll(function (event) {
        var scrolltop = event.target.scrollTop;
        if (scrolltop < lastScrollTop) {
          // upscroll code
          that.scroll_bottom = false;
        }
        lastScrollTop = scrolltop;
      });
    },
    enableScrollBottom: function (e) {
      e.preventDefault();
      this.scroll_bottom = true;
      this.scrollToBottom();
    },
    scrollToBottom: function () {
      if (this.scroll_bottom) {
        this.ui.console[0].scrollTop = this.ui.console[0].scrollHeight;
      }
    },
    checkMaxConsoleMessages: function () {
      if (this.all_displayed_messages.length > this.max_console_messages) {
        this.all_displayed_messages[0].remove();
        this.all_displayed_messages.shift();
      }
    }
  });
};