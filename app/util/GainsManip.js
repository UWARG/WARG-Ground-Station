var LocalStorage = require('./LocalStorage');
var fdialogs = require('node-webkit-fdialogs');
var Logger = require('../util/Logger');
var Commands = require('../models/Commands');
var gains_config = require('../../config/gains-config');
//Loads in configuration from config files into local storage if they dont exist. Subsequent
var GainsManip = {
    GainsExport: function () {
        var keys=Object.keys(gains_config.default_settings);
        var str;
        var buf;
        var exported_settings=gains_config.default_settings;
        for (var i = 0; i < keys.length; i++)
        {
            exported_settings[keys[i]]=gains_config.get(keys[i]);
        }
        str=JSON.stringify(exported_settings,null,2);
        buf=new Buffer(str);
        fdialogs.saveFile(buf, function (err, path) {
        });
    },
    GainsImport: function () {
        var Dialog = new fdialogs.FDialog({
            type: 'open',
            accept: ['.txt'],
            path: '~Documents'
        });
        fdialogs.readFile(function (err, content, path) {
            var keys=Object.keys(gains_config.default_settings);
            var object=JSON.parse(content,null,2);
            for(var i=0;i<keys.length;i++)
            {
                gains_config.set(keys[i],object[keys[i]]);
            }
        });
    }
};
module.exports = GainsManip;
//https://www.npmjs.com/package/node-webkit-fdialogs