// FlightData object contains values read from data-relay
// Accessed with FlightData["Value"]
//
// UpdateUI() is called whenever data is recieved

$(document).ready(function () {
    //Initialize instruments
    DrawArtificalHorizon(0, 0);
    DrawPitch(0);
    DrawRoll(0);
    DrawYaw(0);
    SetAltimeter(0);
    SetSpeed(0);

    //Buttons
    $('#goHome').on('click', function () {
            command = "return_home\r\n";
            client.write(command);
            WriteToLog(command);
    });
});

function WriteToLog(text) {
    var logDiv = $('#log')
    if (logDiv.children().length === 3) {
        logDiv.children()[0].remove();
    }
    var newItem = $('<div class="logText">' + text + '</div>');
    logDiv.append(newItem);
}

function DrawYaw(yaw) {
    //Initialize canvas
    var canvas = document.getElementById("yaw");
    canvas.height = 200;
    canvas.width = 200;
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

function DrawRoll(roll) {
    //Initialize canvas
    var canvas = document.getElementById("roll");
    canvas.height = 200;
    canvas.width = 200;
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

function DrawPitch(pitch) {
    //Initialize canvas
    var canvas = document.getElementById("pitch");
    canvas.height = 200;
    canvas.width = 200;
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

function DrawArtificalHorizon(roll, pitch) {
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

function SetSpeed(speed) {
    var altimeter = $('#speed')
    altimeter.empty()
    var newItem = $('<div class="logText">' + speed + '</div>');
    altimeter.append(newItem);
}

function SetAltimeter(altitude) {
    var altimeter = $('#altimeter')
    altimeter.empty()
    var newItem = $('<div class="logText">' + altitude + '</div>');
    altimeter.append(newItem);
}

function UpdateUI() {
    roll = FlightData["roll"] * (Math.PI / 180);
    pitch = FlightData["pitch"] * (Math.PI / 180);
    yaw = FlightData["yaw"] * (Math.PI / 180);
    lat = FlightData["lat"];
    lon = FlightData["lon"];
    altitude = FlightData["altitude"];
    heading = FlightData["heading"];
    speed = FlightData["ground_speed"];

    DrawArtificalHorizon(roll, pitch);
    DrawPitch(pitch);
    DrawRoll(roll);
    DrawYaw(yaw);
    SetAltimeter(altitude);
    SetSpeed(speed);

    //In path.js
    if (!isNaN(lat) || !isNaN(lon)) {
        UpdateMap(lat, lon, heading);
    }
}