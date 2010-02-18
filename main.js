
	var log = function(str)
	{
		document.getElementById('log').innerHTML += str + "<br>";
	}

	var init_shaders = function()
	{
		var fragmentShader = getShader(gl, "shader-fs");
		var vertexShader = getShader(gl, "shader-vs");

		shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
		gl.linkProgram(shaderProgram);

		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){alert("Could not initialise shaders");}

		gl.useProgram(shaderProgram);

		shaderProgram.vertexPositionAttribute = gl.getAttribLocation( shaderProgram, "aVertexPosition");
		if(shaderProgram.vertexPositionAttribute >= 0)
		{
			gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
		}

		shaderProgram.vertexColorAttribute = gl.getAttribLocation( shaderProgram , "aVertexColor");
		if(shaderProgram.vertexColorAttribute >= 0)
		{
			gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute); 
		}

		shaderProgram.vertexCoordAttribute = gl.getAttribLocation( shaderProgram , "aTextureCoord");
		if(shaderProgram.vertexCoordAttribute >= 0)
		{
			gl.enableVertexAttribArray(shaderProgram.vertexCoordAttribute);
		}

		shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
		shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
		shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
	}

	var setMatrixUniforms = function() 
	{
		gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, new WebGLFloatArray(_gl.pMatrix.flatten()));
		gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, new WebGLFloatArray(_gl.mvMatrix.flatten()));
	}

	var init_buffers = function()
	{
		triangleVertexPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new WebGLFloatArray(vertices), gl.STATIC_DRAW);
		triangleVertexPositionBuffer.itemSize = 3;
		triangleVertexPositionBuffer.numItems = vertices.length/3;

		triangleVertexColorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new WebGLFloatArray(colors), gl.STATIC_DRAW);
		triangleVertexColorBuffer.itemSize = 4;
		triangleVertexColorBuffer.numItems = colors.length/4;

		triangleVertexTCordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexTCordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new WebGLFloatArray(tcords), gl.STATIC_DRAW);
		triangleVertexTCordBuffer.itemSize = 2;
		triangleVertexTCordBuffer.numItems = tcords.length/2;
	}

	var init_info = function()
	{
		var verts = vertices.length/3;
		document.getElementById('level-verts').innerHTML = verts;
		document.getElementById('level-triangles').innerHTML = verts/3;
		document.getElementById('level-tcords').innerHTML = tcords.length/2;
		var unique = {};
		var count = 0;
		for(var x=0; x<vertices.length; x+=3)
		{
			var vert = ""+vertices[x]+vertices[x+1]+vertices[x+2];
			if(!unique[vert]){count++;}
			unique[vert] = true;
		}
		document.getElementById('level-verts-unique').innerHTML = count;
	}

	var init_gl = function()
	{
		canvas = document.getElementById("lesson02-canvas");
		_gl = new GL(canvas);
		gl = _gl.gl;
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clearDepth(1.0);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LESS);
		gl.enable(gl.CULL_FACE);
		gl.frontFace(gl.CW);
		if(gl.PERSPECTIVE_CORRECTION_HINT)
			{gl.hint(gl.PERSPECTIVE_CORRECTION_HINT, gl.NICEST);}
		_gl.perspective(70, 1.0, 10.0, 100000.0);
	}

	var init_camera = function()
	{
		camera = new View();
		camera.pos.z = -4000;
	}

	var init_inputs = function()
	{
		mouse = new Mouse(canvas);
		document.onkeydown = keyboard.press;
		document.onkeyup = keyboard.release;
	}

	var init_textures = function()
	{
		texture = Images.get("http://fly.thruhere.net/download/projectx/"+textures[0]);
		document.body.appendChild(texture.image);
	}

	var init = function() 
	{
		init_info();
		init_gl();
		init_shaders()
		init_buffers();
		init_camera();
		init_inputs();
		init_textures();
		setInterval(draw, 1);
	}

	var draw = function()
	{
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

		var xy = mouse.get();
		camera.rotate(xy.x,xy.y,0);
		camera.move(movement);
		camera.place_camera();

		if(shaderProgram.vertexPositionAttribute >= 0)
		{
			gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
			gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
				triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		}

		if(shaderProgram.vertexColorAttribute >= 0)
		{
			gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
			gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
				triangleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
		}

		if(shaderProgram.vertexCoordAttribute >= 0)
		{
			gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexTCordBuffer);
			gl.vertexAttribPointer(shaderProgram.vertexCoordAttribute,
				triangleVertexTCordBuffer.itemSize, gl.FLOAT, false, 0, 0);
		}
	
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture.texture);
		gl.uniform1i(shaderProgram.samplerUniform, 0);

		setMatrixUniforms();
		mode = gl.TRIANGLES; //gl.LINES;
		gl.drawArrays(mode, 0, triangleVertexPositionBuffer.numItems);

		// update info pain
		document.getElementById('fps').innerHTML = fps.run();
		document.getElementById('pos').innerHTML = camera.pos.to_s();
		document.getElementById('quat').innerHTML = camera.orientation.to_s();
		document.getElementById('mouse').innerHTML = xy.to_s();
	}
