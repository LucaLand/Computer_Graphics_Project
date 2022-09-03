//Laura Gruppioni

/*
drawBufferInfo does automatically the distintion between drawElements and drawArrays
Moreover, if anything is specified about the type, it automatically draws with gl.TRIANGLES
Otherwise, it is necessary to specify the type, as we did for example in drawCubeWire (car.js) where it uses gl.LINES

The code for the drawElements that was used previously, was the following:
	if (objToDraw.type === "triangles")
		gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
	if (objToDraw.type === "lines")
		gl.drawElements(gl.LINES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
	
The code for the drawArrays was similar...
	gl.drawArrays(gl.TRIANGLES, 0, bufferInfo.numElements);

Now they're no longer necessary 
*/

//ORDINE CORRETTO DI APPLICAZIONE DELLE TRASFORMAZIONI DELLE MATRICI: traslate, rotate, scale

function update(time){
	if(nstep*PHYS_SAMPLING_STEP <= timeNow){ //skip the frame if the call is too early
		
		
		nstep++; 
		doneSomething=true;
		window.requestAnimationFrame(update);
		return; // return as there is nothing to do
	}
	timeNow=time;
	if (doneSomething) {
		render();
		doneSomething=false;
	}
	window.requestAnimationFrame(update); // get next frame
}

// variabili globali per scelta camera
var cambiaCamera = false; // per passare tra la camera posteriore e anteriore
var cameraLibera = false; // drag del mouse

//matrici globali. Alternativa --> passarle come argomento
var lightWorldMatrix, lightProjectionMatrix, projectionMatrix, cameraMatrix;

function render(){

	//gl.enable(gl.CULL_FACE); 	//se è disabilitato, riesco a vedere dentro al cubo, se no no
    gl.enable(gl.DEPTH_TEST);

    // first draw from the POV of the light
    lightWorldMatrix = m4.lookAt(
        [settings.x_light, settings.y_light, settings.z_light],          			// position
        [settings.x_targetlight, settings.y_targetlight, settings.z_targetlight], 	// target
        settings.up,                                              					// up
    );

    lightProjectionMatrix = m4.perspective(
            degToRad(settings.fovLight),
            settings.width_projLight / settings.height_projLight,
            1,  	// near: top of the frustum
            700);   // far: bottom of the frustum


	// -----------------------------------------------------------
    // draw to the depth texture
	
    gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
    gl.viewport(0, 0, depthTextureSize, depthTextureSize);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawScene( lightProjectionMatrix, lightWorldMatrix, m4.identity(), lightWorldMatrix, programInfo_color);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1); //setta tutto a nero se 0,0,0,1
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let textureMatrix = m4.identity();
    textureMatrix = m4.translate(textureMatrix, 0.5, 0.5, 0.5);
    textureMatrix = m4.scale(textureMatrix, 0.5, 0.5, 0.5);
    textureMatrix = m4.multiply(textureMatrix, lightProjectionMatrix);
    textureMatrix = m4.multiply(textureMatrix, m4.inverse(lightWorldMatrix));

	// -------------------------------------------------------------------
	//matrici di vista
	
	projectionMatrix = m4.perspective(settings.fov, settings.aspect, 1, 2000);

	var targetAuto = [px, py, pz];
	
	camera = [px + (settings.D*Math.sin(degToRad(facing))), py+20, pz+(settings.D*Math.cos(degToRad(facing)))]; //posteriore alla macchina

	//cambiaCamera = true --> camera posteriore
	if(cambiaCamera){
		var targetAuto = [px, py, pz];
		camera = [px+(-settings.D*Math.sin(degToRad(facing))), py+20, pz+(-settings.D*Math.cos(degToRad(facing)))];		
	}
	//permette di muoversi nella scena (esempio con la drag del mouse)
	if(cameraLibera){
		camera = [settings.D*7*Math.sin(settings.PHI)*Math.cos(settings.THETA),
					settings.D*7*Math.sin(settings.PHI)*Math.sin(settings.THETA),
					settings.D*7*Math.cos(settings.PHI)];
	}
	
    cameraMatrix = m4.lookAt(camera, targetAuto, settings.up);

    drawScene( projectionMatrix, cameraMatrix, textureMatrix, lightWorldMatrix, programInfo_sun);
    
	drawAdvert();
	//drawFrustum();
	drawWorld();
	drawDeliveryArea();
}

