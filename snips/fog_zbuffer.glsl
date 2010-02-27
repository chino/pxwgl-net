


//
// zbuffer as fog
//

// get the distance of the pixel
float perspective_far = 20000.0;
float fog_cord        = 1.0 - ((gl_FragCoord.z / gl_FragCoord.w) / perspective_far);

// apply the zbuffer distance as the fog variable
float fog         = fog_cord;

// mix vertex color with pixel color
vec4  frag_color  = vColor * pixel;

// white fog
vec4  fog_color   = vec4(1,1,1,0);

// mix together the frag color with the fog color
gl_FragColor = mix( fog_color, frag_color, clamp(fog,0.0,1.0) );


