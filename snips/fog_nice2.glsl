
// density of fog
float density = 0.0005;


// calculation from  
// http://www.ozone3d.net/tutorials/glsl_fog/p04.php

const float LOG2 = 1.442695;
float z = gl_FragCoord.z / gl_FragCoord.w;
float fogFactor = exp2( -density * density * z *  z * LOG2 );
fogFactor = clamp(fogFactor, 0.0, 1.0);





// mix vertex color with pixel color
vec4  frag_color = vColor * pixel;

// fog color is white
vec4  fog_color = vec4(1,1,1,0);

// mix together the frag color with the fog color
gl_FragColor = mix(fog_color, frag_color, fogFactor );



