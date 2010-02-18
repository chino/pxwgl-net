
var Images = {
	images: {},
	get: function(src)
	{
		if(this.images[src]) { return this.images[src]; }
		this.images[src] = {
			src: src,
			texture: gl.createTexture(),
			image: new Image()
		};
		var that = this;
		this.images[src].image.onload = function(){
			gl.bindTexture(gl.TEXTURE_2D,that.images[src].texture);
			gl.texImage2D(gl.TEXTURE_2D,0,that.images[src].image);
// todo
/*
                GLU.Build2DMipmaps(
                        GL::TEXTURE_2D,
                        GL::RGBA,
                        @image.columns,
                        @image.rows,
                        GL::RGBA,
                        GL::UNSIGNED_BYTE,
                        @data
                )
*/
			gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);//gl.LINEAR_MIPMAP_NEAREST);
			gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
// todo these two are not checked
                	gl.texParameterf(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
			gl.texParameterf(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
			gl.bindTexture(gl.TEXTURE_2D,null);
		}
		this.images[src].image.src = src;
		return this.images[src];
	}
};

