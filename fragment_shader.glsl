varying int vTime;
varying vec4 vColor;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform bool uEnableVertexColors;
uniform bool uEnableTexturing;
uniform bool uEnableAlphaTest;
uniform bool uEnableFog;
uniform float uFogDensity;

const float LOG2 = 1.442695;
vec4  fog_color = vec4(1,1,1,0);

void main(void)
{
	vec4 frag_color = vec4(0,0,0,1);
	vec4 pixel = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));

	if(uEnableAlphaTest)
	{
		float alpha_ref = 240.0;
		if(pixel[3] < (alpha_ref/255.0))
		{
			discard;
			return;
		}
	}

	if(uEnableTexturing)
	{
		if(uEnableVertexColors)
		{
			frag_color = vColor * pixel;
		}
		else
		{
			frag_color = pixel;
		}
	}
	else if(uEnableVertexColors)
	{
		frag_color = vColor;
	}

	if(uEnableFog)
	{
		float z = gl_FragCoord.z / gl_FragCoord.w;
		float fogFactor = exp2( -uFogDensity * uFogDensity * z *  z * LOG2 );
		fogFactor = clamp(fogFactor, 0.0, 1.0);
		frag_color = mix(fog_color, frag_color, fogFactor );
	}

	gl_FragColor = frag_color;
}
