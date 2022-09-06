/*============= ENV ============================*/
var ENV, ENV2;
//var SHADERS;
var GL;
var then = 0;
var CAMERA_MANAGER, CubeController;
var CAMERA_MODE = 1;			//0 visuale in terza persona, //1 visuale dall'alto, //2 visuale in prima persona
var targetObject = null;

function createEnv(canvasId) {
	log("createEnv() | creating environment...");

	var canvas = document.getElementById(canvasId);
	log("createEnv() | canvas: " + canvas);
	gl = canvas.getContext('webgl');
	if(!gl) {
		throw new Error("WegGL not supported");
	}
	log("createEnv() | canvas and GL context created");

	log("createShaders() | creating shader programs...");
	var programInfo = webglUtils.createProgramInfo(gl, ["vertex-shader", "fragment-shader"]);
	var program = programInfo.program;
	gl.useProgram(program);
	log("createShaders() | shader programs created and used");

	return {
		canvas : canvas,
		gl : gl,
		programInfo : programInfo,
		program: program
	}
}

function init() {
	log("init() | starting...")
	ENV = createEnv('my_Canvas');
	//ENV2 = createEnv('obj_canvas');
	GL = ENV.gl;
	log("init() | ENV created")

	MESH_MANAGER = createMeshManager(ENV.gl, ENV.programInfo);
	log("init() | MESH_MANAGER setup completed");
	GL_DRAWER = createGlDrawer(MESH_MANAGER);
	log("init() | GL_DRAWER setup completed")

	//MESH_MANAGER.loadFromObj('cube1', "assets/moto_simple_1.obj");
	/*const S = 10;
	const H = 0;

	const textureCoords = [ 0,0, 1,0, 0,1, 1,1,];

	const floor = {
	   position: 	{ numComponents: 3, data: [-S,H,-S, S,H,-S, -S,H,S,  S,H,S, ], },
	   texcoord: 	{ numComponents: 2, data: textureCoords, },
	   //color: 	{ numComponents: 3, data: [0.7,0.7,0.7,  0.7,0.7,0.7,  0.7,0.7,0.7,  0.7,0.7,0.7], },
	   indices: 	{ numComponents: 3, data: [0,2,1, 	2,3,1,], },
	   normal:		{numComponents: 3, data: [0,1,0,	0,1,0,	0,1,0,	0,1,0,], },
	};
	MESH_MANAGER.loadFromRawData('cube1', floor.position, floor.texcoord, floor.normal, floor.indices);*/
	const L = 3;
	var floor = MESH_MANAGER.loadFromObj('floor', './project/assets/plane-2m.obj');
	floor.scalate(L, L, 0);
	var cube = MESH_MANAGER.loadFromObj('cube1', './project/assets/cubo_con_assi.obj');
	cube.limits = Limits.linear(-L+0.25, L-0.25, -L+0.25, L-0.25, 3, 3);
	cube.setPosition(0, 0, 0.25);
	cube.scalate(0.25, 0.25, 0.25);

	

	//GL_DRAWER.fov = degToRad(100);
	//GL_DRAWER.cameraPosition = [10, 10, 1];
	
	log("init() | handlers attached");
}

function main() {
	init();
	log("main() | init completed");
	var obj = MESH_MANAGER.get("cube1");
	obj.setPosition(0,0,0.25);
	obj.rotate(90,0);
	//obj.scalate(0.25, 0.25, 0.25);
	
	targetObject = obj;
	CubeController = new Controller(obj);
	CAMERA_MANAGER = createCameraManager(obj);
	attachHandlers(ENV.canvas, obj);


	//Start rendering loop
	requestAnimationFrame(render);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function render(time) {

	time *= 0.001;
	var delta = time - then;
	then = time;
	
	CAMERA_MANAGER.updateGL_DRAWER();
	GL_DRAWER.drawScene();

	//await sleep(200);
	requestAnimationFrame(render);
}

main();
