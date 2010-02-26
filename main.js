
	var log = function(str)
	{
		$('#log').html( $('#log').html() + str + "<br>" );
	}

	shaderProgram = null;
	vertexShader = null;
	fragmentShader = null;

	var reinit_vertex_shader = function()
	{
		if(vertexShader)
			{ gl.detachShader(shaderProgram,vertexShader); }
		vertexShader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vertexShader, $('#vertex-shader').val());
		gl.compileShader(vertexShader);
		if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) 
		{
			var msg = ("Failed to compile vertex shader: "+gl.getShaderInfoLog(vertexShader));
			alert(msg);
			log(msg);
			return false;
		}
		gl.attachShader(shaderProgram, vertexShader);
		return true;
	}

	var reinit_fragment_shader = function()
	{
		if(fragmentShader)
			{ gl.detachShader(shaderProgram,fragmentShader); }
		fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fragmentShader, $('#fragment-shader').val());
		gl.compileShader(fragmentShader);
		if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) 
		{ 
			var msg = "Failed to compile fragment shader: "+gl.getShaderInfoLog(fragmentShader);
			alert(msg);
			log(msg);
			return false;
		}
		gl.attachShader(shaderProgram, fragmentShader);
		return true;
	}

// need a state table or something so we reinit to the current state not the default 

	var reinit_uniforms = function()
	{
		gl.uniform1i(shaderProgram.enableVertexColorsUniform, true);
		gl.uniform1i(shaderProgram.enableTexturingUniform, true);
		gl.uniform1i(shaderProgram.enableAlphaTestUniform, true);
		gl.uniform1i(shaderProgram.enableAcidUniform, false);
	}

	var reinit_shaders = function()
	{
		if(!reinit_vertex_shader()){return false;};
		if(!reinit_fragment_shader()){return false;};
		gl.linkProgram(shaderProgram);
		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
			{ return log("Could not link fragmentShader"); }
		gl.useProgram(shaderProgram);
		reinit_uniforms();
		return true;
	}

	var init_shader_handles = function()
	{
		shaderProgram.vertexPositionAttribute = gl.getAttribLocation( shaderProgram, "aVertexPosition");
		if(shaderProgram.vertexPositionAttribute >= 0)
			{ gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute); }

		shaderProgram.vertexColorAttribute = gl.getAttribLocation( shaderProgram , "aVertexColor");
		if(shaderProgram.vertexColorAttribute >= 0)
			{ gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute); }

		shaderProgram.vertexCoordAttribute = gl.getAttribLocation( shaderProgram , "aTextureCoord");
		if(shaderProgram.vertexCoordAttribute >= 0)
			{ gl.enableVertexAttribArray(shaderProgram.vertexCoordAttribute); }

		shaderProgram.enableVertexColorsUniform = gl.getUniformLocation(shaderProgram, "uEnableVertexColors");
		shaderProgram.enableTexturingUniform    = gl.getUniformLocation(shaderProgram, "uEnableTexturing");
		shaderProgram.enableAlphaTestUniform    = gl.getUniformLocation(shaderProgram, "uEnableAlphaTest");

		shaderProgram.samplerUniform     = gl.getUniformLocation(shaderProgram, "uSampler");
		shaderProgram.pointSizeUniform   = gl.getUniformLocation(shaderProgram, "uPointSize");
		shaderProgram.pMatrixUniform     = gl.getUniformLocation(shaderProgram, "uPMatrix");
		shaderProgram.mvMatrixUniform    = gl.getUniformLocation(shaderProgram, "uMVMatrix");
		shaderProgram.timeUniform        = gl.getUniformLocation(shaderProgram, "uTime");
		shaderProgram.enableAcidUniform  = gl.getUniformLocation(shaderProgram, "uEnableAcid");

		reinit_uniforms();
	}

	var init_shaders = function()
	{
		shaderProgram = gl.createProgram();
		$.get( "vertex_shader.glsl", function(str)
		{
			$("#vertex-shader").val(str);
			$.get( "fragment_shader.glsl", function(str)
			{
				$("#fragment-shader").val(str);
				if(!reinit_shaders()) 
					{ return log("failed to init shaders"); }
				init_shader_handles();
				drawOK = true;
			});
		});
	}

	var textures = 
	{	
		init: function()
		{
			texture = Images.get(level.textures[0]);
			texture.image.style.width = '200px';
			texture.canvas.style.width = '200px';
			texture.image.style.margin = '0.5em';
			texture.image.style.display = 'block';
			texture.canvas.style.margin = '0.5em';
			texture.canvas.style.display = 'block';
			var dom = $('#textures');
			dom.append(texture.image);
			dom.append(texture.canvas);
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
		$('#level-verts').html(verts);
		$('#level-triangles').html(verts/3);
		$('#level-tcords').html(level.tcords.length/2);
		var unique = {};
		var count = 0;
		for(var x=0; x<level.vertices.length; x+=3)
		{
			var vert = ""+level.vertices[x]+level.vertices[x+1]+level.vertices[x+2];
			if(!unique[vert]){count++;}
			unique[vert] = true;
		}
		$('#level-verts-unique').html(count);
	}

	current_far = 10000.0;
	current_fovy = 70.0;

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
		_gl.perspective(current_fovy, 1.0, 10.0, current_far);
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
		var set = function()
		{
			document.onkeydown = keyboard.press;
			document.onkeyup = keyboard.release;
		}
		var unset = function()
		{
			document.onkeydown = null;
			document.onkeyup = null;
		}
		canvas.onmouseover = set;
		canvas.onmouseout = unset;
	}

	var init_ui = function()
	{
		$('#vertex-shader-apply').click(reinit_shaders);
		$('#vertex-shader-reset').click(function(){
			$.get( "vertex_shader.glsl", function(str) { 
				$("#vertex-shader").val(str); 
				reinit_shaders();
			});
		});

		$('#fragment-shader-apply').click(reinit_shaders);
		$('#fragment-shader-reset').click(function(){
			$.get( "fragment_shader.glsl", function(str) { 
				$("#fragment-shader").val(str);
				reinit_shaders();
			});
		});

		mouse_accell = 3;
		$('#mouse-accell').keyup(function()
		{
			mouse_accell = this.value;
		});
		$('#fovy').keyup(function()
		{
			current_fovy = this.value;
			_gl.perspective(this.value, 1.0, 10.0, current_far);
		});
		$('#far').keyup(function()
		{
			current_far = this.value;
			_gl.perspective(current_fovy, 1.0, 10.0, this.value);
		});
		$('#acid').click(function()
		{
			gl.uniform1i(shaderProgram.enableAcidUniform, this.checked);
		});
		$('#texture-button').click(function()
		{
			gl.uniform1i(shaderProgram.enableTexturingUniform, this.checked);
		});
		$('#alpha-test').click(function()
		{
			gl.uniform1i(shaderProgram.enableAlphaTestUniform, this.checked);
		});
		$('#culling').click(function()
		{
			gl[ this.checked ? 'enable' : 'disable' ](gl.CULL_FACE);
		});
		$('#vertex-colors').click(function()
		{
			gl.uniform1i(shaderProgram.enableVertexColorsUniform, this.checked);
		});
		render_mode = gl.TRIANGLES;
		$('#rendermode-dropdown').change(function()
                {
			render_mode = gl[this.value.toUpperCase()];
                });
		$('#gamma-value').keyup(function()
		{
			Gamma.build(this.value);
			Images.reset();
		});
		$('#line-width').keyup(function()
		{
			gl.lineWidth(this.value);
		});
		$('#point-size').keyup(function()
		{
			gl.uniform1f(shaderProgram.pointSizeUniform, this.value);
		});
		$('#front-face').change(function()
		{
			gl.frontFace({ cw: gl.CW, ccw: gl.CCW }[this.value]);
		});
		$('#canvas-width').keyup(function()
		{
			canvas.width = this.value;
		});
		$('#canvas-height').keyup(function()
		{
			canvas.height = this.value;
		});
		$("#gamma-canvas").click(function(e)
		{
			var old_val = e.clientX - this.offsetLeft;
			var new_val = 255-(e.clientY-this.offsetTop); // flip y axis
			var gamma   = Math.log( old_val/255 ) / Math.log( new_val/255 )
			$('#gamma-value').val(gamma);
			Gamma.build( gamma );
			Images.reset();
		});
		var gamma_drag = false;
		$("#gamma-canvas").mousedown(function(){ gamma_drag = true; });
		$("#gamma-canvas").mouseup(function(){ gamma_drag = false; });
		$("#gamma-canvas").mouseout(function(){ gamma_drag = false; });
		$("#gamma-canvas").mousemove(function(e)
		{
			if(!gamma_drag){ return; }
			var old_val = e.clientX - this.offsetLeft;
			var new_val = 255-(e.clientY-this.offsetTop); // flip y axis
			var gamma   = Math.log( old_val/255 ) / Math.log( new_val/255 )
			$('#gamma-value').val(gamma);
			Gamma.build( gamma );
			Images.reset();
		});
	}

	var drawOK = false;
	var draw = function()
	{
		if(!drawOK){ return; };

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
		$('#fps').html(fps.run());
		$('#pos').html(camera.pos.to_s());
		$('#quat').html(camera.orientation.to_s());
		$('#mouse').html(xy.to_s());
	}

	$(document).ready(function() 
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
	});

