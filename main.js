
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
         0.0,  1.0,  0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    pyramidVertexPositionBuffer.itemSize = 3;
    pyramidVertexPositionBuffer.numItems = 12;


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
        0.0, 1.0, 0.0, 1.0
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

	var init_camera = function()
	{
		camera = new View();
/*
		camera.pos.x = -2004;
		camera.pos.y = -561;
		camera.pos.z = -4020;
		camera.rotate(90,0,0)
*/
	}

	var init_ui = function()
	{

		// info pain
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

		mouse_accell = $('#mouse-accell').val();
		$('#mouse-accell').keyup(function() { mouse_accell = this.value; });

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

	var drawOK = false;
	var draw = function()
	{
		if(!drawOK){ return; };

		// set global uniforms and gl properties
		gl.uniform1i(shaderProgram.timeUniform, (new Date()).getTime());
		gl.activeTexture(gl.TEXTURE0);
		gl.uniform1i(shaderProgram.samplerUniform, 0);

		// clear the screen
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// move and look around the seen
		var xy = mouse.get();
		camera.rotate(-xy.x*mouse_accell,-xy.y*mouse_accell,0);
		camera.move(movement);
		camera.place_camera();
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
		for(var i=0; i<level.indices.length; i++)
		{
			gl.bindTexture(gl.TEXTURE_2D, Images.get(level.indices[i][2]).texture);
			gl.drawArrays(render_mode, level.indices[i][0], level.indices[i][1]);
		}

		// set pyramid buffers

    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
			pyramidVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
			pyramidVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

		// render players
		for(var p in net.players)
		{
			var player = net.players[p];
			var up = player.dir.vector("up");
			var right = player.dir.vector("right");
			var forward = player.dir.vector("forward");
			_gl.pushMatrix();
			_gl.multMatrix($M([
	      [right.x, right.y, right.z, 0.0],
 		    [up.x, up.y, up.z, 0.0],
    	  [forward.x, forward.y, forward.z, 0.0],
      	[player.pos.x, player.pos.y, player.pos.z, 1.0]
	    ]).transpose())
			setMatrixUniforms();
			gl.drawArrays(gl.TRIANGLES, 0, pyramidVertexPositionBuffer.numItems);
			_gl.popMatrix();
		}

		// update info pain
		$('#pos').html(camera.pos.to_s());
		$('#quat').html(camera.orientation.to_s());
		$('#mouse').html(xy.to_s());
		$('#players').html(net.player_count);
		$('#fps').html(fps.run());
	}

	var net = 
	{
		socket: null,
		players: {},
		player_count: 0,
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
			net.interval = window.setInterval( net.send_update, 1000/10 );
		},
		onclose: function()
		{ 
			log("disconnected from server"); 
			window.clearInterval( net.interval );
			net.interval = null;
			net.players = [];
		},
		receive: function(msg)
		{
			//log("got a message: "+msg.data);
			try 
			{
				var packet = eval("("+msg.data+")");
				if(!net.players[packet.id]) // new player
				{
					net.players[packet.id] = { id: packet.id }
					log("new player with id: "+packet.id);
					net.player_count++;
				}
				var player = net.players[packet.id];
				player.pos = new Vec(
					packet.data.pos[0],
					packet.data.pos[1],
					packet.data.pos[2]
				);
				player.dir = new Quat(
					packet.data.dir[0],
					packet.data.dir[1],
					packet.data.dir[2],
					packet.data.dir[3]
				);
			}
			catch (e)
			{ 
				log("error "+e+" while trying to eval message: "+msg);
			}
		},
		send: function(msg)
		{
			if(!msg){return;}
			try { net.socket.send(msg); }
			catch (e) { log("error ("+e+") attempting to send message: "+msg); return; }
			//log("sent message: "+msg);
		},
		close: function()
		{
			net.socket.close();
		},
		send_update: function()
		{
			net.send(
				"{ pos: ["+camera.pos.to_s()+"], "+
				"dir: ["+camera.orientation.to_s()+"] }"
			);
		}
	}

	$(document).ready(function() 
	{
		init_gl();
		init_ui();
		init_camera();
		init_inputs();
		net.connect();
		textures.init();
		draw_interval = setInterval(draw, 1);
	});
