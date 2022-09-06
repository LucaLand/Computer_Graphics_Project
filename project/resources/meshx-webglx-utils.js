/* ----------- Copy ----------------------------------------------------------- */
function tryCopy(object) {
  if(typeof object.copy == 'function') {
    return object.copy();
  }

  return object;
}

/* ----------- Pair, Triple --------------------------------------------------- */
function Pair(first, second) {
  this.first = first;
  this.second = second;

  this.copy = function() {
    return Pair(tryCopy(this.first), tryCopy(this.second));
  }
}

Pair.of = function(first, second) {
  return new Pair(first, second);
}

function Triple(first, second, third) {
  this.first = first;
  this.second = second;
  this.third = third;

  this.copy = function() {
    return Triple(tryCopy(this.first), tryCopy(this.second), tryCopy(this.third));
  }
}

Triple.of = function(first, second, third) {
  return new Triple(first, second, third);
}
/* ----------- Data Objects --------------------------------------------------- */
const COORDINATE = {
  X : 0,
  Y : 1,
  Z : 2
};
function Position(x, y, z) { /* ****************************************** */
  this.x = x;
  this.y = y;
  this.z = z;

  this.getCoordinate = function(coordinate) {
    switch(coordinate) {
      case COORDINATE.X : return this.x;
      case COORDINATE.Y : return this.y;
      case COORDINATE.Z : return this.z;
    }

    return undefined;
  }

  this.translateX = function(xTranslation) {
    this.x += xTranslation;
    return this;
  }

  this.translateY = function(yTranslation) {
    this.y += yTranslation;
    return this;
  }

  this.translateZ = function(zTranslation) {
    this.z += zTranslation;
    return this;
  }

  this.translate = function(xTranslation, yTranslation, zTranslation) {
    this.translateX(xTranslation);
    this.translateY(yTranslation);
    this.translateZ(zTranslation);
    return this;
  }

  this.plus = function(position) {
    return new Positon(this.x + position.x, this.y + position.y, this.z + position.z);
  }

  this.plus = function(deltaX, deltaY, deltaZ) {
    return new Position(this.x + deltaX, this.y + deltaY, this.z + deltaZ);
  }

  this.distance = function(pos2){
    var vect1 = this.toArray();
    var vect2 = pos2.toArray();

    var dx = Math.pow((vect1[0] - vect2[0]), 2);
    var dy = Math.pow((vect1[1] - vect2[1]), 2);
    var dz = Math.pow((vect1[2] - vect2[2]), 2);

    return Math.sqrt(dx + dy + dz);
  }

  this.distanceVector = function(pos2){
    var vect1 = this.toArray();
    var vect2 = pos2.toArray();

    var dx = vect1[0] - vect2[0];
    var dy = vect1[1] - vect2[1];
    var dz = vect1[2] - vect2[2];

    return [dx, dy, dz];
  }

  this.toArray = function() {
    return [this.x, this.y, this.z];
  }

  this.toString = function() {
    return "(" + this.x + ", " + this.y + ", " + this.z + ")";
  }
}

Position.zeroPosition = function() {
  return new Position(0, 0, 0);
}

Position.newPosition = function(x, y, z) {
  if(!(typeof x == 'number')) {
    throw new Error("x value \'" + x + "\' is not a number");
  }
  if(!(typeof y == 'number')) {
    throw new Error("y value \'" + x + "\' is not a number");
  }
  if(!(typeof z == 'number')) {
    throw new Error("z value \'" + x + "\' is not a number");
  }

  return new Position(x, y, z);
}

Position.copyOf = function(position) {
  return position.copy();
}

Position.difference = function(target, start) {
  return Position.newPosition(target.x - start.x, target.y - start.y, target.z - start.z);
}

