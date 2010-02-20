var Gamma =
{
	table: [],
	build: function( gamma )
	{
        	if (gamma <= 0){ gamma = 1.0; }

	        var k = 255.0/Math.pow(255.0, 1.0/gamma);

	        for (var i = 0; i <= 255; i++)
        	{
                	Gamma.table[i] = (k*(Math.pow(i, 1.0/gamma)));
	                if( i && !Gamma.table[i] )
				{ Gamma.table[i] = 1 };
        	}

		this.render();
	},
	render: function()
	{
		var width = 4;
		var canvas = document.getElementById("gamma-canvas");
		var context = canvas.getContext('2d');
		context.clearRect(0,0,canvas.width,canvas.height);
		for(var x=0; x<255; x+=4)
		{
			var y = this.table[x];
			context.fillStyle = "rgb(100,0,0)";
			// 255-y to flip y
			// x-2, y-2 and 2,2 for width of square centered
			context.fillRect(x-width,255-y-width,width,width); // modified gamma ramp
			context.fillStyle = "rgb(0,0,100)";
			context.fillRect(x-width,255-x-width,width,width); // unmodified gamma ramp
		}
		context.save();
	}
};
