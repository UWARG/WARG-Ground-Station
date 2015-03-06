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
        drawBattery(0);
        drawScale(0,"altimeter");

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

        //Text
        var yawText = (parseFloat(yaw) * (180/Math.PI)).toFixed(2);
        yawText = yawText.toString() + "°";
        context.fillStyle = "black";
        context.font = "20px Calibri";
        context.textAlign="center";
        context.fillText(yawText, 100, 30);

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

        //Text
        var rollText = (parseFloat(roll) * (180/Math.PI)).toFixed(2);
        rollText = rollText.toString() + "°";
        context.fillStyle = "black";
        context.font = "20px Calibri";
        context.textAlign="center";
        context.fillText(rollText, 100, 30);

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

        //Text
        var pitchText = (parseFloat(pitch) * (180/Math.PI)).toFixed(2);
        pitchText = pitchText.toString() + "°";
        context.fillStyle = "black";
        context.font = "20px Calibri";
        context.textAlign="center";
        context.fillText(pitchText, 100, 30);

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
        canvas.height = 60;
        canvas.width = 100;
        var context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);

        //Outline
        context.fillStyle = "black";
        context.lineWidth = 5;
        context.rect(10,5,80,50);
        context.stroke();
        context.fillRect(0,20,10,20);
        context.stroke();

        //Fill
        if (batteryLevel <= 100 && batteryLevel >= 80) {
            context.fillStyle = "green";
        }
        else if (batteryLevel >= 20 && batteryLevel < 80) {
            context.fillStyle = "yellow";
        }
        else {
            context.fillStyle = "red";
        }
        context.fillRect(13,8,batteryLevel*0.75,44);

        //Text
        context.fillStyle = "black";
        context.font = "20px Calibri";
        context.textAlign="center";
        context.textAlign="center";
        context.fillText(batteryLevel + "%", 50, 35);
    }

    function drawScale(speed, height, title){
      var c = document.getElementById("myCanvas");
      var ctx = c.getContext("2d");
      c.width = 310;
      c.height = height;

      //draw the values
      ctx.font = '15pt Calibri';
      ctx.fillText(title,0,20);

      //constants
      var BOX_HEIGHT = 30;
      var BOX_WIDTH = 70;
      var OFFSET = 40;

      //draw the meter
      ctx.beginPath();
      ctx.rect(OFFSET,height/2-BOX_HEIGHT/2, BOX_WIDTH, BOX_HEIGHT);
      ctx.rect(0,30,OFFSET,height-30);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'black';
      ctx.stroke();

      //draw the values
      ctx.font = '20pt Calibri';
      var mid = height/2+BOX_HEIGHT/2-5.0;

      //draw the scaling
      ctx.fillText(speed, OFFSET+2, mid);
      ctx.textAlign="end";
      ctx.font = '10pt Calibri';
      var A = 20;
      var B= 0.1;
      for (i = mid; i<height; i+=B){
        if ((speed-(i-mid)).toFixed(1) % 1 == 0)
          ctx.fillText((speed-(i-mid)).toFixed(1),OFFSET-2,i*A-(A-1)*mid-2);
      }
      for (i = mid; i>154; i-=B){
        if ((speed-(i-mid)).toFixed(1) % 1 == 0)
          ctx.fillText((speed-(i-mid)).toFixed(1),OFFSET-2,i*A-(A-1)*mid-2);
      }
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
        batteryLevel = Math.round(flightData.batteryLevel);
        editing_gain = flightData.editing_gain;
        gpsStatus = flightData.gpsStatus;

        drawArtificalHorizon(roll, pitch);
        drawPitch(pitch);
        drawRoll(roll);
        drawYaw(yaw);
        drawBattery(batteryLevel);
        status(editing_gain);
        gps(gpsStatus);
        drawScale(altitude,"altimeter","Altitude");
        drawScale(speed,"speed","Altitude");
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

    // Don't export anything
    return {};

})($, Data, Log, Network);