function drawScene(	projectionMatrix, cameraMatrix, textureMatrix, lightWorldMatrix, programInfo) {

    const viewMatrix = m4.inverse(cameraMatrix);

	gl.useProgram(programInfo.program);

	webglUtils.setUniforms(programInfo, {
		u_view: viewMatrix,
		u_projection: projectionMatrix,
		u_bias: bias,
		u_textureMatrix: textureMatrix,
		u_projectedTexture: depthTexture,
		u_reverseLightDirection: lightWorldMatrix.slice(8, 11),
		u_lightIntensity: settings.lightIntensity,
		u_shadowIntensity: settings.shadowIntensity,
	});
	
	drawPizzeria(programInfo);
	drawBuildings(programInfo);
	drawCar(programInfo);
	drawPizza(programInfo);
	drawFloor(programInfo); 
}

// ------------------------------------------------------------------------------------------------
//pizza, pizzeria and delivery area

function drawPizza(programInfo) {
	
	if (!endGame) {
		var objToDraw = getObjToDraw(objectsToDraw, "cartonePizza");
	
		if (!leavePizza[deliveredPizzas-1]) { //la pizza è dentro l'auto
			matrix_pizza = m4.copy(matrix_chassis);
			objToDraw.uniforms.u_world = matrix_pizza;
		}
		else if (leavePizza[deliveredPizzas-1]) { //la pizza viene rilasciata nell'area di consegna
			matrix_pizza = m4.identity();
			matrix_pizza = m4.translate(matrix_pizza, pxPizza, pyPizza+0.5, pzPizza);
			matrix_pizza = m4.scale(matrix_pizza, 2, .3, 2);
			objToDraw.uniforms.u_world = matrix_pizza;
		}
	
		webglUtils.setBuffersAndAttributes(gl, programInfo, objToDraw.bufferInfo);
		webglUtils.setUniforms(programInfo, objToDraw.uniforms);
		webglUtils.drawBufferInfo(gl, objToDraw.bufferInfo);
	}
}

function drawPizzeria(programInfo) {
	
	var objToDraw = getObjToDraw(objectsToDraw, "pizzeria");

	webglUtils.setBuffersAndAttributes(gl, programInfo, objToDraw.bufferInfo);
	webglUtils.setUniforms(programInfo, objToDraw.uniforms);
	webglUtils.drawBufferInfo(gl, objToDraw.bufferInfo);
}

function drawDeliveryArea() {
	
	if (!endGame) {
		const viewMatrix = m4.inverse(cameraMatrix);
		
		let objToDraw = getObjToDraw(objectsToDraw, "deliveryArea");
		const programInfo = objToDraw.programInfo;
		gl.useProgram(programInfo.program);
		
		let matrix = m4.identity();
		
		matrix = m4.translate(matrix, pxDelivery, 0.1, pzDelivery); //QUI
		matrix = m4.scale(matrix, 2, 2, 2);
		objToDraw.uniforms.u_world = matrix;
		
		webglUtils.setBuffersAndAttributes(gl, programInfo, objToDraw.bufferInfo);
		
		webglUtils.setUniforms(programInfo, objToDraw.uniforms);
		
		webglUtils.setUniforms(programInfo, {
			u_view: viewMatrix,
			u_projection: projectionMatrix,
			u_world: matrix,
		});
		
		if (insideArea) //cambia colore in verde
			webglUtils.setUniforms(programInfo, {
				u_color: [0,1,0,1],
			});
		
		webglUtils.drawBufferInfo(gl, objToDraw.bufferInfo);	
		
		//ne disegno uno anche sotto il piano: debug per vedere che non venisse fuori sotto agli edifici
		/*
		matrix = m4.identity();
		
		matrix = m4.translate(matrix, pxDelivery, -0.5, pzDelivery); //QUI
		matrix = m4.scale(matrix, 2, 2, 2);
		objToDraw.uniforms.u_world = matrix;
		
		webglUtils.setBuffersAndAttributes(gl, programInfo, objToDraw.bufferInfo);
		
		webglUtils.setUniforms(programInfo, objToDraw.uniforms);
		
		webglUtils.setUniforms(programInfo, {
			u_view: viewMatrix,
			u_projection: projectionMatrix,
			u_world: matrix,
		});
		webglUtils.drawBufferInfo(gl, objToDraw.bufferInfo);
		*/
	}
}

//city and world

