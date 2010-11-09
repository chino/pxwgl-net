var fps_counter = function()
{
	var frames = 0;
	var last   = Math.floor( get_ticks() / 1000 );
	var value  = 0;
	return function()
	{
		frames += 1;
		var time = Math.floor( get_ticks() / 1000 );
		var seconds = time - last;
		if( seconds < 1 ){ return value }
		last = time;
		value = frames / seconds;
		frames = 0;
		return value;
	}
}