function Speed(vx, vy, vz) { /* ****************************************** */
  this.vx = vx;
  this.vy = vy;
  this.vz = vz;

  this.applyXUniformMotionStepTo = function(position, time) {
    position.translateX(this.vx * time);
    return position;
  }

  this.applyYUniformMotionStepTo = function(position, time) {
    position.translateY(this.vy * time);
    return position;
  }

  this.applyZUniformMotionStepTo = function(position, time) {
    position.translateZ(this.vz * time);
    return position;
  }

  this.applyUniformMotionStepTo = function(position, time) {
    position.translate(this.vx * time, this.vy * time, this.vz * time);
    return position;
  }

  this.applyXUniformlyAccelleratedMotionStepTo = function(position, accellerationX, time) {
    position.translateX(position.x + this.vx * t + 0.5 * accellerationX * (time*time));
    this.vx = this.vx + accellerationX * time;
    return Pair.of(position, this);
  }

  this.applyYUniformlyAccelleratedMotionStepTo = function(position, accellerationY, time) {
    position.translateY(position.y + this.vy * t + 0.5 * accellerationY * (time*time));
    this.vy = this.vy + accellerationY * time;
    return Pair.of(position, this);
  }

  this.applyZUniformlyAccelleratedMotionStepTo = function(position, accellerationZ, time) {
    position.translateZ(position.z + this.vz * t + 0.5 * accellerationZ * (time*time));
    this.vz = this.vz + accellerationZ * time;
    return Pair.of(position, this);
  }

  this.applyUniformlyAccelleratedMotionStepTo = function(position, accellerationX, accellerationY = accellerationX,
    accellerationZ = accellerationX, time) {
      this.applyUniformlyAccelleratedMotionTo(position, accellerationX, time);
      this.applyYUniformlyAccelleratedMotionTo(position, accellerationY, time);
      this.applyZUniformlyAccelleratedMotionTo(position, accellerationZ, time);

      return Pair.of(position, this);
  }

  this.copy = function() {
    return new Speed(this.vx, this.vy, this.vz);
  }
}

Speed.zeroSpeed = function() {
  return new Speed(0, 0, 0);
}

Speed.newSpeed = function(vx, vy, vz) {
  if(!(typeof vx == 'number')) {
    throw new Error("vx value \'" + x + "\' is not a number");
  }
  if(!(typeof vy == 'number')) {
    throw new Error("vy value \'" + x + "\' is not a number");
  }
  if(!(typeof vz == 'number')) {
    throw new Error("vz value \'" + x + "\' is not a number");
  }

  return new Speed(x, y, z);
}

Speed.copyOf = function(speed) {
  return speed.copy();
}

function Rotation(theta, phi) { /* *************************************** */
  this.theta = theta;
  this.phi = phi;

  this.rotateTheta = function(deltaTheta) {
    this.theta += deltaTheta;
    return this;
  }

  this.rotatePhi = function(deltaPhi) {
    this.phi += deltaPhi;
    return this;
  }

  this.rotate = function(deltaTheta, deltaPhi) {
    this.rotateTheta(deltaTheta);
    this.rotatePhi(deltaPhi);
    return this;
  }

  this.rotateDeg = function(deltaTheta, deltaPhi) {
    this.rotateTheta(degToRad(deltaTheta));
    this.rotatePhi(degToRad(deltaPhi));
    return this;
  }

  this.copy = function() {
    return Rotation(this.theta, this.phi);
  }
}

Rotation.zeroRotation = function() {
  return new Rotation(0, 0);
}

Rotation.newRotation = function(theta, phi) {
  if(!(typeof theta == 'number')) {
    throw new Error("theta value \'" + x + "\' is not a number");
  }
  if(!(typeof phi == 'number')) {
    throw new Error("phi value \'" + x + "\' is not a number");
  }

  return new Rotation(theta, phi);
}

Rotation.copyOf = function(rotation) {
  return rotation.copy();
}

Rotation.difference = function(target, start) {
  return Rotation.newRotation(target.theta - start.theta, target.phi - start.phi);
}

function Scale(sx, sy, sz) { /* ****************************************** */
  this.sx = sx;
  this.sy = sy;
  this.sz = sz;

  this.scaleX = function(deltaSX) {
    this.sx *= deltaSX;
    return this;
  }

  this.scaleY = function(deltaSY) {
    this.sy *= deltaSY;
    return this;
  }

  this.scaleZ = function(deltaSZ) {
    this.sz *= deltaSZ;
    return this;
  }

  this.scale = function(deltaSX, deltaSY, deltaSZ) {
    this.scaleX(deltaSX);
    this.scaleY(deltaSY);
    this.scaleZ(deltaSZ);
    return this;
  }
}

