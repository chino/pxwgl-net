var fps =
{
	frames: 0,
	last: 0,
	value: 0,
	run: function()
	{
		this.frames += 1;
		var time = Math.floor(new Date().getTime()/1000);
		var seconds = time - this.last;
		if(seconds < 1){ return this.value }
		this.last = time;
		this.value = (this.frames / seconds);
		this.frames = 0;
		return this.value;
	}
}