function drawBuildings(programInfo) {
	
	var objToDraw = getObjToDraw(objectsToDraw, "building1");
	webglUtils.setBuffersAndAttributes(gl, programInfo, objToDraw.bufferInfo);
	webglUtils.setUniforms(programInfo, objToDraw.uniforms);
	webglUtils.drawBufferInfo(gl, objToDraw.bufferInfo);
	
	objToDraw = getObjToDraw(objectsToDraw, "building2");
	webglUtils.setBuffersAndAttributes(gl, programInfo, objToDraw.bufferInfo);
	webglUtils.setUniforms(programInfo, objToDraw.uniforms);
	webglUtils.drawBufferInfo(gl, objToDraw.bufferInfo);
	
	objToDraw = getObjToDraw(objectsToDraw, "building3");
	webglUtils.setBuffersAndAttributes(gl, programInfo, objToDraw.bufferInfo);
	webglUtils.setUniforms(programInfo, objToDraw.uniforms);
	webglUtils.drawBufferInfo(gl, objToDraw.bufferInfo);
	
	objToDraw = getObjToDraw(objectsToDraw, "fountain");
	webglUtils.setBuffersAndAttributes(gl, programInfo, objToDraw.bufferInfo);
	webglUtils.setUniforms(programInfo, objToDraw.uniforms);
	webglUtils.drawBufferInfo(gl, objToDraw.bufferInfo);
	
	objToDraw = getObjToDraw(objectsToDraw, "building4");
	webglUtils.setBuffersAndAttributes(gl, programInfo, objToDraw.bufferInfo);
	webglUtils.setUniforms(programInfo, objToDraw.uniforms);
	webglUtils.drawBufferInfo(gl, objToDraw.bufferInfo);
	
	objToDraw = getObjToDraw(objectsToDraw, "building5");
	webglUtils.setBuffersAndAttributes(gl, programInfo, objToDraw.bufferInfo);
	webglUtils.setUniforms(programInfo, objToDraw.uniforms);
	webglUtils.drawBufferInfo(gl, objToDraw.bufferInfo);
	
	//trees
	var objToDraw = getObjToDraw(objectsToDraw, "tree");
	webglUtils.setBuffersAndAttributes(gl, programInfo, objToDraw.bufferInfo);
	webglUtils.setUniforms(programInfo, objToDraw.uniforms);
	webglUtils.drawBufferInfo(gl, objToDraw.bufferInfo);
	
	var objToDraw = getObjToDraw(objectsToDraw, "tree2");
	webglUtils.setBuffersAndAttributes(gl, programInfo, objToDraw.bufferInfo);
	webglUtils.setUniforms(programInfo, objToDraw.uniforms);
	webglUtils.drawBufferInfo(gl, objToDraw.bufferInfo);
	
	var objToDraw = getObjToDraw(objectsToDraw, "tree3");
	webglUtils.setBuffersAndAttributes(gl, programInfo, objToDraw.bufferInfo);
	webglUtils.setUniforms(programInfo, objToDraw.uniforms);
	webglUtils.drawBufferInfo(gl, objToDraw.bufferInfo);
	
}

function drawWorld() {
	const viewMatrix = m4.inverse(cameraMatrix);
	
	let objToDraw = getObjToDraw(objectsToDraw, "world");
	const programInfo = objToDraw.programInfo;
	gl.useProgram(programInfo.program);
	
	let matrix_world = m4.identity();
	matrix_world = m4.translate(matrix_world,0,50,0);
	matrix_world = m4.scale(matrix_world,500,400,500);
	matrix_world = m4.yRotate(matrix_world,degToRad(270));
	
	webglUtils.setBuffersAndAttributes(gl, programInfo, objToDraw.bufferInfo);
	
	webglUtils.setUniforms(programInfo, objToDraw.uniforms);
	
	webglUtils.setUniforms(programInfo, {
		u_view: viewMatrix,
		u_projection: projectionMatrix,
		u_world: matrix_world,
	});
	
	webglUtils.drawBufferInfo(gl, objToDraw.bufferInfo);	
	
}

function drawFloor(programInfo) {
	
	var objToDraw = getObjToDraw(objectsToDraw, "floor");

	let matrix = m4.identity();
	matrix = m4.translate(matrix,0,0,0);
	matrix = m4.scale(matrix,50,50,50);
	objToDraw.uniforms.u_world = matrix;
	
	webglUtils.setBuffersAndAttributes(gl, programInfo, objToDraw.bufferInfo);
	webglUtils.setUniforms(programInfo, objToDraw.uniforms);
	webglUtils.drawBufferInfo(gl, objToDraw.bufferInfo);
	
	objToDraw = getObjToDraw(objectsToDraw, "vialetto");

	matrix = m4.identity();
	matrix = m4.translate(matrix,-40,0.05,-18);
	matrix = m4.scale(matrix,6,1,6);
	objToDraw.uniforms.u_world = matrix;
	
	webglUtils.setBuffersAndAttributes(gl, programInfo, objToDraw.bufferInfo);
	webglUtils.setUniforms(programInfo, objToDraw.uniforms);
	webglUtils.drawBufferInfo(gl, objToDraw.bufferInfo);
}

