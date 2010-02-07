
var Image = {
	images: {},
	get: function(src)
	{
		if(images[src]) { return images[src]; }
		images[src] = {
			texture: gl.createTexture(),
			image: new Image()
		};
		image = images[src];
		images[src].onload = function()
		{
			gl.bindTexture(gl.TEXTURE_2D,image.texture);
			gl.texImage2D(gl.TEXTURE_2D,0,image.image);
			gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
			gl.bindTexture(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
			gl.bindTexture(gl.TEXTURE_2D,null);
		}
		images[src].src = src;
	},
};

