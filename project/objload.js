function Position(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
}

function zeroPosition() {
  return new Position(0, 0, 0);
}

function Speed(vx, vy, vz) {
  this.vx = vx;
  this.vy = vy;
  this.vz = vz;
}

function zeroSpeed() {
  return new Speed(0, 0, 0);
}

function Rotation(theta, phi) {
  this.theta = theta;
  this.phi = phi;
}

function zeroRotation() {
  return new Rotation(0, 0);
}

function Scale(sx, sy, sz) {
  this.sx = sx;
  this.sy = sy;
  this.sz = sz;
}

function identityScale() {
  return new Scale(1, 1, 1);
}

function Buffers(positionBomber, normalBomber, texcoordBomber) {
  this.positions = positionBomber;
  this.normals = normalBomber;
  this.texcoords = texcoordBomber;

  this.areCreated = function() {
    return this.positions != null && this.normals != null && this.texcoords != null;
  }

  this.isCreatedForShaderVar = function(varName) {
    return this.getFromShaderVarName(varName) != null;
  }

  this.getFromShaderVarName = function(varName) {
    switch(varName) {
      case POSITION_NAME : return this.positions;
      case NORMAL_NAME : return this.normals;
      case TEXCOORD_NAME : return this.texcoords
    }

    throw new Error("Invalid shader variable name \'" + varName + "\'");
  }

  this.setFromShaderVarName = function(varName, value) {
    switch(varName) {
      case POSITION_NAME : this.positions = value;
      case NORMAL_NAME : this.normals = value;
      case TEXCOORD_NAME : this.texcoords = value;
    }

    throw new Error("Invalid shader variable name \'" + varName + "\'");
  }
}

function nullBuffers() {
  return new Buffers(null, null, null);
}

function MeshObj(name, path) {
  this.name = name;
  this.path = path;
  this.data = null;
  this.position = zeroPosition();
  this.rotation = zeroRotation();
  this.scale = identityScale();
  this.speed = zeroSpeed();
  this.buffers = nullBuffers();

  this.hasBeenLoaded = function() {
    return this.data != null;
  }

  this.getDataOf = function (varName) {
    switch(varName) {
      case POSITION_NAME: return this.data.positions;
      case NORMAL_NAME : return this.data.normals;
      case TEXCOORD_NAME : return this.data.texcoords
    }

    throw new Error("Invalid shader variable name \'" + varName + "\'");
  }

  this.createGlPNTBuffers = function(gl) {
    this.buffers.positions = gl.createBuffer();
    this.buffers.normals = gl.createBuffer();
    this.buffers.texcoords = gl.createBuffer();
    log("createGlPNTBuffers() | position, normal and texcoord buffer created for object \'" + this.name + "\'" );
  }

  this.createGlBufferFor = function(gl, varName) {
    log("createGlBufferFor(" + varName + ") | creating buffer...")
    var newBuf = gl.createBuffer();
    this.buffers.setFromShaderVarName(varName, newBuf);

    return newBuf;
  }

  this.writeBufferFor = function(gl, varName, unbind = false) {
    var buf;
    if(!this.buffers.isCreatedForShaderVar(varName)) {
      buf = this.createGlBufferForShaderVar(gl, varName);
    } else {
      buf = this.buffers.getFromShaderVarName(varName);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.getDataOf(varName)), gl.STATIC_DRAW);
    if(unbind) {
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
  }

  this.writePNTBuffers = function(gl, unbind = false) {
    this.writeBufferFor(gl, POSITION_NAME, unbind);
    this.writeBufferFor(gl, NORMAL_NAME, unbind);
    this.writeBufferFor(gl, TEXCOORD_NAME, unbind);
  }

  this.writeToVertexShaderLocation = function(gl, shaders, varName, componentsPerIteration = 3,
    dataType = gl.FLOAT, normalize = false, stride = 0, offset = 0) {
      var location = getShaderLocationFromName(shaders.locations.attributes, varName).location;
      gl.enableVertexAttribArray(location);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.getFromShaderVarName(varName));
      gl.vertexAttribPointer(location, componentsPerIteration, dataType, normalize, stride, offset);
  }

  this.writePNTToVertexShader = function(gl, shaders) {
    this.writeToVertexShaderLocation(gl, shaders, POSITION_NAME);
    this.writeToVertexShaderLocation(gl, shaders, NORMAL_NAME);
    this.writeToVertexShaderLocation(gl, shaders, TEXCOORD_NAME, 2);
  }

  this.bindBufferOf = function (gl, varName) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.getFromShaderVarName(varName));
  }

  this.bindPTNBuffers = function(gl) {
    this.bindBufferOf(gl, POSITION_NAME);
    this.bindBufferOf(gl, NORMAL_NAME);
    this.bindBufferOf(gl, TEXCOORD_NAME);
  }

  this.setUniforms = function(gl, shaders) {
    gl.uniform3fv(shaders.locations.diffuse, this.data.diffuse);
    gl.uniform3fv(shaders.locations.ambient, this.data.ambient);
    gl.uniform3fv(shaders.locations.specular, this.data.specular);
    gl.uniform3fv(shaders.locations.emissive, this.data.emissive);
    gl.uniform1f(shaders.locations.shininess, this.data.shininess);
    gl.uniform1f(shaders.locations.opacity, this.data.opacity);
  }

  this.setPosition = function(x, y, z) {
    this.position = new Position(x, y, z);
  }

  this.setSpeed = function(vx, vy, vz) {
    this.speed = new Speed(vx, vy, vz);
  }

  this.MoMatrix = function(worldMatrix = m4.identity(), autoTranslate = true, autoRotate = true, autoScale = true) {
    var moMatrix = m4.copy(worldMatrix);
    if(autoTranslate) moMatrix = m4.translate(moMatrix, this.position.x, this.position.y, this.position.z);
    if(autoRotate) {
      moMatrix = m4.zRotate(moMatrix, degToRad(this.rotation.theta));
      moMatrix = m4.xRotate(moMatrix, degToRad(this.rotation.phi));
    }
    if(autoScale) moMatrix = m4.scale(moMatrix, this.scale.sx, this.scale.sy, this.scale.sz);
    log("MoMatrix() | create moMatrix for \'" + this.name + "\': " + moMatrix);
    return moMatrix;
  }
}