// -------------------------------------------------------------------------
//car with wheels and windows

function drawAdvert() {
	
	const viewMatrix = m4.inverse(cameraMatrix);
	
	let objToDraw = getObjToDraw(objectsToDraw, "advert");
	const programInfo = objToDraw.programInfo;
	gl.useProgram(programInfo.program);
	
	let matrix = m4.copy(matrix_chassis);
	matrix = m4.translate(matrix, -1.7, 12, 5);
	matrix = m4.xRotate(matrix, degToRad(90));
	matrix = m4.zRotate(matrix, degToRad(90));
	matrix = m4.xRotate(matrix, degToRad(-35));
	matrix = m4.scale(matrix, .3, .03, .3);
	objToDraw.uniforms.u_world = matrix;
	
	webglUtils.setBuffersAndAttributes(gl, programInfo, objToDraw.bufferInfo);
	
	webglUtils.setUniforms(programInfo, objToDraw.uniforms);
	
	webglUtils.setUniforms(programInfo, {
		u_view: viewMatrix,
		u_projection: projectionMatrix,
		u_world: matrix,
	});
	
	webglUtils.drawBufferInfo(gl, objToDraw.bufferInfo);	
	
	//l'altro lato
	
	matrix = m4.copy(matrix_chassis);
	matrix = m4.translate(matrix, 1.7, 12, 5);
	matrix = m4.xRotate(matrix, degToRad(90));
	matrix = m4.zRotate(matrix, degToRad(90));
	matrix = m4.zRotate(matrix, degToRad(180));
	matrix = m4.xRotate(matrix, degToRad(-35));
	matrix = m4.scale(matrix, .3, .03, .3);
	objToDraw.uniforms.u_world = matrix;
	
	webglUtils.setBuffersAndAttributes(gl, programInfo, objToDraw.bufferInfo);
	
	webglUtils.setUniforms(programInfo, objToDraw.uniforms);
	
	webglUtils.setUniforms(programInfo, {
		u_view: viewMatrix,
		u_projection: projectionMatrix,
		u_world: matrix,
	});
	
	webglUtils.drawBufferInfo(gl, objToDraw.bufferInfo);	
	
}

function drawCar(programInfo) {
	drawChassis(programInfo);
	drawWheels(programInfo);
}

function drawChassis (programInfo) {
	
	var objToDraw = getObjToDraw(objectsToDraw, "chassis");
	
	matrix_chassis = m4.identity(); 
	
	matrix_chassis = m4.translate(matrix_chassis,px,py+4,pz);
	matrix_chassis = m4.yRotate(matrix_chassis, degToRad(180));
	matrix_chassis = m4.yRotate(matrix_chassis, degToRad(facing));
	matrix_chassis = m4.scale(matrix_chassis, 5, 5, 5);
	objToDraw.uniforms.u_world = matrix_chassis;
	
	matrix_chassis = m4.yRotate(matrix_chassis, degToRad(-180));
	matrix_chassis = m4.scale(matrix_chassis, 1/5, 1/5, 1/5);
	
	webglUtils.setBuffersAndAttributes(gl, programInfo, objToDraw.bufferInfo);
	webglUtils.setUniforms(programInfo, objToDraw.uniforms);
	webglUtils.drawBufferInfo(gl, objToDraw.bufferInfo);
	
	//***
	
	var objToDraw = getObjToDraw(objectsToDraw, "chassin_nowindows");
	
	matrix_chassis = m4.identity(); 
	
	matrix_chassis = m4.translate(matrix_chassis,px,py+4,pz);
	matrix_chassis = m4.yRotate(matrix_chassis, degToRad(180));
	matrix_chassis = m4.yRotate(matrix_chassis, degToRad(facing));
	matrix_chassis = m4.scale(matrix_chassis, 5, 5, 5);
	objToDraw.uniforms.u_world = matrix_chassis;
	
	matrix_chassis = m4.yRotate(matrix_chassis, degToRad(-180));
	matrix_chassis = m4.scale(matrix_chassis, 1/5, 1/5, 1/5);
	
	webglUtils.setBuffersAndAttributes(gl, programInfo, objToDraw.bufferInfo);
	webglUtils.setUniforms(programInfo, objToDraw.uniforms);
	webglUtils.drawBufferInfo(gl, objToDraw.bufferInfo);
}