Scale.identityScale = function() {
  return new Scale(1, 1, 1);
}

Scale.newScale = function(sx, sy, sz) {
  if(!(typeof sx == 'number')) {
    throw new Error("sx value \'" + x + "\' is not a number");
  }
  if(!(typeof sy == 'number')) {
    throw new Error("sy value \'" + x + "\' is not a number");
  }
  if(!(typeof sz == 'number')) {
    throw new Error("sz value \'" + x + "\' is not a number");
  }

  return new Scale(sx, sy, sz);
}

/* ----------- Uniforms and Attributes ---------------------------------------- */
const DIFFUSE_NAME = "diffuse";
const AMBIENT_NAME = "ambient";
const SPECULAR_NAME = "specular";
const EMISSIVE_NAME = "emissive";
const SHININESS_NAME = "shininess";
const OPACITY_NAME = "opacity";
const AMBIENT_LIGHT_NAME = "u_ambientLight";
const COLOR_LIGHT_NAME = "u_colorLight";
const ALL_UNIFORMS = [DIFFUSE_NAME, AMBIENT_NAME, SPECULAR_NAME,
	EMISSIVE_NAME, SHININESS_NAME, OPACITY_NAME, AMBIENT_LIGHT_NAME, COLOR_LIGHT_NAME];

const PROJECTION_MATRIX_NAME = "u_projection";
const VIEW_MATRIX_NAME = "u_view";
const WORLD_MATRIX_NAME = "u_world";
const ALL_MATRIX_UNIFORMS = [PROJECTION_MATRIX_NAME, VIEW_MATRIX_NAME, WORLD_MATRIX_NAME];

const POSITION_NAME = "a_position";
const NORMAL_NAME = "a_normal";
const TEXCOORD_NAME = "a_texcoord";
const ALL_ATTRIBUTES = [POSITION_NAME, NORMAL_NAME, TEXCOORD_NAME];

/* ----------- Shader Locations ----------------------------------------------- */
const SHADER_VAR_TYPE = {
	ATTRIBUTE : 0,
	UNIFORM : 1
}

function checkIsShaderVarType(type) {
  if(type == SHADER_VAR_TYPE.ATTRIBUTE || type == SHADER_VAR_TYPE.UNIFORM) {
    return true;
  }

  throw new Error("Invalid Shader variable type: only ATTRIBUTE[0] or UNIFORM[1] allowed");
}

function ShaderLocation(name, type, location) {
	this.name = name;
	this.type = type;
	this.location = location;
}

ShaderLocation.newShaderLocation = function(name, type, location) {
  checkIsShaderVarType(type);
  return new ShaderLocation(name, type, location);
}

function ShaderLocationArray() {
  this.locations = [];

  this.has = function(name) {
    return this.get(name) != undefined;
  }

  this.get = function(name) {
    return this.locations.find(loc => loc.name == name);
  }

  this.getAllOfType = function(type) {
    return this.locations.filter(loc => loc.type == type);
  }

  this.getLocation = function(name) {
    var loc = this.get(name);
    if(loc != undefined) {
      return loc.location;
    }

    return undefined;
  }

  this.add = function(name, type, location) {
    if(this.has(name)) {
      throw new Error("Unable to add: location with name \'" + name + "\' already present");
    }
    this.locations.push(ShaderLocation.newShaderLocation(name, type, location));
  }

  this.addAttribLocation = function(name, location) {
    this.add(name, SHADER_VAR_TYPE.ATTRIBUTE, location);
  }

  this.addUniformLocation = function(name, location) {
    this.add(name, SHADER_VAR_TYPE.UNIFORM, location);
  }

  this.remove = function(name) {
    this.locations = this.locations.filter(loc => loc.name != name);
  }

  this.clear = function() {
    this.locations.length = 0;
  }

  this.removeAllOfType = function(type) {
    this.locations = this.locations.filter(loc => loc.type != type);
  }
}