class MeshObjLoader {
  constructor(gl) {
    this.gl = gl;
    this.objects = [];
  }

  has(name) {
    for(const obj of this.objects) {
      if(obj.name == name) {
        return true;
      }
    }

    return false;
  }

  add(name, path) {
    if(this.has(name)) { throw new Error("An object with name " + name + " is already present. Unable to add"); }
    var newObject = new MeshObj(name, path);
    this.objects.push(newObject);
    return newObject;
  }

  get(name) {
    for(const obj of this.objects) {
      if(obj.name == name) {
        return obj;
      }
    }

    return null;
  }

  load(name) {
    this.loadObject(this.get(name));
  }

  loadObject(obj) {
    obj.data = LoadMesh(this.gl, obj.path);
  }

  addAndLoad(name, path) {
    var obj = this.add(name, path);
    this.loadObject(obj);
  }

  loadAll(reload = false) {
    for(const obj of this.objects) {
      if(reload || (!reload && obj.data == null)) {
        this.loadObject(obj);
      }
    }
  }
}

class MeshObjDrawer {
  constructor(gl, shaderProgram) {
    this.gl = gl;
    this.shaderProgram = shaderProgram;
    this.matrices = {
      projection : m4.identity(),
      view : m4.identity(),
      world : m4.identity()
    }
  }

  reset() {
    this.matrices.projection = m4.identity();
    this.matrices.view = m4.identity();
    this.matrices.world = m4.identity();
  }

  setProjection(fov, aspect, zmin, zmax) {
    this.matrices.projection = m4.perspective(fov, aspect, zmin, zmax);
    this.gl.uniformMatrix4fv(this.shaderProgram.locations.projectionMatrix, false, this.matrices.projection);

    log("setProjection() | projectionMatrix = " + this.matrices.projection);
  }

  setView(cameraPosition, target, up) {
    this.matrices.view = m4.inverse(m4.lookAt(cameraPosition, target, up));
    this.gl.uniformMatrix4fv(this.shaderProgram.locations.viewMatrix, false, this.matrices.view);
    this.gl.uniform3fv(this.shaderProgram.locations.viewWorldPosition, cameraPosition);

    log("setView() | projectionMatrix = " + this.matrices.projection);
  }

  setLightPosition(x, y, z) {
    this.gl.uniform3fv(this.shaderProgram.locations.lightWorldDirection, m4.normalize([x, y, z]));
  }

  setTextureUnit(unit) {
    this.gl.uniform1i(this.shaderProgram.locations.texture, 0);
  }

  setGlViewport(x, y, width = this.gl.canvas.width, height = this.gl.canvas.height) {
    this.gl.viewport(x, y, width, height);
  }

  setAmbientLight(d1, d2, d3) {
    this.gl.uniform3fv(this.shaderProgram.locations.ambientLight, [d1, d2, d3]);
  }

  setColorLight(d1, d2, d3) {
	  this.gl.uniform3fv(this.shaderProgram.locations.colorLight, [d1, d2, d3] );
  }

  drawObject(obj, updatePosition = true, clear = false, updateRotation = true, updateScale = true) {
      gl.enable(gl.DEPTH_TEST);
      if(clear) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      }
      obj.writePNTToVertexShader(this.gl, this.shaderProgram);
      var objMoMatrix = obj.MoMatrix(this.matrices.world, updatePosition, updateRotation, updateScale);
      this.gl.uniformMatrix4fv(this.shaderProgram.locations.worldMatrix, false, objMoMatrix);

      this.gl.drawArrays(this.gl.TRIANGLES, 0, obj.data.numVertices);
  }
}

var MOLOADER;
var MODRAWER;

function createMOLoader(gl) {
  return new MeshObjLoader(gl);
}

function createMODrawer(gl, shaderProgram) {
  return new MeshObjDrawer(gl, shaderProgram);
}
