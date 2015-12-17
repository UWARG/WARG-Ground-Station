// Data object contains values read from data-relay
// Accessed with Data.state.______
//
// updateCockpit() is called whenever data is recieved

var Cockpit = (function ($, Data, Log, Network, Mousetrap) {

    var dataRelay = Network.dataRelay;
    var KD = [0,0,0,0,0,0,0];
    var KP = [0,0,0,0,0,0,0];
    var KI = [0,0,0,0,0,0,0];

    $(document).ready(function () {
        //Initialize instruments
        drawArtificalHorizon(0, 0);
        drawPitch(0, 0);
        drawRoll(0, 0);
        drawHeading(0, 0);
        drawBattery(0);
        drawScale(0, 250, "altimeter", "Altitude");
        drawScale(0, 250, "speed", "Speed");
        displayControlStatus(0);
        displayGPSStatus(0);

        $("#tabs").tabs();

        //Buttons
        var last_raw_command = "";
        $('#send_command').on('click', function () {
            var raw_command = document.getElementById("raw_command").value;
            last_raw_command = raw_command;
            dataRelay.write(raw_command + "\r\n");
            document.getElementById("raw_command").value = "";
        });


        function setSelectedIndex(s, i){
            s.options[i-1].selected = true;
            return;
        }

        $('#set_controller').on('click', function(){

            //set all the select boxes to the first element
            document.getElementById("pitch_source").options[0].selected = true;
            document.getElementById("roll_source").options[0].selected = true;
            document.getElementById("altitude_on").options[0].selected = true;
            document.getElementById("heading_source").options[0].selected = true;
            document.getElementById("heading_on").options[0].selected = true;
            document.getElementById("pitch_control").options[0].selected = true;
            document.getElementById("roll_control").options[0].selected = true;
            document.getElementById("altitude_source").options[0].selected = true;
            document.getElementById("throttle_source").options[0].selected = true;
            document.getElementById("flap_source").options[0].selected = true;

            dataRelay.write("set_autonomousLevel:0" + "\r\n");



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
            var e = document.getElementById("flap_source");
            var flap_source = e.options[e.selectedIndex].text;
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
            if (flap_source === "Controller") {
                level += 0;
            } else if (flap_source === "Ground Station") {
                level += 1024;
            } else if (flap_source === "Autopilot") {
                level += 2048;
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

            dataRelay.write("set_autonomousLevel:" + level + "\r\n");
        });

        $('#send_pitch').on('click', function () {
            var pitch_input = document.getElementById("pitch_setpoint").value;
            dataRelay.write("set_pitchAngle:" + pitch_input + "\r\n");
        });

        $('#send_roll').on('click', function () {
            var roll_setpoint = document.getElementById("roll_setpoint").value;
            dataRelay.write("set_rollAngle:" + roll_setpoint + "\r\n");
        });

        $('#send_heading').on('click', function () {
            var heading_setpoint = document.getElementById("heading_setpoint").value;
            dataRelay.write("set_heading:" + heading_setpoint + "\r\n");
        });

        $('#send_altitude').on('click', function () {
            var altitude_setpoint = document.getElementById("altitude_setpoint_input").value;
            dataRelay.write("set_altitude:" + altitude_setpoint + "\r\n");
        });

        $('#send_speed').on('click', function () {
            var speed_setpoint = document.getElementById("speed_setpoint_input").value;
            dataRelay.write("set_speed:" + speed_setpoint + "\r\n");
        });

        $('#send_throttle').on('click', function () {
            var throttle_input = document.getElementById("throttle_setpoint_input").value;
            dataRelay.write("set_throttle:" + throttle_input + "\r\n");
        });
        

        $('#send_flap').on('click', function () {
            var flap_input = document.getElementById("flap_setpoint_input").value;
            dataRelay.write("set_flap:" + flap_input + "\r\n");
        });

        $('#send_kd').on('click', function () {
            var flightData = Data.state;
            var editing_gain = parseInt(flightData.editing_gain) % 16;
            var kdInput = document.getElementById("kdInput").value;

            KD[editing_gain] = kdInput;

            if (editing_gain === 0) {
                dataRelay.write("set_yawKDGain:" + kdInput + "\r\n");
            } else if (editing_gain === 1) {
                dataRelay.write("set_pitchKDGain:" + kdInput + "\r\n");
            } else if (editing_gain === 2) {
                dataRelay.write("set_rollKDGain:" + kdInput + "\r\n");
            } else if (editing_gain === 3) {
                dataRelay.write("set_headingKDGain:" + kdInput + "\r\n");
            } else if (editing_gain === 4) {
                dataRelay.write("set_altitudeKDGain:" + kdInput + "\r\n");
            } else if (editing_gain === 5) {
                dataRelay.write("set_throttleKDGain:" + kdInput + "\r\n");
            } else if (editing_gain === 6) {
                dataRelay.write("set_flapKDGain:" + kdInput + "\r\n");
            } else {
                Log.error("Cockpit Error sending gains: Plane not in autonomous mode");
            }
        });

        $('#send_kp').on('click', function () {
            var flightData = Data.state;
            var editing_gain = parseInt(flightData.editing_gain) % 16;
            var kpInput = document.getElementById("kpInput").value;

            KP[editing_gain] = kpInput;

            if (editing_gain === 0) {
                dataRelay.write("set_yawKPGain:" + kpInput + "\r\n");
            } else if (editing_gain === 1) {
                dataRelay.write("set_pitchKPGain:" + kpInput + "\r\n");
            } else if (editing_gain === 2) {
                dataRelay.write("set_rollKPGain:" + kpInput + "\r\n");
            } else if (editing_gain === 3) {
                dataRelay.write("set_headingKPGain:" + kpInput + "\r\n");
            } else if (editing_gain === 4) {
                dataRelay.write("set_altitudeKPGain:" + kpInput + "\r\n");
            } else if (editing_gain === 5) {
                dataRelay.write("set_throttleKPGain:" + kpInput + "\r\n");
            } else if (editing_gain === 6) {
                dataRelay.write("set_flapKPGain:" + kpInput + "\r\n");
            } else {
                Log.error("Cockpit Error sending gains: Plane not in autonomous mode");
            }
        });

        $('#send_ki').on('click', function () {
            var flightData = Data.state;
            var editing_gain = parseInt(flightData.editing_gain) % 16;
            var kiInput = document.getElementById("kiInput").value;

            KI[editing_gain] = kiInput;

            if (editing_gain === 0) {
                dataRelay.write("set_yawKIGain:" + kiInput + "\r\n");
            } else if (editing_gain === 1) {
                dataRelay.write("set_pitchKIGain:" + kiInput + "\r\n");
            } else if (editing_gain === 2) {
                dataRelay.write("set_rollKIGain:" + kiInput + "\r\n");
            } else if (editing_gain === 3) {
                dataRelay.write("set_headingKIGain:" + kiInput + "\r\n");
            } else if (editing_gain === 4) {
                dataRelay.write("set_altitudeKIGain:" + kiInput + "\r\n");
            } else if (editing_gain === 5) {
                dataRelay.write("set_throttleKIGain:" + kiInput + "\r\n");
            } else if (editing_gain === 6) {
                dataRelay.write("set_flapKIGain:" + kiInput + "\r\n");
            } else {
                Log.error("Cockpit Error sending gains: Plane not in autonomous mode");
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
            else if (selectedOpt === "Flap")
                command += "0x06";

            command += "\r\n";
            dataRelay.write(command);

            document.getElementById('kdInput').value = KD[e.selectedIndex];
            document.getElementById('kpInput').value = KP[e.selectedIndex];
            document.getElementById('kiInput').value = KI[e.selectedIndex];

        });

        $('#save_comment').on('click', function () {

            var fileName = document.getElementById("send_file").value;
            var comment = document.getElementById("send_comment").value;

            var fs = require('fs');
            var wstream = fs.createWriteStream(fileName + ".txt", {
                'flags': 'a',
                'encoding': null,
                'mode': 0666
            });
            wstream.write("New Input ====\r\n");
            var flightData = Data.state;
            wstream.write("currentTime: " + flightData.time + "\r\n");
            wstream.write("currentThrottle: " + flightData.throttle_setpoint + "\r\n");
            wstream.write("currentFlap: " + flightData.flap_setpoint + "\r\n");
            wstream.write("currentAirspeed: " + flightData.airspeed + "\r\n");
            wstream.write("roll: " + flightData.roll * (Math.PI / 180) + "\r\n");
            wstream.write("pitch: " + flightData.pitch * (Math.PI / 180) + "\r\n");
            wstream.write("yaw: " + flightData.yaw * (Math.PI / 180) + "\r\n");
            wstream.write("altitude: " + parseFloat(flightData.altitude) + "\r\n");
            wstream.write("heading: " + flightData.heading + "\r\n");
            wstream.write("ground speed: " + parseFloat(flightData.ground_speed) + "\r\n");
            wstream.write("battery level: " + Math.round(parseFloat(flightData.batteryLevel)) + "\r\n");
            wstream.write("editing gain: " + parseInt(flightData.editing_gain) + "\r\n");
            wstream.write("gps status: " + flightData.gpsStatus + "\r\n");
            wstream.write("kd gain: " + flightData.kd_gain + "\r\n");
            wstream.write("kp gain: " + flightData.kp_gain + "\r\n");
            wstream.write("ki gain: " + flightData.ki_gain + "\r\n");
            wstream.write("roll setpoint: " + flightData.roll_setpoint + "\r\n");
            wstream.write("pitch setpoint: " + flightData.pitch_setpoint + "\r\n");
            wstream.write("yaw setpoint: " + flightData.yaw_setpoint + "\r\n");
            wstream.write("Comment: " + comment + "\r\n\r\n");
            wstream.end();
            document.getElementById("send_file").value = "";
            document.getElementById("send_comment").value = "";


            Log.info("Cockpit Comment successfully written to " + fileName + ".txt");
        });

        $('#load_kValue').on('click', function () {
            var f = $('<input type="file" id="pathLoadFile" accept=".setting,.kval">').click();
            f.one('change', function () {
                var fs = require('fs');
                if (!f[0].files[0]) return;
                var filepath = f[0].files[0].path;
                var filename = f[0].files[0].name;
                
                var txt = fs.readFileSync(filepath);
                var lines = txt.toString().split(';');
                var KDValues = [0,0,0,0,0,0,0];
                var KPValues = [0,0,0,0,0,0,0];
                var KIValues = [0,0,0,0,0,0,0];

                var i;
                for (i = 0; i < lines.length; i++) {
                    var splitLine = lines[i].toString().split('=', 2); //first element is var, second element value

                    //switch variable
                    switch(splitLine[0].trim()){
                        case 'date':
                        break;
                        case 'time':
                        break;
                        case '':break;

                        default: //assumed to be a K value
                            //Log.info("line: " + i + " var: " +  splitLine[0] + " val: " + splitLine[1]);
                            var splitVar = splitLine[0].toString().split('K', 2); //first element channel, second element K type
                            var index;
                            switch(splitVar[0].toString().trim()){
                                case 'yaw':
                                    index = 0;
                                break;
                                case 'pitch':
                                    index = 1;
                                break;
                                case 'roll':
                                    index = 2;
                                break;
                                case 'heading':
                                    index = 3;
                                break;
                                case 'altitude':
                                    index = 4;
                                break;
                                case 'throttle':
                                    index = 5;
                                break;
                                case 'flap':
                                    index = 6;
                                break;
                            }
                            switch(splitVar[1].toString().trim()){
                                case 'D':
                                    KDValues[index] = splitLine[1].toString().trim();
                                break;
                                case 'P':
                                    KPValues[index] = splitLine[1].toString().trim();
                                break;
                                case 'I':
                                    KIValues[index] = splitLine[1].toString().trim();
                                break;
                            }
                            //dataRelay.write("set_" + splitLine[0].toString().trim() + "Gain:" + splitLine[1].toString().trim());
                            
                        break;
                    }                    
                }
                KD = KDValues;
                KP = KPValues;
                KI = KIValues;
                dataRelay.write("set_KDValues:"+ KDValues +"\r\n");
                dataRelay.write("set_KPValues:"+ KPValues +"\r\n");
                dataRelay.write("set_KIValues:"+ KIValues +"\r\n");
                Log.info("K values Loaded " + filename + ".kval");
            });
        });

        $('#save_kValue').on('click', function () {
            var fs = require('fs');
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth()+1; //January is 0!
            var yyyy = today.getFullYear();
            var hh = today.getHours();
            var MM = today.getMinutes();
            var ss = today.getSeconds();
            if(dd<10) {
                dd='0'+dd
            } 
            if(mm<10) {
                mm='0'+mm
            } 
            if(hh<10) {
                hh='0'+hh
            } 
            if(MM<10) {
                MM='0'+MM
            } 
            if(ss<10) {
                ss='0'+ss
            }

            
            var f = $('<input type="file" id="pathSaveFile" nwsaveas="K_Values.kval" accept=".kval">').click();
            f.one('change', function () {
                if (!f[0].files[0]) return;
                var filepath = f[0].files[0].path;
                var filename = f[0].files[0].name;

                Log.info(filepath);

                var txt = "date=" + mm+'/'+dd+'/'+yyyy + ";\r\n";
                txt = txt +"time=" + hh + ":" + mm + ":" + ss + ";\r\n\r\n";

                var i;
                Log.info("Saving...");

                var options = document.getElementById('gainSelect').options;

                for(i=0; i<7; i++){
                    
                    txt = txt + options[i].value + "KD=" + KD[i] + ";\r\n";
                    txt = txt + options[i].value + "KP=" + KP[i] + ";\r\n";
                    txt = txt + options[i].value + "KI=" + KI[i] + ";\r\n\r\n";
                }
                

                fs.writeFile(filepath, txt, function (err) {
                    if (err) throw err;
                    Log.info("File saved: " + filename);
                });
            });
        });

        $('#toggle_map').on('click', function () {
            var button = document.getElementById("toggle_map");
            if(!button.checked){
                document.getElementById("path").style.visibility = 'hidden';
                document.getElementById("cockpit").style.width = '100%';
                document.getElementById("log").style.width = '100%';
            }else{
                document.getElementById("path").style.visibility = 'visible';
                document.getElementById("cockpit").style.width = '65%';
                document.getElementById("log").style.width = '65%';
            }
            

        });

        $('#toggle_buttons').on('click', function () {
            var button = document.getElementById("toggle_buttons");
            if(!button.checked){
                document.getElementById("emergency_buttons").style.visibility = 'hidden';
                document.getElementById("emergency_buttons").style.width = '0px';
                //document.getElementById("log").style.width = '100%';
            }else{
                document.getElementById("emergency_buttons").style.visibility = 'visible';
                document.getElementById("emergency_buttons").style.width = '100%';
                //document.getElementById("log").style.width = '65%';
            }

        });

        $('#toggle_rates_yaw').on('click', function () {
            var button = document.getElementById("toggle_rates_yaw");
            if(!button.checked){
                document.getElementById("setpoints2").style.visibility = 'hidden';
                document.getElementById("setpoints2").style.height = '0px';
                //document.getElementById("log").style.width = '100%';
            }else{
                document.getElementById("setpoints2").style.visibility = 'visible';
                document.getElementById("setpoints2").style.height = '100%';
            }

        });

        $('#toggle_log').on('click', function () {
            var button = document.getElementById("toggle_log");
            if(!button.checked){
                document.getElementById("log").style.visibility = 'hidden';
                document.getElementById("log").style.height = '0px';
                document.getElementById("cockpit").style.height = '100%';
                //document.getElementById("log").style.width = '100%';
            }else{
                document.getElementById("log").style.visibility = 'visible';
                document.getElementById("log").style.height = '10%';
                document.getElementById("cockpit").style.height = '90%';
            }

        });

        $('#toggle_fullscreen').on('click', function () {
            var button = document.getElementById("toggle_fullscreen");
            var image = document.getElementById("fullscreen_icon");


            if(image.src.toString().indexOf("fullscreen_icon") > -1){
                document.getElementById("cockpit").style.visibility = 'hidden';
                document.getElementById("cockpit").style.width = '0px';
                document.getElementById("path").style.left = '0%';
                document.getElementById("path").style.width = '100%';
                document.getElementById("path").style.height = '90%';
                document.getElementById("log").style.width = '100%';


                image.src="minimize_icon.png";
                //document.getElementById("cockpit").style.height = '100%';
                //document.getElementById("log").style.width = '100%';
            }else{
                document.getElementById("cockpit").style.visibility = 'visible';
                document.getElementById("cockpit").style.width = '65%';
                document.getElementById("path").style.left = '65%%';
                document.getElementById("path").style.width = '35%';
                document.getElementById("path").style.height = '100%';
                document.getElementById("log").style.width = '90%';


                image.src="fullscreen_icon.png";
            }

        });

        $('#lock_gopro').on('click', function () {
            dataRelay.write("lock_goPro:3\r\n");
        });

        $('#unlock_gopro').on('click', function () {
            dataRelay.write("lock_goPro:0\r\n");
        });

        $('#kill_plane').on('click', function () {
            if (confirm("Are you sure you want to KILL PLANE? (1/2)") && confirm("Are you ABSOLUTELY sure you want to KILL PLANE? (2/2)")) {
                dataRelay.write("kill_plane:1234\r\n");
            }
        });

        $('#unkill_plane').on('click', function () {
            dataRelay.write("unkill_plane:1234\r\n");
        });

        $('#arm_plane').on('click', function () {
            dataRelay.write("arm_vehicle:1234\r\n");
        });


        $("#raw_command").keyup(function (event) {
            switch (event.keyCode) {
                case 13 :   // enter
                    $("#send_command").click();
                    break;
            }
        });

        var raw_command_pos = 0;
        var raw_command_cache = "";
        $("#raw_command").keydown(function (event) {
            switch (event.keyCode) {
                case 38 :   // up
                    if (raw_command_pos == 0) {
                        raw_command_cache = $("#raw_command").val();
                        $("#raw_command").val(last_raw_command);
                        raw_command_pos = 1;
                    }
                    break;
                case 40 :   // down
                    if (raw_command_pos == 1) {
                        $("#raw_command").val(raw_command_cache);
                        raw_command_pos = 0;
                    }
                    break;
            }
        });

        $("#heading_setpoint").keyup(function (event) {
            if (event.keyCode == 13) {
                $("#send_heading").click();
            }
        });

        $("#pitch_setpoint").keyup(function (event) {
            if (event.keyCode == 13) {
                $("#send_pitch").click();
            }
        });

        $("#roll_setpoint").keyup(function (event) {
            if (event.keyCode == 13) {
                $("#send_roll").click();
            }
        });

        $("#kdInput").keyup(function (event) {
            if (event.keyCode == 13) {
                $("#send_kd").click();
            }
        });

        $("#kiInput").keyup(function (event) {
            if (event.keyCode == 13) {
                $("#send_ki").click();
            }
        });

        $("#kpInput").keyup(function (event) {
            if (event.keyCode == 13) {
                $("#send_kp").click();
            }
        });

        $("#altitude_setpoint_input").keyup(function (event) {
            if (event.keyCode == 13) {
                $("#send_altitude").click();
            }
        });

        $("#throttle_setpoint_input").keyup(function (event) {
            if (event.keyCode == 13) {
                $("#send_throttle").click();
            }
        });

        $("#flap_setpoint_input").keyup(function (event) {
            if (event.keyCode == 13) {
                $("#send_flap").click();
            }
        });

        Mousetrap.bind(["alt+v"], function (e) {
            $("#arm_plane").click();
    });
    });

    function drawHeading(heading, heading_setpoint) {
        //Initialize canvas
        var canvas = document.getElementById("heading");
        canvas.height = 200;
        canvas.width = 200;
        canvas.title = heading + "°";
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
        var headingText = parseInt(heading);
        headingText = headingText.toString() + "°";
        context.fillStyle = "black";
        context.font = "20px Calibri";
        context.textAlign = "center";
        context.fillText(headingText, 100, 30);

        //Setpoint
        heading_setpoint = (parseFloat(heading_setpoint));
        heading_setpoint = heading_setpoint.toString() + "°";
        context.fillStyle = "black";
        context.font = "20px Calibri";
        context.textAlign = "center";
        context.fillText(heading_setpoint, 100, 170);
        context.lineWidth = 2;
        context.rect(60, 150, 76, 30);
        context.stroke();

        //Indicator
        image = document.createElement('img');
        image.src = "heading.png";
        context.translate(50, 50);
        context.translate(50, 50);
        context.rotate(heading * Math.PI / 180);
        context.drawImage(image, -50, -50);
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
        context.rotate(-roll);
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
            context.fillStyle = "#e8ff00";
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

        var selectList = document.createElement("select");
        var option = document.createElement("option");
	    option.text = "Ground";
	    selectList.appendChild(option);
	    option.text = "Air";
	    selectList.appendChild(option);
	    //context.add(selectList);

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
        context.font = '12pt Calibri';
        A = 40;
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
        editing_gain = Math.floor(editing_gain / 16);

        var text;
        if (editing_gain === 0 || editing_gain === 18) {
            text = "MANUAL";
        } else {
            text = "AUTOPILOT";
        }

        writeToDiv("#control_status", text);
    }

    function displayGPSStatus(gpsStatus) {
        var canvas = document.getElementById("gps_status");
        canvas.height = 30;
        canvas.width = 40;
        var context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);

        gpsStatus = parseInt(gpsStatus);
        gpsSatellites = gpsStatus % 16;
        gpsFix = parseInt(gpsStatus / 16);

        if (gpsFix === 2) {
            context.fillStyle = "#4caf50";
        } else if (gpsFix === 1) {
            context.fillStyle = "#e8ff00";
        } else if (gpsFix === 0) {
            context.fillStyle = "#f44336";
        } else {
            context.fillStyle = "#b9b9b9";
        }

        context.arc(20, 15, 15, 0, Math.PI * 2);
        context.fill();

        context.font = '20px Calibri';
        context.textAlign = "center";
        context.fillStyle = "black";

        context.fillText(gpsSatellites, 20, 21);
    }

    dataRelay.on('data', updateCockpit);

    function updateCockpit() {
        var flightData = Data.state;
        var yaw = flightData.yaw;
        var altitude = parseFloat(flightData.altitude);
        var heading = flightData.heading;
        var heading_setpoint = flightData.heading_setpoint;
        var roll = flightData.roll * (Math.PI / 180);
        var roll_setpoint = flightData.roll_setpoint;
        var pitch = flightData.pitch * (Math.PI / 180);
        var pitch_setpoint = flightData.pitch_setpoint;
        var ground_speed = parseFloat(flightData.ground_speed);
        var air_speed = parseFloat(flightData.airspeed);
        var batteryLevel = Math.round(parseFloat(flightData.batteryLevel));
        var editing_gain = parseInt(flightData.editing_gain);
        var gpsStatus = flightData.gpsStatus;
        var kd_gain = flightData.kd_gain;
        var kp_gain = flightData.kp_gain;
        var ki_gain = flightData.ki_gain;
        var time = flightData.time;
        var errorCodes = flightData.errorCodes;
        //Used in path.js for some reason
        lat = flightData.lat;
        lon = flightData.lon;

        drawArtificalHorizon(roll, pitch);
        drawPitch(pitch, pitch_setpoint);
        drawRoll(roll, roll_setpoint);
        drawHeading(heading, heading_setpoint);
        drawBattery(batteryLevel);
        displayControlStatus(editing_gain);
        displayGPSStatus(gpsStatus);
        drawScale(altitude, 250, "altimeter", "Altitude");

        var speedTypeElement = document.getElementById("speed_type")
        var speedType = speedTypeElement.options[speedTypeElement.selectedIndex].text;
        if(speedType == "Ground"){
        	drawScale(ground_speed, 250, "speed", "Ground");
        }else{
        	drawScale(air_speed, 250, "speed", "Air");
        }
        
        displayCurrentGains(editing_gain, kd_gain, kp_gain, ki_gain);
        displaySetpointsAndRates();

        writeToDiv("#time", time);
        writeToDiv('#uhf', Math.floor(errorCodes / 2048));
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
        var roll_rate = flightData.roll_rate;
        var pitch_rate = flightData.pitch_rate;
        var yaw = flightData.yaw;
        var yaw_rate = flightData.yaw_rate;
        var flap_setpoint = flightData.flap_setpoint;

        writeToDiv('#throttle_setpoint_display', throttle_setpoint);
        writeToDiv('#flap_setpoint_display', flap_setpoint);
        writeToDiv('#altitude_setpoint_display', altitude_setpoint);
        writeToDiv('#yaw_display', yaw);
        writeToDiv('#pitch_rate', parseFloat(pitch_rate).toFixed(7));
        writeToDiv('#roll_rate', parseFloat(roll_rate).toFixed(7));
        writeToDiv('#yaw_rate', parseFloat(yaw_rate).toFixed(7));
    }

    function displayCurrentGains(editing_gain, kd_gain, kp_gain, ki_gain) {
        editing_gain = editing_gain % 16;
        if (editing_gain === 0)
            editing_gain = "Yaw";
        else if (editing_gain === 1) {
            editing_gain = "Pitch";
        } else if (editing_gain === 2) {
            editing_gain = "Roll";
        } else if (editing_gain === 3) {
            editing_gain = "Heading";
        } else if (editing_gain === 4) {
            editing_gain = "Altitude";
        } else if (editing_gain === 5) {
            editing_gain = "Throttle";
        } else if (editing_gain === 6) {
            editing_gain = "Flap";
        } else {
            editing_gain = "N/A";
        }

        writeToDiv('#current_gain', editing_gain);
        writeToDiv('#current_kd', kd_gain);
        writeToDiv('#current_ki', ki_gain);
        writeToDiv('#current_kp', kp_gain);
    }

    // Don't export anything
    return {};

})($, Data, Log, Network, Mousetrap);