/* ----------- Buffer --------------------------------------------------------- */
function MeshBuffers() {
  this.position = null;
  this.normal = null;
  this.texcoord = null;

  this.getByName = function(name) {
    switch(name) {
      case POSITION_NAME: return this.position;
      case NORMAL_NAME: return this.normal;
      case TEXCOORD_NAME: return this.texcoord;
    }

    return undefined;
  }

  this.exists = function(name) {
    return this.getByName(name) != null;
  }

  this.allExists = function(name) {
    this.exists(POSITION_NAME);
    this.exists(NORMAL_NAME);
    this.exists(TEXCOORD_NAME);
  }

  this.set = function(name, buffer) {
    switch(name) {
      case POSITION_NAME: this.position = buffer;
      case NORMAL_NAME: this.normal = buffer;
      case TEXCOORD_NAME: this.texcoord = buffer;
    }
  }

  this.glCreateByName = function(gl, name) {
    set(name, gl.createBuffer());
  }

  this.glCreate = function(gl) {
    set(POSITION_NAME, gl.createBuffer());
    set(NORMAL_NAME, gl.createBuffer());
    set(TEXCOORD_NAME, gl.createBuffer());
  }
}

MeshBuffers.empyBuffers = function() {
  return new MeshBuffers(null, null, null);
}

MeshBuffers.createGlBuffers = function(gl) {
  var buffers = MeshBuffers.empyBuffers();
  buffers.glCreate(gl);
  return buffers;
}

/* ----------- Position Limit Control ------------------------------------------------------ */
function Limits(data, type = "undefined", isInLimitFunction = (position, data) => false) {
  this.data = data;
  this.type = type;
  this.isInLimitFunction = isInLimitFunction;

  this.isInLimits = function(position) {
    return isInLimitFunction(position, this.data);
  }

  this.isOutOfLimits = function(position) {
    return !isInLimitFunction(position, this.data);
  }
}

Limits.linear = function(xMin, xMax, yMin, yMax, zMin, zMax) {
  var limData = {
    xLimits : Pair.of(xMin, xMax),
    yLimits : Pair.of(yMin, yMax),
    zLimits : Pair.of(zMin, zMax)
  };

  var isInLimitFunction = (position, data) => {
    if(position.x < data.xLimits.first || position.x > data.xLimits.second ||
        position.y < data.yLimits.first || position.y > data.yLimits.second ||
        position.z < data.zLimits.firs || position.z > data.zLimits.second){
      return false;
    }

    return true;
  };

  return new Limits(limData, "linear", isInLimitFunction);
}

Limits.unlimited = function() {
  return new Limits({
    xLimits : Pair.of(-Infinity, Infinity),
    yLimits : Pair.of(-Infinity, Infinity),
    zLimits : Pair.of(-Infinity, Infinity)
  }, "unlimited", (position, data) => true);
}