function drawWheels(programInfo) {
	
	// -----------------------------------------------------
	//anteriore dx
	objToDraw = getObjToDraw(objectsToDraw, "wheel_adx");
	
	matrix_wheels = m4.copy(matrix_chassis);
	matrix_wheels = m4.translate(matrix_wheels, 6, -2, -7);
	matrix_wheels = m4.yRotate(matrix_wheels,degToRad(sterzo));
	matrix_wheels = m4.xRotate(matrix_wheels, degToRad(mozzoA));
	matrix_wheels = m4.scale(matrix_wheels, .6, .6, .6);
	objToDraw.uniforms.u_world = matrix_wheels;
	
	webglUtils.setBuffersAndAttributes(gl, programInfo, objToDraw.bufferInfo);
	webglUtils.setUniforms(programInfo, objToDraw.uniforms);
	webglUtils.drawBufferInfo(gl, objToDraw.bufferInfo);
	
	// -----------------------------------------------------
	//anteriore sx
	objToDraw = getObjToDraw(objectsToDraw, "wheel_asx");
	
	matrix_wheels = m4.copy(matrix_chassis);
	matrix_wheels = m4.translate(matrix_wheels, -6, -2, -7);
	matrix_wheels = m4.yRotate(matrix_wheels, degToRad(180));
	matrix_wheels = m4.yRotate(matrix_wheels,degToRad(sterzo));
	matrix_wheels = m4.xRotate(matrix_wheels, degToRad(-mozzoA));
	matrix_wheels = m4.scale(matrix_wheels, .6, .6, .6);
	objToDraw.uniforms.u_world = matrix_wheels;
	
	webglUtils.setBuffersAndAttributes(gl, programInfo, objToDraw.bufferInfo);
	webglUtils.setUniforms(programInfo, objToDraw.uniforms);
	webglUtils.drawBufferInfo(gl, objToDraw.bufferInfo);
	
	// -----------------------------------------------------
	//posteriore dx
	var objToDraw = getObjToDraw(objectsToDraw, "wheel_pdx");
	
	matrix_wheels = m4.copy(matrix_chassis);
	matrix_wheels = m4.translate(matrix_wheels, 6, -2, 13);
	matrix_wheels = m4.xRotate(matrix_wheels, degToRad(mozzoP));
	matrix_wheels = m4.scale(matrix_wheels, .6, .6, .6);
	objToDraw.uniforms.u_world = matrix_wheels;
	
	webglUtils.setBuffersAndAttributes(gl, programInfo, objToDraw.bufferInfo);
	webglUtils.setUniforms(programInfo, objToDraw.uniforms);
	webglUtils.drawBufferInfo(gl, objToDraw.bufferInfo);
	
	// -----------------------------------------------------
	//posteriore sx
	objToDraw = getObjToDraw(objectsToDraw, "wheel_psx");
	
	matrix_wheels = m4.copy(matrix_chassis);
	matrix_wheels = m4.translate(matrix_wheels, -6, -2, 13);
	matrix_wheels = m4.yRotate(matrix_wheels, degToRad(180));
	matrix_wheels = m4.xRotate(matrix_wheels,degToRad(-mozzoP));
	matrix_wheels = m4.scale(matrix_wheels, .6, .6, .6);
	objToDraw.uniforms.u_world = matrix_wheels;
	
	webglUtils.setBuffersAndAttributes(gl, programInfo, objToDraw.bufferInfo);
	webglUtils.setUniforms(programInfo, objToDraw.uniforms);
	webglUtils.drawBufferInfo(gl, objToDraw.bufferInfo);
}

function drawFrustum() {
	
	const viewMatrix = m4.inverse(cameraMatrix);

	gl.useProgram(programInfo_color.program);

	webglUtils.setBuffersAndAttributes(gl, programInfo_color, cubeLinesBufferInfo);
	const mat = m4.multiply(lightWorldMatrix, m4.inverse(lightProjectionMatrix));

	webglUtils.setUniforms(programInfo_color, {
		u_color: [1, 1, 1, 1], //frustum color = white
		u_view: viewMatrix,
		u_projection: projectionMatrix,
		u_world: mat,
	});

	webglUtils.drawBufferInfo(gl, cubeLinesBufferInfo, gl.LINES);
}









