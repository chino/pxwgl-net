varying int vTime;
varying vec4 vColor;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform bool uEnableVertexColors;
uniform bool uEnableTexturing;
uniform bool uEnableAlphaTest;

// alpha test - ignore fragement if pixel alpha is less than ref (transparency)
bool alpha_test( float alpha )
{
	float ref = 191.0;
	return (alpha < (ref/255.0));
}

void main(void)
{
	vec4 pixel = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
	if(uEnableAlphaTest && alpha_test(pixel[3]))
	{
		discard;
		return;
	}
	if(uEnableTexturing)
	{
		// blend vertex color with texture
		if(uEnableVertexColors)
		{


//
// view zbuffer
//

float perspective_far = 20000.0;
float z = 1.0 - (gl_FragCoord.z / gl_FragCoord.w) / perspective_far;

gl_FragColor = vec4(z,z,z,1.0);



		}
		// only use texture color
		else
		{
			gl_FragColor = pixel;
		}
	}
	// no texturing
	else
	{
		// no color
		if(!uEnableVertexColors)
		{
			discard;
			return;
		}
		// color
		gl_FragColor = vColor;
	}
}

