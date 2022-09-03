//Camera controls and Movement Controls

var cameraView = 0; //0= Vista dall'alto; 1= vista in prima persona, 2= prima persona inversa

function CameraManager(objTarget, cameraPos = [1,1,1], cameraup = [0,1,0], target = [0,0,0]){
  this.cameraPosition = new Position(cameraPos[0], cameraPos[1], cameraPos[2]);
  this.cameraUP = cameraup;
  this.cameraTargetPos = new Position(target[0], target[1], target[2]);

  this.oggettoTarget = objTarget;
  this.followTarget = false;

  
  this.updateGL_DRAWER = function(){
    GL_DRAWER.cameraPosition = this.cameraPosition;
    GL_DRAWER.up = this.cameraUP;
    GL_DRAWER.target = this.cameraTargetPos;

    GL_DRAWER.updateViewMatrix();
  }

  this.setObjTarget = function(objTarget){
    this.oggettoTarget = objTarget;
  }

  this.followTarget = function(bool){
    this.followTarget = bool;
  }

  this.traslatePosCamera = function(deltaX, deltaY, deltaZ, translateTarget = true){
      this.cameraPosition.translate(deltaX, deltaY, deltaZ);
      if(translateTarget){
        this.cameraTargetPos.translate(deltaX, deltaY, deltaZ);
      }

      this.updateGL_DRAWER();
  }

  this.setCameraPosition = function(x, y, z){
    this.cameraPosition = new Position(x, y, z);
  }

  this.setVisualeDallAlto = function(){
    this.cameraUP = [0,1,0];
    this.setCameraPosition(0,0,5);
    this.cameraTargetPos = [0,0,0];
    this.updateGL_DRAWER();
  }

  this.setVisualeDalBasso = function(){
    this.cameraUP = [0,0,1];
    this.setCameraPosition(1,1,1);
    this.cameraTargetPos = objTarget.position;
    this.updateGL_DRAWER();
  }

  this.changeCameraView = function(num){
    switch(num) {
      case 0 :  this.setVisualeDallAlto(); break;      //Vista dall'alto
      case 1 :  this.setVisualeDalBasso(); break;       //Vista prima persona
      case 2 : target.translateL(0.1, 0, 0, m4.identity()); break;       //Vista prima persona inversa
      case 3 : target.translateL(-0.1, 0, 0, m4.identity()); break;       
      case "alto" : target.translateL(0, 0, 0.1, m4.identity()); break;
      case "basso" : target.translateL(0, 0, -0.1, m4.identity()); break;
    }
  }

  



}


function createCameraManager(objTarget, cameraPos = [1,1,1], cameraup = [0,1,0], target = [0,0,0]){
  return new CameraManager(objTarget, cameraPos, cameraup, target);
}