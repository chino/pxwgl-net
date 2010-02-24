
	var current_fovy = 70;

	var log = function(str)
	{
		document.getElementById('log').innerHTML += str + "<br>";
	}

	var init_shaders = function()
	{
		fragmentShader = getShader(gl, "shader-fs");
		vertexShader = getShader(gl, "shader-vs");

		shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);

		gl.linkProgram(shaderProgram);
		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
			{alert("Could not initialise shaders");}

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

		shaderProgram.pMatrixUniform     = gl.getUniformLocation(shaderProgram, "uPMatrix");
		shaderProgram.mvMatrixUniform    = gl.getUniformLocation(shaderProgram, "uMVMatrix");
		shaderProgram.samplerUniform     = gl.getUniformLocation(shaderProgram, "uSampler");
		shaderProgram.pointSizeUniform   = gl.getUniformLocation(shaderProgram, "uPointSize");
		shaderProgram.timeUniform        = gl.getUniformLocation(shaderProgram, "uTime");

		shaderProgram.enableAcidUniform = gl.getUniformLocation(shaderProgram, "uEnableAcid");
		gl.uniform1i(shaderProgram.enableAcidUniform, false);

		shaderProgram.enableVertexColorsUniform = gl.getUniformLocation(shaderProgram, "uEnableVertexColors");
		gl.uniform1i(shaderProgram.enableVertexColorsUniform, true);

		shaderProgram.enableTexturingUniform = gl.getUniformLocation(shaderProgram, "uEnableTexturing");
		gl.uniform1i(shaderProgram.enableTexturingUniform, true);

		shaderProgram.enableAlphaTestUniform = gl.getUniformLocation(shaderProgram, "uEnableAlphaTest");
		gl.uniform1i(shaderProgram.enableAlphaTestUniform, true);
	}

	var textures = 
	{	
		init: function()
		{
			texture = Images.get(level.textures[0]);
			texture.image.style.width = '200px';
			texture.canvas.style.width = '200px';
			var dom = document.getElementById('textures');
			texture.image.style.margin = '0.5em';
			texture.image.style.display = 'block';
			texture.canvas.style.margin = '0.5em';
			texture.canvas.style.display = 'block';
			dom.appendChild(texture.image);
			dom.appendChild(texture.canvas);
		}
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
		gl.bufferData(gl.ARRAY_BUFFER, new WebGLFloatArray(level.vertices), gl.STATIC_DRAW);
		triangleVertexPositionBuffer.itemSize = 3;
		triangleVertexPositionBuffer.numItems = level.vertices.length/3;

		triangleVertexColorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new WebGLFloatArray(level.colors), gl.STATIC_DRAW);
		triangleVertexColorBuffer.itemSize = 4;
		triangleVertexColorBuffer.numItems = level.colors.length/4;

		triangleVertexTCordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexTCordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new WebGLFloatArray(level.tcords), gl.STATIC_DRAW);
		triangleVertexTCordBuffer.itemSize = 2;
		triangleVertexTCordBuffer.numItems = level.tcords.length/2;
	}

	var init_info = function()
	{
		var verts = level.vertices.length/3;
		document.getElementById('level-verts').innerHTML = verts;
		document.getElementById('level-triangles').innerHTML = verts/3;
		document.getElementById('level-tcords').innerHTML = level.tcords.length/2;
		var unique = {};
		var count = 0;
		for(var x=0; x<level.vertices.length; x+=3)
		{
			var vert = ""+level.vertices[x]+level.vertices[x+1]+level.vertices[x+2];
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
		camera.pos.x = -2004;
		camera.pos.y = -561;
		camera.pos.z = 4020;
		camera.rotate(-90,0,0);
	}

	var init_inputs = function()
	{
		mouse = new Mouse(canvas);
		document.onkeydown = keyboard.press;
		document.onkeyup = keyboard.release;
	}

	var init_ui = function()
	{
		mouse_accell = 3;
		document.getElementById('mouse-accell').onkeyup = function()
		{
			mouse_accell = this.value;
		}
		document.getElementById('fovy').onkeyup = function()
		{
			current_fovy = this.value;
			_gl.perspective(this.value, 1.0, 10.0, 100000.0);
		}
		document.getElementById('acid').onclick = function()
		{
			gl.uniform1i(shaderProgram.enableAcidUniform, this.checked);
		}
		document.getElementById('texture-button').onclick = function()
		{
			gl.uniform1i(shaderProgram.enableTexturingUniform, this.checked);
		}
		document.getElementById('alpha-test').onclick = function()
		{
			gl.uniform1i(shaderProgram.enableAlphaTestUniform, this.checked);
		}
		document.getElementById('culling').onclick = function()
		{
			gl[ this.checked ? 'enable' : 'disable' ](gl.CULL_FACE);
		}
		document.getElementById('vertex-colors').onclick = function()
		{
			gl.uniform1i(shaderProgram.enableVertexColorsUniform, this.checked);
		}
		render_mode = gl.TRIANGLES;
		document.getElementById('rendermode-dropdown').onchange = function()
                {
			render_mode = gl[this.value.toUpperCase()];
                }
		document.getElementById('gamma-value').onkeyup = function()
		{
			Gamma.build(this.value);
			Images.reset();
		}
		document.getElementById('line-width').onkeyup = function()
		{
			gl.lineWidth(this.value);
		}
		document.getElementById('point-size').onkeyup = function()
		{
			gl.uniform1f(shaderProgram.pointSizeUniform, this.value);
		}
		document.getElementById('front-face').onchange = function()
		{
			gl.frontFace({ cw: gl.CW, ccw: gl.CCW }[this.value]);
		}
		var gamma_drag = false;
		document.getElementById("gamma-canvas").onmousedown = function(event)
		{
			gamma_drag = true;
			var old_val = event.clientX - this.offsetLeft;
			var new_val = 255-(event.clientY-this.offsetTop); // flip y axis
			var gamma   = Math.log( old_val/255 ) / Math.log( new_val/255 )
			document.getElementById('gamma-value').value = gamma;
			Gamma.build( gamma );
			Images.reset();
		}
		document.getElementById("gamma-canvas").onmouseup  = function(event){ gamma_drag = false; }
		document.getElementById("gamma-canvas").onmouseout = function(event){ gamma_drag = false; }
		document.getElementById("gamma-canvas").onmousemove =function(event)
		{
			if(!gamma_drag){ return; }
			var old_val = event.clientX - this.offsetLeft;
			var new_val = 255-(event.clientY-this.offsetTop); // flip y axis
			var gamma   = Math.log( old_val/255 ) / Math.log( new_val/255 )
			document.getElementById('gamma-value').value = gamma;
			Gamma.build( gamma );
			Images.reset();
		}
	}

	var init = function() 
	{
		Gamma.build(1.0); // build default table that reflects no change
		init_info();
		init_gl();
		init_ui();
		init_shaders()
		init_buffers();
		init_camera();
		init_inputs();
		textures.init();
		setInterval(draw, 1);
	}

	var draw = function()
	{
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

		var xy = mouse.get();
		camera.rotate(xy.x*mouse_accell,xy.y*mouse_accell,0);
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

		gl.uniform1i(shaderProgram.timeUniform, (new Date()).getTime());

		setMatrixUniforms();
		gl.drawArrays(render_mode, 0, triangleVertexPositionBuffer.numItems);

		// update info pain
		document.getElementById('fps').innerHTML = fps.run();
		document.getElementById('pos').innerHTML = camera.pos.to_s();
		document.getElementById('quat').innerHTML = camera.orientation.to_s();
		document.getElementById('mouse').innerHTML = xy.to_s();
	}



