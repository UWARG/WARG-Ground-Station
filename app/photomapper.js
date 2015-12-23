(function (Network, Log) {

	var csvFilename = "logs/photomapper/photomapper-" + getDateTime().replace(/[\:\.]/g, "") + ".csv";
	var wstream = require('fs').createWriteStream(csvFilename, {
        "encoding": null,
        "mode": 0666
    });

    wstream.write('filename,latitude,longitude,altitude,heading\r\n');

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

	Network.dataRelay.on('data', detectFallingEdge);

	var lastCamera = 0;
	var startedInfo = false;
	function detectFallingEdge(data) {
		thisCamera = data.cameraStatus;
		if (thisCamera != lastCamera && thisCamera == 0) {
			logLine(data);
		}
		lastCamera = thisCamera;
		if (!startedInfo) {
			Log.info("Photomapper Started CSV output at " + csvFilename);
			startedInfo = true;
		}
	};

	var logLine = function (data) {
		wstream.write(',' + data.lat + ',' + data.lon + ',' + data.altitude + ',' + data.heading + '\r\n');
	};

})(Network, Log);