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
        image = document.createElement('img');
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
        image = document.createElement('img');
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
        editing_gain = flightData.editing_gain;
        gpsStatus = flightData.gpsStatus;
        kd_gain = flightData.kd_gain;
        kp_gain = flightData.kp_gain;
        ki_gain = flightData.ki_gain;

        drawArtificalHorizon(roll, pitch);
        drawPitch(pitch);
        drawRoll(roll);
        drawYaw(yaw);
        setAltimeter(altitude);
        setSpeed(speed);
        status(editing_gain);
        gps(gpsStatus);
        currentGains(editing_gain, kd_gain, kp_gain, ki_gain);
    }

    function status(stat)
    {
      var statusCanva = document.getElementById("statusCanva").getContext("2d");
      statusCanva.font='30px Calibri';
      statusCanva.fillStyle = "black";

      if (stat === "0x00")
        statusCanva.fillText("MANUAL",13,50,75);
      else
        statusCanva.fillText("AUTOPILOT",15,50,75);
    }

    function gps(gpsStatus)
    {
      var gpsCanva = document.getElementById("gpsCanva").getContext("2d");
      gpsCanva.font='35px Calibri';
      gpsCanva.fillStyle = "black";

      if(gpsStatus === "0x1A")
      {
        gpsCanva.fillStyle = "green";
        gpsCanva.fillText("4",15,25,20);
      }
      else if (gpsStatus === "0x24")
      {
        gpsCanva.fillStyle ="green";
        gpsCanva.fillText("10",15,25,20);
      }
      else
      {
        gpsCanva.fillStyle ="red";
        gpsCanva.fillText("0",15,25,20);
      }
    }

    function currentGains(editing_gain, kd_gain, kp_gain, ki_gain)
    {
      var xText = 50;
      var yText = 15;
      var widthText = 25;

      var gainSelect = document.getElementById("gainSelect");
      var kdInput = document.getElementById("kdInput").value;
      var kpInput = document.getElementById("kpInput").value;
      var kiInput = document.getElementById("kiInput").value;

      var currentCanva = document.getElementById("currentCanva").getContext("2d");
      var kdCanva = document.getElementById("kdCanva").getContext("2d");
      var kpCanva = document.getElementById("kpCanva").getContext("2d");
      var kiCanva = document.getElementById("kiCanva").getContext("2d");

      currentCanva.font='15px Calibri';
      currentCanva.fillStyle = "black";
      kdCanva.font='15px Calibri';
      kdCanva.fillStyle = "black";
      kpCanva.font='15px Calibri';
      kpCanva.fillStyle = "black";
      kiCanva.font='15px Calibri';
      kiCanva.fillStyle = "black";

      if(editing_gain === "0x01")
        editing_gain = "yaw";
      else if(editing_gain === "0x02")
      {
        editing_gain = "pitch";
        xText = 47;
        widthText = 35;
      }
      else if(editing_gain === "0x03")
      {
        editing_gain = "roll";
        xText = 52;
        widthText = 27;
      }
      else if(editing_gain === "0x04")
      {
        editing_gain = "heading";
        xText = 40;
        widthText = 50;
      }
      else if(editing_gain === "0x05")
      {
        editing_gain = "altitude";
        xText = 37;
        widthText = 55;
      }
      else if(editing_gain === "0x06")
      {
        editing_gain = "throttle";
        xText = 37;
        widthText = 45;
      }

      currentCanva.fillText(editing_gain,xText,yText,widthText);
      kdCanva.fillText(kd_gain,60,15,25);
      kiCanva.fillText(ki_gain,60,15,25);
      kpCanva.fillText(kp_gain,60,15,25);

      function onSelectedOption(selectedOpt)
      {
        if(selectedOpt === "yaw")
          Network.write("set_showGain"+"0x00"+"\r\n");
        else if(selectedOpt === "pitch")
          Network.write("set_showGain"+"0x01"+"\r\n");
        else if(selectedOpt === "roll")
          Network.write("set_showGain"+"0x02"+"\r\n");
        else if(selectedOpt === "heading")
          Network.write("set_showGain"+"0x03"+"\r\n");
        else if(selectedOpt === "altitude")
          Network.write("set_showGain"+"0x04"+"\r\n");
        else if(selectedOpt === "throttle")
          Network.write("set_showGain"+"0x05"+"\r\n");
      }

      function onClickSend()
      {
        if(editing_gain === "yaw")
        {
          Network.write("set_yawKDGain"+"kdInput"+"\r\n");
          Network.write("set_yawKPGain"+"kpCanva"+"\r\n");
          Network.write("set_yawKIGain"+"kiInput"+"\r\n");
        }
        else if(editing_gain === "pitch")
        {
          Network.write("set_pitchKDGain"+"kdInput"+"\r\n");
          Network.write("set_pitchKPGain"+"kpCanva"+"\r\n");
          Network.write("set_pitchKIGain"+"kiInput"+"\r\n");
        }
        else if(editing_gain === "roll")
        {
          Network.write("set_rollKDGain"+"kdInput"+"\r\n");
          Network.write("set_rollKPGain"+"kpCanva"+"\r\n");
          Network.write("set_rollKIGain"+"kiInput"+"\r\n");
        }
        else if(editing_gain === "heading")
        {
          Network.write("set_headingKDGain"+"kdInput"+"\r\n");
          Network.write("set_headingKPGain"+"kpCanva"+"\r\n");
          Network.write("set_headingKIGain"+"kiInput"+"\r\n");
        }
        else if(editing_gain === "altitude")
        {
          Network.write("set_altitudeKDGain"+"kdInput"+"\r\n");
          Network.write("set_altitudeKPGain"+"kpCanva"+"\r\n");
          Network.write("set_altitudeKIGain"+"kiInput"+"\r\n");
        }
        else if(editing_gain === "throttle")
        {
          Network.write("set_throttleKDGain"+"kdInput"+"\r\n");
          Network.write("set_throttleKPGain"+"kpCanva"+"\r\n");
          Network.write("set_throttleKIGain"+"kiInput"+"\r\n");
        }
      }
    }

    // Don't export anything
    return {};

})($, Data, Log, Network);
