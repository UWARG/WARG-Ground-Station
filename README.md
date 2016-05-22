#WARG Ground Station
#####The ground station that displays data received from the [data-relay-station](https://github.com/UWARG/data-relay-station)
![Screenshot](https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/assets/screenshots/mainscreen.PNG)

#Installation 
1. Clone the repo  
2. Download [Node.js](https://nodejs.org/en/) for your OS
3. Run `npm install` to install the app dependencies (which includes NW.js)
4. Download [sat_tiles.zip](https://drive.google.com/file/d/0BwjduHozuvOiaUFzV2dZdncyZnc/view?usp=sharing) and extract the `sat_tiles` folder to the assets folder of the project
5. Run `npm start` to start the app

#Building
You have the option of building a self-contained cross-platform executable of the groundstation if you so wish. To do this, simply run `npm install` to install all of the apps dependencies, then run `npm run build`. This will use [nw-builder](https://github.com/nwjs/nw-builder) to build the executable of the app and save it in the build directory.

#Running the simulation
The groundstation supports simulations, so the data-relay-station doesn't actually have to be run. Click on the `Window>>Simulation Mode` menu item to open the simulation window and start up the simulator. 

#Licence
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

Uses [NW.js](http://nwjs.io), [Marionette](http://marionettejs.com/), and [Leaflet](http://leafletjs.com).

Map tiles are in OSM format. They can be downloaded and exported using GMapCatcher. Leaflet is the maps library used to display the tiles.
