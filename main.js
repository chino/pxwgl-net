
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
		if(!shaderProgram.enableVertexColorsUniform){return} // first run
		gl.uniform1i(shaderProgram.enableVertexColorsUniform, true);
		gl.uniform1i(shaderProgram.enableTexturingUniform, true);
		gl.uniform1i(shaderProgram.enableAlphaTestUniform, true);
		gl.uniform1i(shaderProgram.enableAcidUniform, false);
		gl.uniform1i(shaderProgram.enableFogUniform, false);
		gl.uniform1f(shaderProgram.fogDensityUniform, 0.0005);
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

		shaderProgram.samplerUniform     = gl.getUniformLocation(shaderProgram, "uSampler");
		shaderProgram.pointSizeUniform   = gl.getUniformLocation(shaderProgram, "uPointSize");
		shaderProgram.pMatrixUniform     = gl.getUniformLocation(shaderProgram, "uPMatrix");
		shaderProgram.mvMatrixUniform    = gl.getUniformLocation(shaderProgram, "uMVMatrix");
		shaderProgram.timeUniform        = gl.getUniformLocation(shaderProgram, "uTime");
		shaderProgram.enableAcidUniform  = gl.getUniformLocation(shaderProgram, "uEnableAcid");
		shaderProgram.enableFogUniform   = gl.getUniformLocation(shaderProgram, "uEnableFog");
		shaderProgram.fogDensityUniform  = gl.getUniformLocation(shaderProgram, "uFogDensity");
		shaderProgram.enableVertexColorsUniform = gl.getUniformLocation(shaderProgram, "uEnableVertexColors");
		shaderProgram.enableTexturingUniform    = gl.getUniformLocation(shaderProgram, "uEnableTexturing");
		shaderProgram.enableAlphaTestUniform    = gl.getUniformLocation(shaderProgram, "uEnableAlphaTest");

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
			Gamma.build(1.0);
			textures.preload();
