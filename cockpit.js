// Data object contains values read from data-relay
// Accessed with Data.state.______
//
// updateCockpit() is called whenever data is recieved

var Cockpit = (function ($, Data, Log, Network) {

    $(document).ready(function () {
        //Initialize instruments
        drawArtificalHorizon(0, 0);
        drawPitch(0, 0);
        drawRoll(0, 0);
        drawYaw(0, 0);
        drawBattery(0);
        drawScale(0, 300, "altimeter", "Altitude");
        drawScale(0, 300, "speed", "Speed");
        displayControlStatus(0);
        displayGPSStatus(0);

        //Buttons
        $('#send_command').on('click', function () {
            var raw_command = document.getElementById("raw_command").value;
            Network.write(raw_command + "\r\n");
        });

        $('#send_autonomous').on('click', function () {
            var e = document.getElementById("pitch_source");
            var pitch_source = e.options[e.selectedIndex].text;
            var e = document.getElementById("roll_source");
            var roll_source = e.options[e.selectedIndex].text;
            var e = document.getElementById("altitude_on");
            var altitude_on = e.options[e.selectedIndex].text;
            var e = document.getElementById("heading_source");
            var heading_source = e.options[e.selectedIndex].text;
            var e = document.getElementById("heading_on");
            var heading_on = e.options[e.selectedIndex].text;
            var e = document.getElementById("pitch_control");
            var pitch_control = e.options[e.selectedIndex].text;
            var e = document.getElementById("roll_control");
            var roll_control = e.options[e.selectedIndex].text;
            var e = document.getElementById("altitude_source");
            var altitude_source = e.options[e.selectedIndex].text;
            var e = document.getElementById("throttle_source");
            var throttle_source = e.options[e.selectedIndex].text;
            var level = 0;

            if (pitch_control === "Rate") {
                level += 0;
            } else if (pitch_control === "Angle") {
                level += 1;
            }

            if (pitch_source === "Controller") {
                level += 0;
            } else if (pitch_source === "Ground Station") {
                level += 2;
            }

            if (roll_control === "Rate") {
                level += 0;
            } else if (roll_control === "Angle") {
                level += 4;
            }

            if (roll_source === "Controller") {
                level += 0;
            } else if (roll_source === "Ground Station") {
                level += 8;
            }

            if (throttle_source === "Controller") {
                level += 0;
            } else if (throttle_source === "Ground Station") {
                level += 16;
            } else if (throttle_source === "Autopilot") {
                level += 32;
            }

            if (altitude_source === "Ground Station") {
                level += 0;
            } else if (altitude_source === "Autopilot") {
                level += 64;
            }

            if (altitude_on === "Off") {
                level += 0;
            } else if (altitude_on === "On") {
                level += 128;
            }

            if (heading_source === "Ground Station") {
                level += 0;
            } else if (heading_source === "Autopilot") {
                level += 256;
            }

            if (heading_on === "Off") {
                level += 0;
            } else if (heading_on === "On") {
                level += 512;
            }

            Network.write("set_autonomousLevel:" + level + "\r\n");
        });

        $('#send_pitch').on('click', function () {
            var pitch_input = document.getElementById("pitch_setpoint").value;
            Network.write("set_pitchAngle:" + pitch_input + "\r\n");
        });

        $('#send_roll').on('click', function () {
            var roll_setpoint = document.getElementById("roll_setpoint").value;
            Network.write("set_rollAngle:" + roll_setpoint + "\r\n");
        });

        $('#send_yaw').on('click', function () {
            var yaw_setpoint = document.getElementById("yaw_setpoint").value;
            Network.write("set_yawAngle:" + yaw_setpoint + "\r\n");
        });

        $('#send_altitude').on('click', function () {
            var altitude_setpoint = document.getElementById("altitude_setpoint_input").value;
            Network.write("set_altitude:" + altitude_setpoint + "\r\n");
        });

        $('#send_speed').on('click', function () {
            var speed_setpoint = document.getElementById("speed_setpoint_input").value;
            Network.write("set_speed:" + speed_setpoint + "\r\n");
        });

        $('#send_setpoints').on('click', function () {
            var throttle_input = document.getElementById("throttle_setpoint_input").value;
            var heading_input = document.getElementById("heading_setpoint_input").value;

            Network.write("set_throttle:" + throttle_input + "\r\n");
            Network.write("set_heading:" + heading_input + "\r\n");
        });

        $('#sendGains').on('click', function () {
            var flightData = Data.state;
            var editing_gain = parseInt(flightData.editing_gain);
            var kdInput = document.getElementById("kdInput").value;
            var kpInput = document.getElementById("kpInput").value;
            var kiInput = document.getElementById("kiInput").value;

            if (editing_gain === 1) {
                Network.write("set_yawKDGain:" + kdInput + "\r\n");
                Network.write("set_yawKPGain:" + kpInput + "\r\n");
                Network.write("set_yawKIGain:" + kiInput + "\r\n");
            } else if (editing_gain === 2) {
                Network.write("set_pitchKDGain:" + kdInput + "\r\n");
                Network.write("set_pitchKPGain:" + kpInput + "\r\n");
                Network.write("set_pitchKIGain:" + kiInput + "\r\n");
            } else if (editing_gain === 3) {
                Network.write("set_rollKDGain:" + kdInput + "\r\n");
                Network.write("set_rollKPGain:" + kpInput + "\r\n");
                Network.write("set_rollKIGain:" + kiInput + "\r\n");
            } else if (editing_gain === 4) {
                Network.write("set_headingKDGain:" + kdInput + "\r\n");
                Network.write("set_headingKPGain:" + kpInput + "\r\n");
                Network.write("set_headingKIGain:" + kiInput + "\r\n");
            } else if (editing_gain === 5) {
                Network.write("set_altitudeKDGain:" + kdInput + "\r\n");
                Network.write("set_altitudeKPGain:" + kpInput + "\r\n");
                Network.write("set_altitudeKIGain:" + kiInput + "\r\n");
            } else if (editing_gain === 6) {
                Network.write("set_throttleKDGain:" + kdInput + "\r\n");
                Network.write("set_throttleKPGain:" + kpInput + "\r\n");
                Network.write("set_throttleKIGain:" + kiInput + "\r\n");
            } else {
                Log.write("Error sending gains: Plane not in autonomous mode");
            }
        });

        $('#gainSelect').on('click', function () {
            var e = document.getElementById("gainSelect");
            var selectedOpt = e.options[e.selectedIndex].text;
            var command = "set_showGain:";

            if (selectedOpt === "Yaw")
                command += "0x00";
            else if (selectedOpt === "Pitch")
                command += "0x01";
            else if (selectedOpt === "Roll")
                command += "0x02";
            else if (selectedOpt === "Heading")
                command += "0x03";
            else if (selectedOpt === "Altitude")
                command += "0x04";
            else if (selectedOpt === "Throttle")
                command += "0x05";

            command += "\r\n";
            Network.write(command);
        });
    });

    function drawYaw(yaw, yaw_setpoint) {
        //Initialize canvas
        var canvas = document.getElementById("yaw");
        canvas.height = 200;
        canvas.width = 200;
        canvas.title = yaw * 180 / Math.PI + "°";
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

        //Text
        var yawText = (parseFloat(yaw) * (180 / Math.PI)).toFixed(2);
        yawText = yawText.toString() + "°";
        context.fillStyle = "black";
        context.font = "20px Calibri";
        context.textAlign = "center";
        context.fillText(yawText, 100, 30);

        //Setpoint
        yaw_setpoint = (parseFloat(yaw_setpoint)).toFixed(2);
        yaw_setpoint = yaw_setpoint.toString() + "°";
        context.fillStyle = "black";
        context.font = "20px Calibri";
        context.textAlign = "center";
        context.fillText(yaw_setpoint, 100, 170);
        context.lineWidth = 2;
        context.rect(60, 150, 76, 30);
        context.stroke();

        //Indicator
        image = document.createElement('img');
        image.src = "yaw.png";
        context.translate(36, 36);
        context.translate(64, 64);
        context.rotate(yaw);
        context.drawImage(image, -64, -64);
    }

    function drawRoll(roll, roll_setpoint) {
        roll = -roll;
        //Initialize canvas
        var canvas = document.getElementById("roll");
        canvas.height = 200;
        canvas.width = 200;
        canvas.title = roll * 180 / Math.PI + "°";
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

        //Text
        var rollText = (parseFloat(roll) * (180 / Math.PI)).toFixed(2);
        rollText = rollText.toString() + "°";
        context.fillStyle = "black";
        context.font = "20px Calibri";
        context.textAlign = "center";
        context.fillText(rollText, 100, 30);

        //Setpoint
        roll_setpoint = (parseFloat(roll_setpoint)).toFixed(2);
        roll_setpoint = roll_setpoint.toString() + "°";
        context.fillStyle = "black";
        context.font = "20px Calibri";
        context.textAlign = "center";
        context.fillText(roll_setpoint, 100, 170);
        context.lineWidth = 2;
        context.rect(60, 150, 76, 30);
        context.stroke();

        //Indicator
        image = document.createElement('img');
        image.src = "roll.png";
        context.translate(36, 36);
        context.translate(64, 64);
        context.rotate(roll);
        context.drawImage(image, -64, -64);
    }

    function drawPitch(pitch, pitch_setpoint) {
        //Initialize canvas
        var canvas = document.getElementById("pitch");
        canvas.height = 200;
        canvas.width = 200;
        canvas.title = pitch * 180 / Math.PI + "°";
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

        //Text
        var pitchText = (parseFloat(pitch) * (180 / Math.PI)).toFixed(2);
        pitchText = pitchText.toString() + "°";
        context.fillStyle = "black";
        context.font = "20px Calibri";
        context.textAlign = "center";
        context.fillText(pitchText, 100, 30);

        //Setpoint
        pitch_setpoint = (parseFloat(pitch_setpoint)).toFixed(2);
        pitch_setpoint = pitch_setpoint.toString() + "°";
        context.fillStyle = "black";
        context.font = "20px Calibri";
        context.textAlign = "center";
        context.fillText(pitch_setpoint, 100, 170);
        context.lineWidth = 2;
        context.rect(60, 150, 76, 30);
        context.stroke();

        //Indicator
        image = document.createElement('img');
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

    function drawBattery(batteryLevel) {
        //Initialize canvas
        var canvas = document.getElementById("battery");
        canvas.height = 30;
        canvas.width = 50;
        var context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);

        //Outline
        context.fillStyle = "black";
        context.lineWidth = 2;
        context.rect(2, 2, 44, 26);
        context.stroke();
        context.fillRect(0, 10, 2, 10);
        context.stroke();

        //Fill
        if (batteryLevel <= 100 && batteryLevel >= 70) {
            context.fillStyle = "#4caf50";
        } else if (batteryLevel >= 20 && batteryLevel < 70) {
            context.fillStyle = "#cddc39";
        } else {
            context.fillStyle = "#f44336";
        }
        context.fillRect(3.5, 3, batteryLevel * 0.42, 23.5);

        //Text
        context.fillStyle = "black";
        context.font = "16px Calibri";
        context.textAlign = "center";
        context.fillText(batteryLevel + "%", 25, 20);
    }

    function drawScale(value, height, canvasName, title) {
        value = value.toFixed(2);
        var canvas = document.getElementById(canvasName);
        var context = canvas.getContext("2d");
        canvas.width = 120;
        canvas.height = height;
        width = canvas.width;
        context.clearRect(0, 0, canvas.width, canvas.height);

        //draw the values
        context.font = '15pt Calibri';
        context.fillText(title, 50, 20);

        //constants
        BOX_HEIGHT = 30;
        BOX_WIDTH = 80;
        OFFSET = 40;

        //draw the meter
        context.beginPath();
        context.rect(OFFSET, height / 2 - BOX_HEIGHT / 2, BOX_WIDTH, BOX_HEIGHT);
        context.rect(0, 0, OFFSET, height);
        context.lineWidth = 2;
        context.strokeStyle = 'white';
        context.stroke();

        //draw the values
        context.font = '20pt Calibri';
        mid = height / 2 + BOX_HEIGHT / 2 - 5;

        //draw the scaling
        context.fillText(value, OFFSET + 2, mid);
        context.textAlign = "end";
        context.font = '10pt Calibri';
        A = 20;
        B = 0.1;

        for (i = mid; i < height; i += B) {
            if ((value - (i - mid)).toFixed(1) % 1 == 0) {
                context.fillText((value - (i - mid)).toFixed(1), OFFSET - 2, i * A - (A - 1) * mid - 2);
            }
        }
        for (i = mid; i > 0; i -= B) {
            if ((value - (i - mid)).toFixed(1) % 1 == 0) {
                context.fillText((value - (i - mid)).toFixed(1), OFFSET - 2, i * A - (A - 1) * mid - 2);
            }
        }
    }

    function displayControlStatus(editing_gain) {
        var canvas = document.getElementById("control_status");
        canvas.height = 30;
        canvas.width = 100;
        var context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);

        context.font = '20px Calibri';
        context.textAlign = "center";
        context.fillStyle = "white";

        var text;
        if (editing_gain === 0 || editing_gain === 18) {
            text = "MANUAL";
        } else {
            text = "AUTOPILOT";
        }

        context.fillText(text, 50, 20);
    }

    function displayGPSStatus(gpsStatus) {
        var canvas = document.getElementById("gps_status");
        canvas.height = 30;
        canvas.width = 50;
        var context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);

        gpsStatus = parseInt(gpsStatus);
        gpsSatellites = gpsStatus % 16;
        gpsFix = parseInt(gpsStatus / 16);

        if (gpsFix === 2) {
            context.fillStyle = "#4caf50";
        } else if (gpsFix === 1) {
            context.fillStyle = "#cddc39";
        } else {
            context.fillStyle = "#f44336";
        }
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.font = '20px Calibri';
        context.textAlign = "center";
        context.fillStyle = "white";

        context.fillText(gpsSatellites, 25, 20);
    }

    Network.on('data', updateCockpit);

    //Checks nth bit for x
    function checkBit(x, n) {
        return (x >> (n - 1)) & 1;
    }

    function updateCockpit() {
        var flightData = Data.state;
        var roll = flightData.roll * (Math.PI / 180);
        var pitch = flightData.pitch * (Math.PI / 180);
        var yaw = flightData.yaw * (Math.PI / 180);
        var altitude = parseFloat(flightData.altitude);
        var heading = flightData.heading;
        var ground_speed = parseFloat(flightData.ground_speed);
        var batteryLevel = Math.round(parseFloat(flightData.batteryLevel));
        var editing_gain = parseInt(flightData.editing_gain);
        var gpsStatus = flightData.gpsStatus;
        var kd_gain = flightData.kd_gain;
        var kp_gain = flightData.kp_gain;
        var ki_gain = flightData.ki_gain;
        var roll_setpoint = flightData.roll_setpoint;
        var pitch_setpoint = flightData.pitch_setpoint;
        var yaw_setpoint = flightData.yaw_setpoint;
        var time = flightData.time;

        //Used in path.js for some reason
        lat = flightData.lat;
        lon = flightData.lon;

        drawArtificalHorizon(roll, pitch);
        drawPitch(pitch, pitch_setpoint);
        drawRoll(roll, roll_setpoint);
        drawYaw(yaw, yaw_setpoint);
        drawBattery(batteryLevel);
        displayControlStatus(editing_gain);
        displayGPSStatus(gpsStatus);
        drawScale(altitude, 300, "altimeter", "Altitude");
        drawScale(ground_speed, 300, "speed", "Speed");
        displayCurrentGains(editing_gain, kd_gain, kp_gain, ki_gain);
        displaySetpointsAndRates();
        writeToDiv("#time", time);
        tabs();
    }

    function writeToDiv(div, string) {
        var div = $(div)
        if (div.children().length === 1) {
            div.children()[0].remove();
        }
        var newItem = $('<div>' + string + '</div>');
        div.append(newItem);
    }

    function displaySetpointsAndRates() {
        var flightData = Data.state;
        var throttle_setpoint = flightData.throttle_setpoint;
        var altitude_setpoint = flightData.altitude_setpoint;
        var heading_setpoint = flightData.heading_setpoint;
        var speed_setpoint = flightData.speed_setpoint;
        var roll_rate = flightData.roll_rate;
        var pitch_rate = flightData.pitch_rate;
        var yaw_rate = flightData.yaw_rate;

        writeToDiv('#throttle_setpoint_display', throttle_setpoint);
        writeToDiv('#altitude_setpoint_display', altitude_setpoint);
        writeToDiv('#heading_setpoint_display', heading_setpoint);
        writeToDiv('#speed_setpoint_display', speed_setpoint);
        writeToDiv('#pitch_rate', pitch_rate);
        writeToDiv('#roll_rate', roll_rate);
        writeToDiv('#yaw_rate', yaw_rate);
    }

    function displayCurrentGains(editing_gain, kd_gain, kp_gain, ki_gain) {
        if (editing_gain === 1)
            editing_gain = "Yaw";
        else if (editing_gain === 2) {
            editing_gain = "Pitch";
        } else if (editing_gain === 3) {
            editing_gain = "Roll";
        } else if (editing_gain === 4) {
            editing_gain = "Heading";
        } else if (editing_gain === 5) {
            editing_gain = "Altitude";
        } else if (editing_gain === 6) {
            editing_gain = "Throttle";
        } else {
            editing_gain = "N/A";
        }

        writeToDiv('#current_gain', editing_gain);
        writeToDiv('#current_kd', kd_gain);
        writeToDiv('#current_ki', kp_gain);
        writeToDiv('#current_kp', ki_gain);
    }

    $(function tabs() {
      $( "#tabs" ).tabs();
    });

    // Don't export anything
    return {};

})($, Data, Log, Network);
