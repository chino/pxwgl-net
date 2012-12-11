var GL = function(canvas)
{
	this.canvas = canvas;

	try
	{
		this.gl = WebGLDebugUtils.makeDebugContext(
			this.canvas.getContext("experimental-webgl"),
			function(err, func, args)
			{
				var error = WebGLDebugUtils.glEnumToString(err);
				var props = [];
				for(a in args){ if(args.hasOwnProperty(a)){props[a]=args[a]} }
				props = props.join(',');
				var msg = error+" was caused by call to "+func+"("+props+")"
				clearInterval(draw_interval);
				alert(msg);
				throw(msg);
			}
		);
	} 
	catch(e)
	{
		log(e);
		return false; 
	}

	if (!this.gl) 
		{ log("Could not initialise WebGL, sorry :-("); return false; }

	this.__noSuchMethod__ = function(id,args)
		{ alert("GL has no method: "+id); }

	this.current_perspective['aspect'] = 
		$(this.canvas).width()/$(this.canvas).height();
	this.set_perspective();

	this.set_viewport();

	return true;
}
GL.prototype = 
{
	fullscreen:     false,
	mvMatrix:       Matrix.I(4),
	mvMatrixPacked: null,
	mvMatrixStack:  [],
	pMatrix:        Matrix.I(4),
	pMatrixPacked:  null,
	gl:             null,
	setMvMatrix: function(m)
	{
		this.mvMatrix = m;
		this.mvMatrixPacked = new Float32Array(
			this.mvMatrix.flatten()
		);
		return m;
	},
	look_from: function(body)
	{
		var up = body.orientation.vector('up');
		var forward = body.orientation.vector('forward');
		this.setMvMatrix(makeLookAt(
			body.pos.x, body.pos.y, body.pos.z,
			body.pos.x+forward.x, body.pos.y+forward.y, body.pos.z+forward.z,
			up.x, up.y, up.z
		));
	},
	scale: function(x,y,z)
	{
		this.multMatrix($M([
			[x,0,0,0],
			[0,y,0,0],
			[0,0,z,0],
			[0,0,0,1]
			]).transpose());
	},
	rotate: function (ang, v)
	{
		var arad = ang * Math.PI / 180.0;
		var m = Matrix.Rotation(arad, $V([v[0], v[1], v[2]])).ensure4x4();
		this.multMatrix(m);
	},
	loadIdentity: function()
	{ 
		this.setMvMatrix( Matrix.I(4) );
	},
	multMatrix: function(m) 
	{ 
		this.setMvMatrix( this.mvMatrix.x(m) );
	},
	loadMatrix: function(m)
	{
		this.setMvMatrix( m );
	},
	pushMatrix: function(m)
	{
		if(m)
		{
			this.mvMatrixStack.push(m.dup());
			this.setMvMatrix( m.dup() );
		}
		else
		{
			this.mvMatrixStack.push(this.mvMatrix.dup());
		}
	},
	popMatrix: function()
	{
		if(this.mvMatrixStack.length == 0)
		{
			throw "Invalid popMatrix!";
		}
		return this.setMvMatrix( this.mvMatrixStack.pop() );
	},
	translate: function(v) 
	{
		var m = Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4();
		this.multMatrix(m);
	},
	set_viewport: function()
	{
		this.gl.viewport(0,0,$(this.canvas).width(),$(this.canvas).height());
	},
	current_perspective:
	{
		fovy:   70, 
		aspect: 1, 
		znear:  0.1, // 10.0, 
		zfar:   10000000000
	},
	set_perspective: function()
	{
		this.current_perspective['aspect'] = 
			$(this.canvas).width()/$(this.canvas).height();
		this.perspective(
			this.current_perspective['fovy'],
			this.current_perspective['aspect'],
			this.current_perspective['znear'],
			this.current_perspective['zfar']
		);
	},
	perspective: function (fovy, aspect, znear, zfar)
	{
		this.current_perspective['fovy']   = fovy;
		this.current_perspective['aspect'] = aspect;
		this.current_perspective['znear']  = znear;
		this.current_perspective['zfar']   = zfar;
		this.pMatrix = makePerspective(fovy, aspect, znear, zfar);
		this.pMatrixPacked = new Float32Array(
			this.pMatrix.flatten()
		);
	}
}
