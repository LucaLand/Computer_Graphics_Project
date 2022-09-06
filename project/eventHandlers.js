/* ======= MOUSE EVENTS ======================================================= */
var drag = false;
var old_x, old_y;
var dX = 0, dY = 0;
var speed = 0.05;
var target;
var xCamInput = document.getElementById("camXValue");
var yCamInput = document.getElementById("camYValue");
var zCamInput = document.getElementById("camZValue");
var fovInput = document.getElementById("fovValue");
const INCREMENT_UNIT = 0.25;
const RAD_INCREMENT_UNIT = 0.05;

var mouseDown = function(e) {
  drag = true;
  old_x = e.pageX, old_y = e.pageY;
  e.preventDefault();
  return false;
}

var mouseUp = function(e) {
  drag = false;
}

var mouseMove = function(e) {
  if(!drag) return false;
  dX=(e.pageX-old_x)*2*Math.PI/ENV.canvas.width,
  dY=(e.pageY-old_y)*2*Math.PI/ENV.canvas.height;
  target.rotate(dX, dY, true);
  old_x=e.pageX, old_y=e.pageY;
  e.preventDefault();
  GL_DRAWER.drawScene();

  log("Angles || T:" + target.rotation.theta + ", P:" + target.rotation.phi);
}

var keydown = function(e) {
  switch(e.keyCode) {
    case 40 : CubeController.move(KEYMOVE.downArrow); break;      	//Freccia Giù
    case 38 : CubeController.move(KEYMOVE.upArrow); break;       	//Freccia Su
    case 37 : CubeController.move(KEYMOVE.leftArrow); break;       //Freccia Sx
    case 39 : CubeController.move(KEYMOVE.rightArrow); break;       	//Ferccia Dx
    case 104 : trans(0,0,0.1); break;		//NUmpad 8
	  case 189: 	trans(0,0,-0.1); break;		//-
    case 96 : 	CAMERA_MANAGER.changeCameraView(0); break;        //NUMpad 0
    case 97 : 	CAMERA_MANAGER.changeCameraView(1); break;         	//NUMpad 1
    case 98 : 	CAMERA_MANAGER.changeCameraView(2); break;      	//NUMpad 2
    case 99 : 	CAMERA_MANAGER.changeCameraView(3); break;          //NumPad 3
    case 100 :	CAMERA_MANAGER.changeCameraView(4); break;        	//NumPad 4
    case 101 :	CAMERA_MANAGER.changeCameraView(5); break;			//NumPad 5
    case 102 :	CAMERA_MANAGER.changeCameraView(0); break;			//NumPad 6
	case 188: 	CAMERA_MANAGER.incrementCameraFov(-1); break;		//,
	case 190:	CAMERA_MANAGER.incrementCameraFov(1); break;		//.
  }
  log("pos: " + target.position.toString());
  GL_DRAWER.drawScene();
}

function trans(x, y, z, translateCamera = false){
  target.translateL(x, y, z, m4.identity());
  if(translateCamera)
  	CAMERA_MANAGER.traslatePosCamera(x, y, z);
}

function incrementXCam() {
  setXCam(GL_DRAWER.cameraPosition.x + INCREMENT_UNIT);
}

function decrementXCam() {
  setXCam(GL_DRAWER.cameraPosition.x - INCREMENT_UNIT);
}

function incrementYCam() {
  setYCam(GL_DRAWER.cameraPosition.y + INCREMENT_UNIT);
}

function decrementYCam() {
  setYCam(GL_DRAWER.cameraPosition.y - INCREMENT_UNIT);
}

function incrementZCam() {
  setZCam(GL_DRAWER.cameraPosition.z + INCREMENT_UNIT);
}

function decrementZCam() {
  setZCam(GL_DRAWER.cameraPosition.z - INCREMENT_UNIT);
}

function incrementFov() {
  setFov(GL_DRAWER.fov + RAD_INCREMENT_UNIT);
}

function decrementFov() {
  setFov(GL_DRAWER.fov - RAD_INCREMENT_UNIT);
}

function setXCam(value, updateView = true) {
  GL_DRAWER.cameraPosition.x = value;
  if(updateView) xCamInput.value = value;
  GL_DRAWER.drawScene();
}

function setYCam(value, updateView = true) {
  GL_DRAWER.cameraPosition.y = value;
  if(updateView) yCamInput.value = value;
  GL_DRAWER.drawScene();
}

function setZCam(value, updateView = true) {
  GL_DRAWER.cameraPosition.z = value;
  if(updateView) zCamInput.value = value;
  GL_DRAWER.drawScene();
}

function setFov(value, updateView = true) {
  GL_DRAWER.fov = value;
  if(updateView) fovInput.value = radToDeg(value);
  GL_DRAWER.drawScene();
}

function attachHandlers(canvas, p_target) {
  canvas.onmousedown=mouseDown;
  canvas.onmouseup=mouseUp;
  canvas.mouseout=mouseUp;
  canvas.onmousemove=mouseMove;
  target = p_target;

  document.addEventListener('keydown', keydown);
}