/* ----------- Mesh Object ---------------------------------------------------- */
function MeshObject(name, data) {
  this.name = name;
  this.data = data;
  this.position = Position.zeroPosition();
  this.rotation = Rotation.zeroRotation();
  this.scale = Scale.identityScale();
  this.speed = Speed.zeroSpeed();
  this.limits = Limits.unlimited();
  //this.buffers = MeshBuffers.empyBuffers();
  this.bufferInfo = null;

  this.getDataByName = function(name) {
    switch(name) {
      case POSITION_NAME: return this.data.attributes.positions;
      case NORMAL_NAME : return this.data.attributes.normals;
      case TEXCOORD_NAME : return this.data.attributes.texcoords
    }

    return undefined;
  }

  this.init = function(gl) {
    this.bufferInfo = webglUtils.createBufferInfoFromArrays(gl, this.data.attributes);
    this.data.uniforms.u_world = m4.identity();
  }

  this.translate = function(deltaX, deltaY, deltaZ, u_world = m4.identity()/*this.data.uniforms.u_world*/) {
    this.position.translate(deltaX/**this.scale.sx*/, deltaY/**this.scale.sy*/, deltaZ/**this.scale.sz*/);
    this.updateUMatrix(u_world);

    return this;
  }

  this.rotationMatrix2D = function(theta, phi) {
    return math.matrix([
      [Math.cos(phi),   Math.sin(theta)*Math.sin(phi),  Math.cos(theta)*Math.sin(phi)],
      [0,               Math.cos(theta),                -Math.sin(theta) ],
      [-Math.sin(phi),  Math.sin(theta)*Math.cos(phi),  Math.cos(theta)*Math.cos(phi)]
    ]);
  }

  this.transformRelative = function(deltaX, deltaY, deltaZ){
    //Calcoli Angoli
    var theta = this.rotation.theta,  phi = this.rotation.phi;  
    var cosTh =  Math.cos(theta), cosPh = Math.cos(phi), sinTh = Math.sin(theta), sinPh = Math.sin(phi);
    
    //Calcoli coordinate Relative
    //(Theta angolo tra Y verso Z)
    //(Phi angolo tra X e -Z)
    var dxR= deltaX * cosPh + deltaY * sinTh * sinPh + deltaZ * sinPh;
    var dyR= deltaX * sinTh * sinPh + deltaY * cosTh +  deltaZ * -sinTh;
    var dzR= deltaX * -sinPh + deltaY * sinTh + deltaZ * cosPh * cosTh;

    return [dxR, dyR, dzR];
  }

  this.translateL = function(deltaX, deltaY, deltaZ, relative = false, u_world = this.data.uniforms.u_world) {
    switch(this.limits.type) {
      case "unlimited": return this.translate(deltaX, deltaY, deltaZ, u_world);
      case "linear": {
        if(relative)
          var deltaTrasl = this.transformRelative(deltaX, deltaY, deltaZ);
          else
          var deltaTrasl = [deltaX, deltaY, deltaZ];

        if(this.limits.isInLimits(this.position.plus(deltaTrasl[0], deltaTrasl[1], deltaTrasl[2]))) {
          return this.translate(deltaTrasl[0], deltaTrasl[1], deltaTrasl[2]);
        } else {
          return this;
        }
      }
    }
  }

  this.setPosition = function(x, y, z, updateMatrix = true) {
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
    if(updateMatrix) this.updateUMatrix();
  }

  this.setRotation = function(theta, phi, updateMatrix = true) {
    this.rotation.theta = theta;
    this.rotation.phi = phi;
    if(updateMatrix) this.updateUMatrix();
  }

  this.setScale = function(sx, sy, sz, updateMatrix = true) {
    this.scale.sx = sx;
    this.scale.sy = sy;
    this.scale.sz = sz;
    if(updateMatrix) this.updateUMatrix();
  }

  this.rotate = function(deltaTheta, deltaPhi, radMode = false) {
    if(radMode)
      this.rotation.rotate(deltaTheta, deltaPhi);
    else
      this.rotation.rotateDeg(deltaTheta, deltaPhi);
    this.updateUMatrix();
  }

  this.rotateTheta = function(deltaTheta, u_world = this.data.uniforms.u_world) {
    this.rotation.rotateTheta(deltaTheta);
    this.updateUMatrix();
  }

  this.rotatePhi = function(deltaPhi, u_world = this.data.uniforms.u_world) {
    this.rotation.rotatePhi(deltaPhi);
    this.updateUMatrix();
  }

  this.scalate = function(deltaSX, deltaSY, deltaSZ, u_world = this.data.uniforms.u_world) {
    this.scale.scale(deltaSX, deltaSY, deltaSZ);
    this.updateUMatrix();
  }

  this.setUMatrix = function(u_world) {
    this.data.uniforms.u_world = u_world;
  }

  this.updateUMatrix = function(u_world = m4.identity(), translation = true, rotation = true, scale = true) {
    if(translation) u_world = m4.translate(u_world, this.position.x, this.position.y, this.position.z);
    if(rotation) {
      u_world = m4.xRotate(u_world, this.rotation.theta);
      u_world = m4.yRotate(u_world, this.rotation.phi);
    }
    if(scale) u_world = m4.scale(u_world, this.scale.sx, this.scale.sy, this.scale.sz);
    this.setUMatrix(u_world);
  }

  this.draw = function(gl, programInfo, clear = false) {
    if(clear) {
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    webglUtils.setBuffersAndAttributes(gl, programInfo, this.bufferInfo);
    webglUtils.setUniforms(programInfo, this.data.uniforms);
    gl.drawArrays(gl.TRIANGLES, 0, this.bufferInfo.numElements);
  }
}

/* ----------- Manager -------------------------------------------------------- */
function MeshManager(gl, programInfo) {
  this.gl = gl;
  this.programInfo = programInfo;
  this.program = programInfo.program;
  this.objects = new Map();

  this.loadFromObj = function(name, path) {
    var meshObj = new MeshObject(name, LoadMesh(this.gl, path));
    this.objects.set(name, meshObj);
    meshObj.init(this.gl);
    return meshObj;
  }

  this.loadFromRawData = function(name, position, texcoord, normal, indices) {
    var attributes = {
      position : { data : position }
    }
    if(texcoord != null) {
      attributes.texcoord = { data : texcoord };
    }
    if(normal != null) {
      attributes.normal = { data : normal };
    }
    if(indices != null) {
      attributes.indices = { data : indices };
    }
    var data = {
      mesh : null,
      attributes : attributes,
      numVertices : undefined,
      uniforms : new Object()
    }
    var meshObj = new MeshObject(name, data);
    this.objects.set(name, meshObj);
    meshObj.init(this.gl);
    return meshObj;
  }

  this.get = function(name) {
    return this.objects.get(name);
  }

  this.getAll = function() {
    return this.objects.values()
  }

  this.remove = function(name) {
    return this.objects.delete(name);
  }
}

/* ----------- Drawer --------------------------------------------------------- */
function GlDrawer(meshMgr) {
  this.gl = meshMgr.gl;
  this.meshMgr = meshMgr;
  this.programInfo = meshMgr.programInfo,
  this.fov = degToRad(60);
  this.zNear = 0.1;
  this.zFar = 200;
  this.cameraPosition = new Position(1, 1, 1);
  this.target = [0, 0, 0];
  this.up = [0, 0, 1];
  this.sharedUniforms = {
    u_ambientLight : [0.2,0.2,0.2],
    u_colorLight : [1.0,1.0,1.0],
    u_view : m4.identity(),
    u_projection : m4.identity()
  }

  this.updateViewMatrix = function() {
    var cameraMatrix = m4.lookAt(this.cameraPosition.toArray(), this.target, this.up);
    this.sharedUniforms.u_view = m4.inverse(cameraMatrix);
  }

  this.updateProjectionMatrix = function() {
    this.sharedUniforms.u_projection = m4.perspective(this.fov, gl.canvas.clientWidth / gl.canvas.clientHeight, this.zNear, this.zFar);
  }

  this.startDrawing = function() {
    //webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    //this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.updateProjectionMatrix();
    this.updateViewMatrix();

    this.gl.useProgram(this.programInfo.program);
    webglUtils.setUniforms(this.programInfo, this.sharedUniforms);
  }

  this.drawScene = function() {
    this.startDrawing();
    var objs = this.meshMgr.getAll();
    for(const obj of objs) {
      obj.draw(this.gl, this.programInfo, false);
    }
  }
}

/* ----------- Singleton ------------------------------------------------------ */
var MESH_MANAGER;
var GL_DRAWER;

function createMeshManager(gl, programInfo) {
  return new MeshManager(gl, programInfo);
}

function createGlDrawer(meshMgr) {
  return new GlDrawer(meshMgr);
}

/*
this.limitPositions = function(bool){
  this.limitEnabled = bool
}

this.setLimits = function(LimX, LimY, LimZ){
  this.XLim = LimX;
  this.YLim = LimY;
  this.ZLim = LimZ;
}

this.isInLimit = function(deltaTrasl, limit){
  if(Math.abs(deltaTrasl) > Math.abs(limit))
    return false;
  return true;
}

this.translateWithLimits = function(xTranslation, yTranslation, zTranslation) {
  if(isInLimit(X+xTranslation, XLim))
    this.translateX(xTranslation);
  if(isInLimit(this.y+yTranslation, XLim))
    this.translateX(yTranslation);
  if(isInLimit(this.z+zTranslation, XLim))
    this.translateX(zTranslation);
  return this;
}

this.translate = function(xTranslation, yTranslation, zTranslation) {
  if(limitPositions == true)
    this.translateWithLimits(xTranslation, yTranslation, zTranslation);
  else
    this.translateLimitless(xTranslation, yTranslation, zTranslation);
}*/
