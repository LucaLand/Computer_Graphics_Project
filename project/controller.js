//-------------------- Moves ----------------------------------------------------------------
function Moves(){
    this.left = "left";
    this.right = "right";
    this.forward = "forward";
    this.backward = "backward";
    this.up = "up";
    this.down = "down";
}
var MOVES = new Moves();

//-------------------- KeyArrow ----------------------------------------------------------------
function KeyArrow(){
    this.upArrow = "upArrow";
    this.downArrow = "downArrow";
    this.leftArrow = "leftArrow";
    this.rightArrow = "rightArrow";
}
var KEYMOVE = new KeyArrow();

//-------------------- CONTROLLER ----------------------------------------------------------------
function Controller(targetObject) {
this.target = targetObject;

//this.controllerMode = 1; //0 visuale in terza persona, //1 visuale dall'alto, //2 visuale in prima persona

//Default step
this.stepSize = 0.1;



this.setControllerMode = function(mode){
    this.controllerMode = mode;
}

this.move = function(move){
    this.commandActuator(move, CAMERA_MODE);
}

this.commandActuator = function(move, controllerMode){
    switch(controllerMode){
        case 0: this.moveThirdPerson(move); break;
        case 1: this.moveFromTop(move); break;      //Alto
        case 2: this.moveFirstPerson(move); break;
    }
}

this.moveFromTop = function(keyMove){
    switch(keyMove){
        case KEYMOVE.upArrow : this.target.translateL(0,this.stepSize, 0); break;
        case KEYMOVE.downArrow : this.target.translateL(0,-this.stepSize, 0); break;
        case KEYMOVE.leftArrow : this.target.translateL(-this.stepSize, 0, 0); break;
        case KEYMOVE.rightArrow : this.target.translateL(this.stepSize, 0, 0); break;
    }
}

function navigate(dForward, currentAngle){
    var angle = currentAngle;
    dy = dForward * Math.cos(angle);
    dx = dForward * -Math.sin(angle);
    dz = 0;

    this.target.translateL(dx, dy, dz, false);
}

this.moveFirstPerson = function(keyMove){
    switch(keyMove){
        case KEYMOVE.upArrow : navigate(-0.1, this.target.rotation.phi); break;
        case KEYMOVE.downArrow : navigate(0.1, this.target.rotation.phi); break;
        case KEYMOVE.leftArrow : this.target.rotate(0, 5); break;
        case KEYMOVE.rightArrow : this.target.rotate(0, -5); break;
    }
}

this.moveThirdPerson = function(keyMove){
    switch(keyMove){
        case KEYMOVE.upArrow : this.target.translateL(0,this.stepSize, 0); break;
        case KEYMOVE.downArrow : this.target.translateL(0,-this.stepSize, 0); break;
        case KEYMOVE.leftArrow : this.target.translateL(-this.stepSize, 0, 0); break;
        case KEYMOVE.rightArrow : this.target.translateL(this.stepSize, 0, 0); break;
    }
}

}