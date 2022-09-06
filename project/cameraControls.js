//Camera controls

function CameraManager(objTarget, cameraPos, cameraup, target){

  //this.cameraViewModeNum = 1;   //0 visuale in terza persona, //1 visuale dall'alto, //2 visuale in prima persona

  this.cameraPosition = new Position(cameraPos[0], cameraPos[1], cameraPos[2]);
  this.cameraUP = cameraup;
  this.cameraTargetPos = new Position(target[0], target[1], target[2]);
  this.fov = degToRad(60);
  this.objTarget = objTarget;
  this.followObjTarget = false;
  this.followObjTraslation = false;
  this.distanceVector = [1,1,1];

  
  //DRAWER UPDATE FUNCTION (to call in the render function)
  this.updateGL_DRAWER = function(){
    
    if(CAMERA_MODE == 2){
      var objPosition = this.objTarget.position, angle = this.objTarget.rotation.phi;
      this.cameraPosition = objPosition.plus((0.25 * Math.sin(angle)), -(0.25 * Math.cos(angle)), 0); //new Position(this.objTarget.position.x - (2 * -Math.sin(angle) ), this.objTarget.position.y - (2 * Math.cos(angle)), this.objTarget.position.z);
      this.cameraTargetPos = this.cameraPosition.plus((1 * Math.sin(angle)), -(1 * Math.cos(angle)), 0);
    }

    if(this.followObjTarget)
      GL_DRAWER.target = this.objTarget.position.toArray();
    else
      GL_DRAWER.target = this.cameraTargetPos.toArray();

    if(this.followObjTraslation)
		  this.updatePosOnTarget(this.distanceVector);

    GL_DRAWER.cameraPosition = this.cameraPosition;
    
    GL_DRAWER.up = this.cameraUP;
    GL_DRAWER.fov = this.fov;

    GL_DRAWER.updateViewMatrix();
  }

  //GETTER AND SETTER
  this.setObjTarget = function(objTarget){
    this.objTarget = objTarget;
  }

  this.setCameraPosition = function(x, y, z){
    this.cameraPosition = new Position(x, y, z);
	this.distanceVector = [x,y,z];
  }

  this.setCameraFov = function(fov){
    this.fov = degToRad(fov);
  }

  this.incrementCameraFov = function(deltaFov){
    if((this.fov + degToRad(deltaFov)) > 0 && (this.fov + degToRad(deltaFov)) < (3.14))
      this.fov += degToRad(deltaFov);
  }

  this.getObjTargetPos = function(){
    return this.objTarget.position.toArray();
  }

  this.enableFollowObjTarget = function(lookAt = true, traslation = false){
    this.followObjTarget = lookAt;
    this.followObjTraslation = traslation;
  }

  this.updatePosOnTarget = function(distanceVector){
    this.cameraPosition = new Position(this.objTarget.position.x + distanceVector[0], this.objTarget.position.y + distanceVector[1], this.objTarget.position.z + distanceVector[2]);
  }

  //LOGIC FUNCTION
  this.translate = function(deltaX, deltaY, deltaZ, translateTarget = true){
      this.cameraPosition.translate(deltaX, deltaY, deltaZ);
      if(translateTarget){
        this.cameraTargetPos.translate(deltaX, deltaY, deltaZ);
      }
  }

  this.setVisualeDallAlto = function(followTarget = false){
    this.cameraUP = [0,1,0];
    this.setCameraPosition(0,0,15);
    this.cameraTargetPos = new Position(0,0,0);
    this.enableFollowObjTarget(false, false);
	this.setCameraFov(35);
	this.enableFollowObjTarget(followTarget, followTarget);
  }

  this.setVisualeGeneral = function(pos = [1,1,0.25], lookAt = false, followTraslation = false){
    this.cameraUP = [0,0,1];
    this.setCameraPosition(pos[0], pos[1], pos[2]);
    this.enableFollowObjTarget(lookAt, followTraslation);
	this.setCameraFov(60);
  }

  this.changeCameraView = function(num){
	CAMERA_MODE = num;
    switch(num) {
      case 0 :  this.setVisualeGeneral([0,-1.5,1], true, true);  break; //Vista terza persona
      case 1 :  this.setVisualeDallAlto(true);  break;                      //Vista dall'alto
      case 2 :  this.setVisualeGeneral([0,-1,0.25]);  break;             //Vista Prima persona    
      case 3 :  this.setVisualeGeneral([-5,0,2], false);  break;       	//Vista dal lato 2
      case 4 :  this.setVisualeGeneral([3,-3,1], true);  break;       	//Vista dall'angolo con follow
      case 5 :  this.setVisualeGeneral([-1,-1,0.5], true, true);  break;//Vista dall'angolo con follow
      case "alto" : target.translateL(0, 0, 0.1, m4.identity()); break;
      case "basso" : target.translateL(0, 0, -0.1, m4.identity()); break;
    }
  }


}

function createCameraManager(objTarget, cameraPos = [1,1,1], cameraup = [0,1,0], target = [0,0,0]){
  var camera = new CameraManager(objTarget, cameraPos, cameraup, target);
  camera.changeCameraView(CAMERA_MODE);

  return camera;
}