var GL = function(canvas)
{
	try { this.gl = canvas.getContext("experimental-webgl"); } 
		catch(e) { log(e); }
	if (!this.gl) 
		{ return log("Could not initialise WebGL, sorry :-("); }
	this.loadIdentity();
	this.perspective(70,1.0,10.0,10000.0);
	this.__noSuchMethod__ = function(id,args){
	       alert("no: "+id); 
	}
}
GL.prototype = 
{
	mvMatrix: null,
	pMatrix: null,
	gl: null,
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
		this.mvMatrix = mvMatrix.x(m); 
	},
	loatMatrix: function(m)
	{
		this.mvMatrix = m;
	},
	translate: function(v) 
	{
		var m = Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4();
		this.multMatrix(m);
	},
	perspective: function (fovy, aspect, znear, zfar) {
		this.pMatrix = makePerspective(fovy, aspect, znear, zfar);
	}
}
