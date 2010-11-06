var GL = function(canvas)
{
	this.canvas = canvas;

	try { this.gl = this.canvas.getContext("experimental-webgl"); } 
		catch(e) { log(e); return false; }

	if (!this.gl) 
		{ log("Could not initialise WebGL, sorry :-("); return false; }

	this.__noSuchMethod__ = function(id,args)
		{ alert("no: "+id); }

	this.current_perspective['aspect'] = 
		this.canvas.width/this.canvas.height;
	this.set_perspective();

	this.set_viewport();

	return true;
}
GL.prototype = 
{
	mvMatrix:      null,
	mvMatrixStack: [],
	pMatrix:       null,
	gl:            null,
	scale: function(x,y,z)
	{
		this.multMatrix($M([
			[x,0,0,0],
			[0,y,0,0],
			[0,0,z,0],
			[0,0,0,1]
			]));
	},
	rotate: function (ang, v)
	{
		var arad = ang * Math.PI / 180.0;
		var m = Matrix.Rotation(arad, $V([v[0], v[1], v[2]])).ensure4x4();
		this.multMatrix(m);
	},
	loadIdentity: function()
	{ 
		this.mvMatrix = Matrix.I(4);
	},
	multMatrix: function(m) 
	{ 
		this.mvMatrix = this.mvMatrix.x(m); 
	},
	loatMatrix: function(m)
	{
		this.mvMatrix = m;
	},
	pushMatrix: function(m)
	{
		if(m)
		{
			this.mvMatrixStack.push(m.dup());
			this.mvMatrix = m.dup();
		}
		else
		{
			this.mvMatrixStack.push(this.mvMatrix.dup);
		}
	},
	popMatrix: function()
	{
		if(this.mvMatrixStack.length == 0)
		{
			throw "Invalid popMatrix!";
		}
		this.mvMatrix = this.mvMatrixStack.pop();
		return this.mvMatrix;
	},
	translate: function(v) 
	{
		var m = Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4();
		this.multMatrix(m);
	},
	set_viewport: function()
	{
		this.gl.viewport(0,0,this.canvas.width,this.canvas.height);
	},
	current_perspective:
	{
		fovy:   45, // 70, 
		aspect: 1.0, 
		znear:  0.1, // 10.0, 
		zfar:   100.0 // 10000.0 
	},
	set_perspective: function()
	{
		this.current_perspective['aspect'] = this.canvas.width/this.canvas.height;
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
	}
}
