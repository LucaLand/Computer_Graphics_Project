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
  target.rotate(dX, dY);
  old_x=e.pageX, old_y=e.pageY;
  e.preventDefault();
  GL_DRAWER.drawScene();

  log("Angles || T:" + target.rotation.theta + ", P:" + target.rotation.phi);
}

var keydown = function(e) {
  switch(e.keyCode) {
    case 40 : target.translateL(0, -0.1, 0, m4.identity()); break;      //Freccia Giù
    case 38 : target.translateL(0, 0.1, 0, m4.identity()); break;       //Freccia Su
    case 37 : target.translateL(0.1, 0, 0, m4.identity()); break;       //Freccia Sx
    case 39 : target.translateL(-0.1, 0, 0, m4.identity()); break;       //Ferccia Dx
    case 104 : target.translateL(0, 0, 0.1, m4.identity()); break;
    case 98 : target.translateL(0, 0, -0.1, m4.identity()); break;
  }
  log("pos: " + target.position.toString());
  GL_DRAWER.drawScene();
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
