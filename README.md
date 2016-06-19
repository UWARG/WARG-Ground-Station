# WARG Ground Station
##### The ground station that displays data received from the [data-relay-station](https://github.com/UWARG/data-relay-station)

[![Build Status](https://travis-ci.org/UWARG/WARG-Ground-Station.svg?branch=master)](https://travis-ci.org/UWARG/WARG-Ground-Station/builds)

![Screenshot](https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/assets/screenshots/mainscreen.PNG)


# Installation
1. Clone the repo  
2. Download [Node.js](https://nodejs.org/en/) for your OS
3. Run `npm install` to install the app dependencies (which includes electron)
4. Download [sat_tiles.zip](https://drive.google.com/file/d/0BwjduHozuvOiaUFzV2dZdncyZnc/view?usp=sharing) and extract the `sat_tiles` folder to the assets folder of the project
5. Run `npm start` to start the app

# Running the simulation
The Ground Station supports simulations, so the data-relay-station doesn't actually have to be run. Click on the `Window>>Simulation Mode` menu item to open the simulation window and start up the simulator.

# Running Tests
Run `npm test` to run the unit tests. The groundstation uses `mocha` as its BDD testing framework, `sinonjs` as its method stubbing library, `chai` as its assertion library, as well as `rewire` to mock out require calls,  and `isntanbul` for code coverage reports.

# API Documentation
You can read the api docs by visiting [api.gs.uwarg.com](http://api.gs.uwarg.com). The documentation is hosted on github pages, and can be generated (assuming you have the correct github permissions) by running the `upload-docs.sh` script.

# Licence
Copyright (c) 2016, Waterloo Aerial Robotics Group (WARG)
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.
3. Usage of this code MUST be explicitly referenced to WARG and this code 
   cannot be used in any competition against WARG.
4. Neither the name of the WARG nor the names of its contributors may be used 
   to endorse or promote products derived from this software without specific
   prior written permission.

THIS SOFTWARE IS PROVIDED BY WARG ''AS IS'' AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL WARG BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. 
