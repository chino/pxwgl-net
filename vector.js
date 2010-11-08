var Vec = function(x,y,z)
{
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
}

Vec.prototype = 
{
	has_velocity: function()
	{
		return (this.dot() > 0.001);
	},
	quat: function()
	{
		return new Quat(this.x,this.y,this.z,0);
	},
	to_a: function() { return [this.x,this.y,this.z]; },
	to_s: function() { 
		return [
				Math.floor(this.x),
				Math.floor(this.y),
				Math.floor(this.z)
			].join(',');
	},
	plus: function(p2)
	{
		return new Vec(
			this.x + p2.x,
			this.y + p2.y,
			this.z + p2.z
		);
	},
	minus: function(p2)
	{
		return new Vec(
			this.x - p2.x,
			this.y - p2.y,
			this.z - p2.z
		);
	},
	dot: function(q)
	{
		if(!q){ q = this; }
		return this.x * q.x + this.y * q.y + this.z * q.z;
	},
	length: function()
	{
		return Math.sqrt(this.dot());
	},
	length2: function()
	{
		return this.dot();
	},
	multiply: function(v2)
	{
		return new Vec(
			this.x * v2.x,
			this.y * v2.y,
			this.z * v2.z
		);
	},
	multiply_scalar: function(x)
	{
		return new Vec(
			this.x * x,
			this.y * x,
			this.z * x
		);
	},
	divide_scalar: function(x)
	{
		return new Vec(
			this.x / x,
			this.y / x,
			this.z / x
		);
	},
	cross: function(v2)
	{
		return new Vec(
			this.y*v2.z - this.z*v2.y,
			this.z*v2.x - this.x*v2.z,
			this.x*v2.y - this.y*v2.x
		);
	},
	normalize: function()
	{
		var l = this.length();
	       	return new Vec( this.x / l, this.y / l, this.z / l );
	}
}
