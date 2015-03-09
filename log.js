var Log = (function ($) {

    function write(text) {
        var logDiv = $('#log')
        var newItem = $('<div class="logText">' + text + '</div>');
        logDiv.append(newItem);
        var elem = document.getElementById('log');
        if (elem) {
            elem.scrollTop = elem.scrollHeight;
        }
    }

    return {
        write: write
    };

})($);