


// get the distance of the pixel

float perspective_far = 20000.0;
float fog_cord = (gl_FragCoord.z / gl_FragCoord.w) / perspective_far;

// density of fog

float fog_density = 6.0;

// increase fog by density
// fog also thickens with distance

float fog = fog_cord * fog_density;

// mix vertex color with pixel color

vec4  frag_color = vColor * pixel;

// fog color is white

vec4  fog_color = vec4(1,1,1,0);

// mix together the frag color with the fog color

gl_FragColor = mix( fog_color, frag_color, clamp(1.0-fog,0.0,1.0) );




