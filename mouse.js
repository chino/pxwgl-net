var Mouse = function(){}
Mouse.prototype =
{
	last: {x:0, y:0},
	current: {x:0, y:0},
	diff: { x:0, y:0 },
	out: function(e)
	{
		this.last = {x:0, y:0};
		this.current = {x: 0, y:0};
	},
	over: function(e)
	{
		this.last = { x: e.clientX, y: e.clientY };
		this.current = { x: e.clientX, y: e.clientY };
	},
	input: function(e)
	{
		this.current = { x: e.clientX, y: e.clientY };
		this.diff.x += (this.current.x - this.last.x)*0.2;
		this.diff.y += (this.current.y - this.last.y)*0.2;
		this.last.x = this.current.x;
		this.last.y = this.current.y;
	},
	get: function()
	{
		var diff = {
			x: this.diff.x,
			y: this.diff.y,
			to_s: function()
			{
				return [
					this.x.toPrecision(2),
					this.y.toPrecision(2)
				].join(',');
			}
		};
		this.diff.x = 0;
		this.diff.y = 0;
		return diff;
	}
}
