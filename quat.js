var Quat = function(x,y,z,w)
{
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
	this.w = w || 1;
}

Quat.prototype = 
{
	has_velocity: function()
	{
		return (this.dot() > 0.001);
	},
	length: function() 
	{
		return	Math.sqrt(this.dot()); 
	},
	dot: function(q)
	{
		if(!q) { q = this; }
		return this.x * q.x + this.y * q.y + this.z * q.z + this.w * q.w;
	},
	normalize: function()
	{
		var l = this.length();
		var q = new Quat( this.x / l, this.y / l, this.z / l, this.w / l ); 
		return q;
	},
	is_normalized: function()
	{
		return ! (this.length() > 1.00001);
	},
	conjugate: function()
	{
		return new Quat( -this.x, -this.y, -this.z, this.w );
	},
	times: function(q)
	{
		return new Quat(
			this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y,
			this.w * q.y + this.y * q.w + this.z * q.x - this.x * q.z,
			this.w * q.z + this.z * q.w + this.x * q.y - this.y * q.x,
			this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z
		);
	},
	to_a: function()
	{
		return [this.x,this.y,this.z,this.w];
	},
	rotate: function( yaw, pitch, roll )
	{
		// create 3 quats for pitch, yaw, roll
		// and multiply those together to form a rotation quat
		// then apply it to the current quat to update it
		var sy = Math.sin( yaw * Math.PI / 360 );
		var sp = Math.sin( pitch * Math.PI / 360 );
		var sr = Math.sin( roll * Math.PI / 360 );
		var cy = Math.cos( yaw * Math.PI / 360 );
		var cp = Math.cos( pitch * Math.PI / 360 );
		var cr = Math.cos( roll * Math.PI / 360 );
		return this.normalize().times(new Quat(
			cr*sp*cy + sr*cp*sy,
			cr*cp*sy - sr*sp*cy,
			sr*cp*cy - cr*sp*sy,
			cr*cp*cy + sr*sp*sy
		).normalize());
	},
	directions: {
		up: new Vec(0,1,0),
		down: new Vec(0,-1,0),
		forward: new Vec(0,0,-1),
		back: new Vec(0,0,1),
		right: new Vec(1,0,0),
		left: new Vec(-1,0,0)
	},
	vector: function( direction )
	{
		var d = (this.directions[direction] || direction).quat();
		var r = this.normalize().times(d.times(this.conjugate()));
		return new Vec(r.x,r.y,r.z);
	},
	to_s: function()
	{
		return [
			this.x.toPrecision(2),
			this.y.toPrecision(2),
			this.z.toPrecision(2),
			this.w.toPrecision(2)
		].join(',');
	}
}