//			textures.load_example();
		},
		preload: function()
		{
			for(var x=0; x<level.indices.length; x++)
			{
				Images.get(level.indices[x][2]);
			}
		},
		load_example: function()
		{
			texture = Images.get(level.indices[5][2]);
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
		gl.uniformMatrix4fv( shaderProgram.pMatrixUniform, false, _gl.pMatrixPacked );
		gl.uniformMatrix4fv( shaderProgram.mvMatrixUniform, false, _gl.mvMatrixPacked );
	}

	var init_buffers = function()
	{
		// init level vertex/color/tcords

		triangleVertexPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(level.vertices), gl.STATIC_DRAW);
		triangleVertexPositionBuffer.itemSize = 3;
		triangleVertexPositionBuffer.numItems = level.vertices.length/3;

		triangleVertexColorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(level.colors), gl.STATIC_DRAW);
		triangleVertexColorBuffer.itemSize = 4;
		triangleVertexColorBuffer.numItems = level.colors.length/4;

		triangleVertexTCordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexTCordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(level.tcords), gl.STATIC_DRAW);
		triangleVertexTCordBuffer.itemSize = 2;
		triangleVertexTCordBuffer.numItems = level.tcords.length/2;

		// init pyramid for multiplayer rendering

		pyramidVertexPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);

		var vertices = [
			// Front face
			 1.0, -1.0,  1.0,
			-1.0, -1.0,  1.0,
			 0.0,  1.0,  0.0,
			// Right face
			 1.0, -1.0, -1.0,
			 1.0, -1.0,  1.0,
			 0.0,  1.0,  0.0,
			// Back face
			-1.0, -1.0, -1.0,
			 1.0, -1.0, -1.0,
			 0.0,  1.0,  0.0,
			// Left face
			-1.0, -1.0,  1.0,
			-1.0, -1.0, -1.0,
			 0.0,  1.0,  0.0,
			// bottom face 
			 1.0, -1.0,  1.0,
			 1.0, -1.0, -1.0,
			-1.0, -1.0,  1.0,
			-1.0, -1.0, -1.0,
			-1.0, -1.0,  1.0,
			 1.0, -1.0, -1.0,
		];
		
		// rotate forward so top of pyramid is forward
		for(var i=0; i<(vertices.length/3); i++)
		{
			var r = i*3;
			var y = vertices[r+1];
			vertices[r+1] = vertices[r+2];
			vertices[r+2] = y;
		}

		// scale the pyramid up
		for(var i=0; i<vertices.length; i++) { vertices[i] *= 100; }

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		pyramidVertexPositionBuffer.itemSize = 3;
		pyramidVertexPositionBuffer.numItems = 18;

		pyramidVertexColorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
		var colors = [
			// Front face
			1.0, 0.0, 0.0, 1.0,
			0.0, 1.0, 0.0, 1.0,
			0.0, 0.0, 1.0, 1.0,
			// Right face
			1.0, 0.0, 0.0, 1.0,
			0.0, 0.0, 1.0, 1.0,
			0.0, 1.0, 0.0, 1.0,
			// Back face
			1.0, 0.0, 0.0, 1.0,
			0.0, 1.0, 0.0, 1.0,
			0.0, 0.0, 1.0, 1.0,
			// Left face
			1.0, 0.0, 0.0, 1.0,
			0.0, 0.0, 1.0, 1.0,
			0.0, 1.0, 0.0, 1.0,
			// Left face
			1.0, 0.0, 0.0, 1.0,
			1.0, 0.0, 0.0, 1.0,
			1.0, 0.0, 0.0, 1.0,
			1.0, 0.0, 0.0, 1.0,
			1.0, 0.0, 0.0, 1.0,
			1.0, 0.0, 0.0, 1.0,
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
		pyramidVertexColorBuffer.itemSize = 4;
		pyramidVertexColorBuffer.numItems = 12;
	}

	var init_gl = function()
	{
		canvas = document.getElementById("lesson02-canvas");
		_gl = new GL(canvas);
		gl = _gl.gl;

		init_shaders()
		init_buffers();

		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clearDepth(1.0);
		gl.enable(gl.DEPTH_TEST);

		gl.depthFunc(gl.LESS);
		gl.enable(gl.CULL_FACE);
		gl.frontFace(gl.CW);
		if(gl.PERSPECTIVE_CORRECTION_HINT)
			{gl.hint(gl.PERSPECTIVE_CORRECTION_HINT, gl.NICEST);}
	}

	var init_ui = function()
	{
		// browser capabilities pane
		$("#fullscreen")       .html(GameShim.fullscreen);
		$("#pointer_lock")     .html(GameShim.pointerLock);
		$("#gamepad")          .html(GameShim.gamepad);
		$("#high_rest_timer")  .html(GameShim.highResTimer);

		// info pane
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

		// reset all changeable fields
		$('form')[0].reset();

		// shader controls
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

		// form fields

		move_accell = $('#move-accell').val();
		$('#move-accell').keyup(function() { move_accell = this.value; });

		turn_accell = $('#turn-accell').val();
		$('#turn-accell').keyup(function() { turn_accell = this.value; });

		move_drag = $('#move-drag').val();
		$('#move-drag').keyup(function() { move_drag = this.value; });

		turn_drag = $('#turn-drag').val();
		$('#turn-drag').keyup(function() { turn_drag = this.value; });

		$('#fovy').val(_gl.current_perspective['fovy']);
		$('#fovy').keyup(function()
		{
			_gl.current_perspective['fovy'] = this.value;
			_gl.set_perspective();
		});

		$('#far').val(_gl.current_perspective['zfar']);
		$('#far').keyup(function()
		{
			_gl.current_perspective['zfar'] = parseInt(this.value);
			_gl.set_perspective();
		});

		$('#fog').click(function()
		{
			gl.uniform1i(shaderProgram.enableFogUniform, this.checked);
		});
		$('#fog-density').keyup(function()
		{
			gl.uniform1f(shaderProgram.fogDensityUniform, this.value);
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
			_gl.set_perspective();
			_gl.set_viewport();
		});
		$('#canvas-height').keyup(function()
		{
			canvas.height = this.value;
			_gl.set_perspective();
			_gl.set_viewport();
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


	var main_fps = fps_counter();
	var physics_fps = fps_counter();
	var main = function()
	{
		$('#main_fps').html(main_fps());
		process_inputs();
		if(world.update()) { $('#physics_fps').html(physics_fps()); }
		net.send_update();
		draw();
		window.setZeroTimeout(main);
	}

	var process_inputs = function()
	{
		// process inputs
		var xy = mouse.get();
		xyv = new Vec(xy.x, xy.y, 0);
		camera.rotation_velocity = camera.rotation_velocity.minus(
			xyv.plus(
				xyv.multiply_scalar(
					turn_accell
				)
			)
		);
		var mv = camera.orientation.vector(movement); // to local space
		camera.velocity = camera.velocity.plus(
			mv.plus(
				mv.multiply_scalar(
					move_accell
				)
			) 
		);
		$('#mouse').html(xy.to_s());
		$('#pos').html(camera.pos.to_s());
		$('#quat').html(camera.orientation.to_s());
	}

	var drawOK = false;
	var last_draw = get_ticks();
	var draw_fps = fps_counter();
	var draw = function()
	{
		if(!drawOK){ return; };

		// render cap
		var now = get_ticks();
		if( now - last_draw < (1000/70) ) { return }
		last_draw = now;
		$('#fps').html(draw_fps());

		// set global uniforms and gl properties
		gl.uniform1i(shaderProgram.timeUniform, (new Date()).getTime());
		gl.activeTexture(gl.TEXTURE0);
		gl.uniform1i(shaderProgram.samplerUniform, 0);

		// clear the screen
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// look through camera
		_gl.look_from(camera);
		setMatrixUniforms();

		// render the level
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
		var transparancies = [];
		for(var i=0; i<level.indices.length; i++)
		{
			if(level.indices[i][3])
			{
				transparancies.push(level.indices[i]);
				continue;
			}
			gl.bindTexture(gl.TEXTURE_2D, Images.get(level.indices[i][2]).texture);
			gl.drawArrays(render_mode, level.indices[i][0], level.indices[i][1]);
		}
		gl.depthMask(false);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
		for(var i=0; i<transparancies.length; i++)
		{
			gl.bindTexture(gl.TEXTURE_2D, Images.get(transparancies[i][2]).texture);
			gl.drawArrays(render_mode, transparancies[i][0], transparancies[i][1]);
		}
		gl.depthMask(true);
		gl.disable(gl.BLEND);

		// set pyramid buffers
		gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
			pyramidVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
			pyramidVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

		// disable texturing for pyramid
		gl.uniform1i(shaderProgram.enableTexturingUniform, false);

		// disable culling so pyramid doesn't look weird
		gl.disable(gl.CULL_FACE);

		// render players
		for(var p in net.players)
		{
			var player = net.players[p];
			var up = player.body.orientation.vector("up");
			var right = player.body.orientation.vector("right");
			var forward = player.body.orientation.vector("forward");
			_gl.pushMatrix();
			_gl.multMatrix($M([
				[right.x, right.y, right.z, 0.0],
 				[up.x, up.y, up.z, 0.0],
				[forward.x, forward.y, forward.z, 0.0],
				[player.body.pos.x, player.body.pos.y, player.body.pos.z, 1.0]
				]).transpose())
			setMatrixUniforms();
			gl.drawArrays(render_mode, 0, pyramidVertexPositionBuffer.numItems);
			_gl.popMatrix();
		}

		// render world bodies
		for(var i=0; i<world.bodies.length; i++)
		{
			var body = world.bodies[i];
			if(body==camera){continue}
			var up = body.orientation.vector("up");
			var right = body.orientation.vector("right");
			var forward = body.orientation.vector("forward");
			_gl.pushMatrix();
			_gl.multMatrix($M([
				[right.x, right.y, right.z, 0.0],
				[up.x, up.y, up.z, 0.0],
				[forward.x, forward.y, forward.z, 0.0],
				[body.pos.x, body.pos.y, body.pos.z, 1.0]
			]).transpose())
			setMatrixUniforms();
			gl.drawArrays(render_mode, 0, pyramidVertexPositionBuffer.numItems);
			_gl.popMatrix();
		}

		// re-enable culling if form box is checked
		if($('#culling').is(':checked'))
			{ gl.enable(gl.CULL_FACE); }

		// re-enable texturing if checkbox clicked
		gl.uniform1i(shaderProgram.enableTexturingUniform,
			$('#texture-button').is(':checked'));
	}

	var net = 
	{
		socket: null,
		players: {},
		player_count: 0,
		connected: false,
		connect: function()
		{
			net.socket = new WebSocket("ws://fly.thruhere.net:8080");
			net.socket.onopen = net.onopen;
			net.socket.onclose = net.onclose;
			net.socket.onmessage = net.receive;
		},
		onopen: function()
		{
			log("connected to server"); 
			net.connected = true;
		},
		onclose: function()
		{ 
			log("disconnected from server"); 
			window.clearInterval( net.interval );
			net.players = [];
			net.connected = false;
		},
		receive: function(msg)
		{
			//log("got a message: "+msg.data);
			try 
			{
				var packet = eval("("+msg.data+")");
				if(!net.players[packet.id]) // new player
				{
					net.players[packet.id] = {
						id: packet.id, 
						body: sphere_body({
							radius: 100,
						})
					}
					log("new player with id: "+packet.id);
					net.player_count++;
				}
				var player = net.players[packet.id];
				player.body.pos = new Vec(
					packet.data.p[0],
					packet.data.p[1],
					packet.data.p[2]
				);
				player.body.velocity = new Vec(
					packet.data.v[0],
					packet.data.v[1],
					packet.data.v[2]
				);
				player.body.orientation = new Quat(
					packet.data.d[0],
					packet.data.d[1],
					packet.data.d[2],
					packet.data.d[3]
				);
				player.body.rotation_velocity = new Vec(
					packet.data.r[0],
					packet.data.r[1],
					packet.data.r[2]
				);
			}
			catch (e)
			{ 
				log("error "+e+" while trying to eval message: "+msg);
			}
			$('#players').html(net.player_count);
		},
		send: function(msg)
		{
			if(!net.connected){return}
			if(!msg){return;}
			try { net.socket.send(msg); }
			catch (e) { log("error ("+e+") attempting to send message: "+msg); return; }
			//log("sent message: "+msg);
		},
		close: function()
		{
			net.socket.close();
		},
		last_update: get_ticks(),
		send_update: function()
		{
			var now = get_ticks();
			if( now - this.last_update < (1000/10) ) { return }
			this.last_update = now;
			var v = "0,0,0";
			var r = "0,0,0";
			if(camera.velocity.has_velocity()){v=camera.velocity.to_s();}
			if(camera.rotation_velocity.has_velocity()){r=camera.rotation_velocity.to_s();}
			net.send(
				"{"+
					"p:["+camera.pos.to_s()+"],"+
					"d:["+camera.orientation.to_s()+"],"+
					"v:["+v+"],"+
					"r:["+r+"]"+
				"}"
			);
		}
	}

	var sphere_body = function(s)
	{
		var body = new SphereBody(s);
		world.bodies.push(body);
		return body;
	}

	var init_world = function()
	{
		world = new World();
		sphere_body({
			radius: 100,
			pos: new Vec(-500,0,0),
			velocity: new Vec(2,0,0),
			drag: 0,
			rotation_velocity: new Vec(-1,0,0),
			rotation_drag: 0
		});
		sphere_body({
			radius: 100,
			pos: new Vec(500,0,0),
			velocity: new Vec(-1,0,0),
			drag: 0,
			rotation_velocity: new Vec(1,0,0),
			rotation_drag: 0
		});
		camera = sphere_body({
			radius: 100,
			pos: new Vec(0,0,1300),
			drag: move_drag,
			rotation_drag: turn_drag
		});
	}

	$(document).ready(function() 
	{
		init_gl();
		init_ui();
		init_inputs();
		net.connect();
		textures.init();
		init_world();
		add_setZeroTimeout();
//		main_interval = setInterval(main, 1);
		main();
	});
