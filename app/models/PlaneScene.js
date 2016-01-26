//Initializes and configures the Three.js airplane view
var ThreeDView=function(THREE,window){
  this.renderer = new THREE.WebGLRenderer();
  this.aircraft=null;

  var default_width=400;
  var default_height=300;

  var camera = new THREE.PerspectiveCamera(
      45, //view angle
      default_width / default_height, //aspect ratio
      0.1, //near distance
      10000); //far distance

  var scene = new THREE.Scene();

  // add the camera to the scene
  scene.add(camera);

  // the camera starts at 0,0,0 so pull it back 
  camera.position.z = 5000;

  // start the renderer
  this.renderer.setSize(default_width, default_height);

  var loader = new THREE.STLLoader();
  loader.load( 'C:\\Users\\serjb\\Desktop\\WARG-SPIKE4.stl', function ( geometry ) {
    this.aircraft=new THREE.Mesh(geometry);
    scene.add(this.aircraft);
    this.renderOnce();
  }.bind(this));

  // Create a light, set its position, and add it to the scene.
  var light = new THREE.AmbientLight( 0x404040 ); // soft white light
  scene.add(light);

  this.renderOnce=function(){
    this.renderer.render(scene, camera);  
  };

  //should make it render 60 times a second
  //Note: telemetry data comes in at a much slower rate so should really only do it when necessary
  this.render=function(){
    this.renderer.render(scene, camera);  
    window.requestAnimationFrame(this.render);
  }.bind(this);

  window.requestAnimationFrame(this.render);
}

module.exports=ThreeDView;