attribute vec3 aVertexPosition;
attribute vec4 aVertexColor;
attribute vec2 aTextureCoord;

uniform mat4  uMVMatrix;
uniform mat4  uPMatrix;
uniform float uPointSize;
uniform float uTime;
uniform bool  uEnableAcid;

varying float vTime;
varying vec4 vColor;
varying vec2 vTextureCoord;

void main(void)
{
	vec4 position = vec4(aVertexPosition,1.0);

	// the acid effect !!!
	if(uEnableAcid)
	{
		float time = float(uTime) * 0.001;
		position += vec4(
			sin(time * 2.0 + position.x)*20.0,
			sin(time * 3.0 + position.y)*20.0,
			sin(time * 5.0 + position.z)*20.0,
			0.0
		);
	}

	// apply perspective and model view matrixes to vertex position
	gl_Position = uPMatrix * uMVMatrix * position;

	// size of points
	gl_PointSize = uPointSize;

	// pass values to the fragment shader
	vTime = uTime;
	vColor = aVertexColor;
	vTextureCoord = aTextureCoord;
}
