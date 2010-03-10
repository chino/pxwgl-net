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
// exponential fog calculation
//

vec4  fog_color   = vec4(1,1,1,0);
float fog_density = 0.5;

float fog_cord    = abs(gl_FragCoord.z);
float fog         = exp(-fog_density * fog_density * fog_cord * fog_cord);
      fog         = clamp(fog,0.0,1.0);

vec4 frag_color = vColor * pixel;

gl_FragColor = mix( fog_color, frag_color, fog );






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
