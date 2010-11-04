
var Images = 
{
	path: "/download/projectx/",
	images: {},
	reset: function()
	{
		for(src in this.images)
		{
			this.images[src].image.src = src;
		}
	},
	get: function(src)
	{
		src = this.path+src;
		if(this.images[src]) { return this.images[src]; }
		this.images[src] = {
			src: src,
			texture: gl.createTexture(),
			canvas: document.createElement('canvas'),
			image: new Image()
		};
		var image = this.images[src];
		image.image.onload = function()
		{
			// draw image into a canvas
			image.canvas.width = this.width;
			image.canvas.height = this.height;
			var context = image.canvas.getContext('2d');
			context.drawImage(this,0,0,this.width,this.height);
			var data = context.getImageData(0,0,this.width,this.height);

			// edit the canvas data pixel by pixel
			for(var x=0; x<this.width; x++)
			{
				for(var y=0; y<this.height; y++)
				{
					var offset = (y*this.height+x)*4;
					var r = data.data[offset];
			        	var g = data.data[offset + 1];
				        var b = data.data[offset + 2];
			
					// apply gamma correction
					data.data[offset]   = Gamma.table[data.data[offset]];    // red
					data.data[offset+1] = Gamma.table[data.data[offset+1]];  // green
					data.data[offset+2] = Gamma.table[data.data[offset+2]];  // blue
					
					// if color is black set alpha to 0 for alpha test to make transparent
					if(r+g+b == 0) { data.data[offset+3] = 0; }
				}
			}
	
			// write the modified data back in		
			context.putImageData(data,0,0);

			// bind image, set properties, load data, and mipmap
			gl.bindTexture(gl.TEXTURE_2D,image.texture);
			gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image.canvas);
			gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
			gl.texParameterf(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
			gl.texParameterf(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
			gl.generateMipmap(gl.TEXTURE_2D);

			// unbind image
			gl.bindTexture(gl.TEXTURE_2D,null);
		}
		image.image.src = src;
		return image;
	}
};

