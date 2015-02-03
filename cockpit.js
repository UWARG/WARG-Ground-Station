// Data object contains values read from data-relay
// Accessed with Data.state.______
//
// updateCockpit() is called whenever data is recieved

var Cockpit = (function ($, Data, Log, Network) {

    $(document).ready(function () {
        //Initialize instruments
        drawArtificalHorizon(0, 0);
        drawPitch(0);
        drawRoll(0);
        drawYaw(0);
        setAltimeter(0);
        setSpeed(0);

        //Buttons
        $('#goHome').on('click', function () {
            command = "return_home\r\n";
            Network.write(command);
            Log.write(command);
        });
    });

    function drawYaw(yaw) {
        //Initialize canvas
        var canvas = document.getElementById("yaw");
        canvas.height = 200;
        canvas.width = 200;
        canvas.title = yaw*180/Math.PI + "°";
        var context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);

        //Ground
        context.fillStyle = "#8bc34a";
        context.beginPath();
        context.arc(100, 100, 100, 0, Math.PI * 2);
        context.fill();

        //Border
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.beginPath();
        context.arc(100, 100, 99, 0, 2 * Math.PI);
        context.stroke();

        //Indicator
        image = new Image();
        image.src = "yaw.png";
        context.translate(36, 36);
        context.translate(64, 64);
        context.rotate(yaw);
        context.drawImage(image, -64, -64);
    }

    function drawRoll(roll) {
        //Initialize canvas
        var canvas = document.getElementById("roll");
        canvas.height = 200;
        canvas.width = 200;
        canvas.title = roll*180/Math.PI + "°";
        var context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);

        //Sky
        context.fillStyle = "#03a9f4";
        context.beginPath();
        context.arc(100, 100, 100, Math.PI, 2 * Math.PI);
        context.fill();

        //Ground
        context.fillStyle = "#8bc34a";
        context.beginPath();
        context.arc(100, 100, 100, 0, Math.PI);
        context.fill();

        //Border
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.beginPath();
        context.arc(100, 100, 99, 0, 2 * Math.PI);
        context.stroke();

        //Indicator
        image = new Image();
        image.src = "roll.png";
        context.translate(36, 36);
        context.translate(64, 64);
        context.rotate(roll);
        context.drawImage(image, -64, -64);
    }

    function drawPitch(pitch) {
        //Initialize canvas
        var canvas = document.getElementById("pitch");
        canvas.height = 200;
        canvas.width = 200;
        canvas.title = pitch*180/Math.PI + "°";
        var context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);

        //Sky
        context.fillStyle = "#03a9f4";
        context.beginPath();
        context.arc(100, 100, 100, Math.PI, 2 * Math.PI);
        context.fill();

        //Ground
        context.fillStyle = "#8bc34a";
        context.beginPath();
        context.arc(100, 100, 100, 0, Math.PI);
        context.fill();

        //Border
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.beginPath();
        context.arc(100, 100, 99, 0, 2 * Math.PI);
        context.stroke();

        //Indicator
        image = new Image();
        image.src = "pitch.png";
        context.translate(36, 36);
        context.translate(64, 64);
        context.rotate(pitch);
        context.drawImage(image, -64, -64);
    }

    function drawArtificalHorizon(roll, pitch) {
        //Initialize canvas
        var canvas = document.getElementById("horizon");
        canvas.height = 200;
        canvas.width = 200;
        var context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);

        //Sky
        context.fillStyle = "#03a9f4";
        context.beginPath();
        context.arc(100, 100, 100, Math.PI + roll - pitch, 2 * Math.PI + roll + pitch);
        context.fill();

        //Ground
        context.fillStyle = "#795548";
        context.beginPath();
        context.arc(100, 100, 100, 0 + roll + pitch, Math.PI + roll - pitch);
        context.fill();

        //Border
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.beginPath();
        context.arc(100, 100, 99, 0, 2 * Math.PI);
        context.stroke();

        //Center
        context.fillStyle = "black";
        context.beginPath();
        context.lineWidth = 2;
        context.arc(100, 100, 2, 0, 2 * Math.PI);
        context.fill();
        context.beginPath();
        context.moveTo(120, 100);
        context.lineTo(110, 100);
        context.stroke();
        context.arc(100, 100, 10, 0, Math.PI);
        context.stroke();
        context.lineTo(80, 100);
        context.stroke();
    }

    function setSpeed(speed) {
        var altimeter = $('#speed')
        altimeter.empty()
        var newItem = $('<div class="logText">' + speed + ' m/s</div>');
        altimeter.append(newItem);
    }

    function setAltimeter(altitude) {
        var altimeter = $('#altimeter')
        altimeter.empty()
        var newItem = $('<div class="logText">' + altitude + ' m</div>');
        altimeter.append(newItem);
    }

    Network.on('data', updateCockpit);

    function updateCockpit() {
        var flightData = Data.state;
        roll = flightData.roll * (Math.PI / 180);
        pitch = flightData.pitch * (Math.PI / 180);
        yaw = flightData.yaw * (Math.PI / 180);
        lat = flightData.lat;
        lon = flightData.lon;
        altitude = flightData.altitude;
        heading = flightData.heading;
        speed = flightData.ground_speed;

        drawArtificalHorizon(roll, pitch);
        drawPitch(pitch);
        drawRoll(roll);
        drawYaw(yaw);
        setAltimeter(altitude);
        setSpeed(speed);
    }

    // Don't export anything
    return {};

})($, Data, Log, Network);