var View = function()
{
	this.pos = new Vec(0, 0, 0);
	this.orientation = new Quat(0, 0, 0, 1).normalize();
}

View.prototype = 
{
	// vector { x=right-left, y=up-down, z=forward-back },
	move: function(vector)
	{
		// translate vector by orientation and add it to the position
		this.pos = this.pos.plus(
			this.orientation.vector(vector)
		); 
	},
	rotate: function(yaw,pitch,roll)
	{
		var result = this.orientation.rotate(yaw,pitch,roll)
		this.orientation = result;
	},
	place_camera: function()
	{
		var up = this.orientation.vector('up');
		var forward = this.orientation.vector('forward');
		mvMatrix = makeLookAt(
			// pos
			this.pos.x,this.pos.y,-this.pos.z,
			// reference point
			this.pos.x+forward.x,
			this.pos.y+forward.y,
			-this.pos.z-forward.z,
			// up
			up.x,up.y,-up.z
		);
		_gl.scale(1,1,-1);
	},
	load_matrix: function()
	{
		up = this.orientation.vector('up');
		forward = this.orientation.vector('forward');
		right = this.orientation.vector('right');
		multMatrix($M([
			[right.x, right.y, right.z, 0.0],
			[up.x, up.y, up.z, 0.0],
			[forward.x, forward.y, forward.z, 0.0],
			[this.pos.x, this.pos.y, -this.pos.z, 1.0]
		]));
	},
}
