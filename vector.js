var Vec = function(x,y,z)
{
	this.x = x;
	this.y = y;
	this.z = z;
}

Vec.prototype = 
{
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
		return Math.sqrt(dot);
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
