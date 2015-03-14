var Log = (function ($) {
    var fs = require('fs');
    var log_file = fs.createWriteStream("GCS.log");

    function writeToWindow(text) {
        var logDiv = $('#log')
        var newItem = $('<div class="logText">' + text + '</div>');
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
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        month = (month < 10 ? "0" : "") + month;
        var day = date.getDate();
        day = (day < 10 ? "0" : "") + day;
        return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
    }

    function writeToFile(text) {
        log_file.write(getDateTime() + " " + text.trim() + "\r\n");
    }

    function Debug(text) {
        writeToFile("[DEBUG] " + text);
    }

    function Info(text) {
        writeToFile("[INFO] " + text);
        writeToWindow(text);
    }

    function Warning(text) {
        writeToFile("[WARNING] " + text);
        writeToWindow("WARNING: " + text);
    }

    function Error(text) {
        writeToFile("[ERROR] " + text);
        writeToWindow("ERROR: " + text);
    }

    return {
        Debug: Debug,
        Info: Info,
        Warning: Warning,
        Error: Error
    };

})($);