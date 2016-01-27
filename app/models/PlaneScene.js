//Initializes and configures the Three.js airplane view
var ThreeDView=function(THREE,window){
  this.renderer = new THREE.WebGLRenderer();
  this.renderer.setClearColor( 0x97C1FF );
  this.aircraft=null;

  var default_width=800;
  var default_height=500;

  var camera = new THREE.PerspectiveCamera(
      45, //fov
      default_width / default_height, //aspect ratio
      0.1, //near distance
      10000); //far distance

  var scene = new THREE.Scene();

  // add the camera to the scene
  scene.add(camera);

  // the camera starts at 0,0,0 so pull it back 
  camera.position.z = 2;
  
  // start the renderer
  this.renderer.setSize(default_width, default_height);

  //load the aircraft stl file
  var stl_loader = new THREE.STLLoader();
  stl_loader.load( '../assets/stl/WARG-Plane-model.stl', function (geometry) {
    //scale and rotate our stl file
    geometry.scale(0.001,0.001,0.001);
    geometry.rotateZ(90/180*Math.PI);
    geometry.rotateX(-90/180*Math.PI);
    
    //give our aircraft a grey material
    var planeMaterial = new THREE.MeshLambertMaterial({
      color: 0x9C9797
    });
    this.aircraft=new THREE.Mesh(geometry,planeMaterial);

    scene.add(this.aircraft);
    this.renderOnce();
  }.bind(this));

  var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
  scene.add( light );

  this.renderOnce=function(){
    this.renderer.render(scene, camera);  
  };

  //rotates the aircaft around the three axis
  //x, y, and z are in degrees
  //x would be pitch (positive points up), y is heading (positive means left), and z is roll (positive rolls left)
  this.rotateAircraft=function(x,y,z){
    this.aircraft.rotation.x=x/180*Math.PI;
    this.aircraft.rotation.y=-y/180*Math.PI;
    this.aircraft.rotation.z=-z/180*Math.PI; //note there is a negative here
    this.renderOnce();
  };

  //resizes the view
  this.resize=function(width, height){
    this.renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  //should make it render 60 times a second
  //Note: telemetry data comes in at a much slower rate so should really only do it when necessary
  this.render=function(){
    this.renderer.render(scene, camera);  
    window.requestAnimationFrame(this.render);
  }.bind(this);

  //window.requestAnimationFrame(this.render);
}

module.exports=ThreeDView;