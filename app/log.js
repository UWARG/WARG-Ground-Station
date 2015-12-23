var Log = (function ($) {
    var fs = require('fs');
    var log_file = fs.createWriteStream("logs/GCS-" + getDateTime().replace(/[\:\.]/g, "") + ".log");

    function writeToWindow(text) {
        var logDiv = $('#log')
        var newItem = $('<div>' + text + '</div>');
        logDiv.append(newItem);
        var elem = document.getElementById('log');
        if (elem) {
            elem.scrollTop = elem.scrollHeight;
        }
    }

    function getDateTime() {
        var date = new Date();
        var hour = date.getHours();
        hour = (hour < 10 ? "0" : "") + hour;
        var min = date.getMinutes();
        min = (min < 10 ? "0" : "") + min;
        var sec = date.getSeconds();
        sec = (sec < 10 ? "0" : "") + sec;
        var msec = date.getMilliseconds();
        msec = (msec < 100 ? "0" : "") + (msec < 10 ? "0" : "") + msec;
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        month = (month < 10 ? "0" : "") + month;
        var day = date.getDate();
        day = (day < 10 ? "0" : "") + day;
        return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec + "." + msec;
    }

    function writeToFile(text) {
        log_file.write(getDateTime() + " " + text.trim() + "\r\n");
    }

    function debug(text) {
        writeToFile("[DEBUG] " + text);
    }

    function info(text) {
        writeToFile("[INFO] " + text);
        writeToWindow(text);
    }

    function warning(text) {
        writeToFile("[WARNING] " + text);
        writeToWindow("WARNING: " + text);
    }

    function error(text) {
        writeToFile("[ERROR] " + text);
        writeToWindow("ERROR: " + text);
    }

    return {
        debug: debug,
        info: info,
        warning: warning,
        error: error
    };

})($);