
var CollisionTest =
{
	// vector, vector, vector, scalar, scalar, hash
	ray_sphere: function( p, d, sp, sr, info )
	{
		var m = p.minus( sp );
		var b = m.dot(d);
		var c = m.dot() - Math.pow(sr,2);
		// test if start point is outside of sphere and pointing away
		if( c > 0.0 && b > 0.0 ){ return false }
		var discr = b*b - c;
		// if negative than ray missed sphere
		if( discr < 0.0 ){ return false }
		// user doesn't want to know when/where collision happened
		if(!info){ return true }
		var t = -b - Math.sqrt(discr);
		// if t is negative ray started inside sphere so clamp t
		if( t < 0.0 ){ t = 0.0; }
		var fa = p.plus( d.multiply( t ) );
		var fb = sp.plus( d.multiply( t ) );
		// return values back to user
		info.t  = t;
		info.fa = fa;
		info.fb = fb;
		return true;
	},
	segment_sphere: function( p, d, sp, sr, l, info )
	{
		// test if the ray passes through the sphere
		if(!this.ray_sphere( p, d, sp, sr, info )){return false}
		// test that collision point is on the line segment
		return (info.t <= l);
	},
	sphere_sphere: function( a, b, info )
	{
		// reduce test to only a single moving sphere
		// b becomes a stationary sphere 
		// v represents movement of both spheres
		var v = a.velocity.minus( b.velocity );
		var vlen = v.length2();

		// both spheres apparently have same velocity
		// they must be moving parrallel so cannot collide
		// TODO - do we need to now detect if they are already touching? 
		if(vlen == 0.0){return false};

		// reduce test to line segment vs sphere
		// b's radius will increase by a's
		// and 'a' becomes a point
		var r = b.radius + a.radius;

		// test if line segment passes through sphere
		// line segment representing movement in 'v' from start to finish
		return this.segment_sphere( a.pos, v.divide_scalar(vlen), b.pos, r, vlen, info );
	}
}

var CollisionResponse =
{
	sphere_sphere: function( a, b, info )
	{
		// since drag is only applied per frame we don't need to update velocity
		//a.velocity = info.fa - a.pos
		//b.velocity = info.fb - b.pos

		// update sphere positions to the location where they collide
		a.pos = info.fa;
		b.pos = info.fb;

		// http://en.wikipedia.org/wiki/Inelastic_collision
		// http://en.wikipedia.org/wiki/Elastic_collision

		var v = a.pos.minus( b.pos ); // vector between spheres
		var vn = v.normalize();

		var u1 = vn.multiply_scalar( vn.dot(a.velocity) ); // collision component of velocity
		var u2 = vn.multiply_scalar( vn.dot(b.velocity) );

		a.velocity = a.velocity.minus( u1 ); // remove collision component
		b.velocity = b.velocity.minus( u2 );

		var vi = u1.multiply_scalar( a.mass ).plus( u2.multiply_scalar( b.mass ) ); // vi states if collision is elastic or inelastic
		var vea = u1.multiply_scalar( a.mass - b.mass ).plus( u2.multiply_scalar( 2 * b.mass ) ); // velocity for elastic collision for object a
		var veb = u2.multiply_scalar( b.mass - a.mass ).plus( u1.multiply_scalar( 2 * a.mass ) ); // velocity for elastic collision for object b
		var bounce = a.bounce + b.bounce // bounce must be between 0 and 1
		if(bounce > 1){bounce = 1.0}
		if(bounce < 0){bounce = 0.0}
		var fva = vea.multiply_scalar( bounce ).plus( vi.multiply_scalar( 1 - bounce ) ); // if bounce = 1, use elastic; if bounce = 0, use inelastic
		var fvb = veb.multiply_scalar( bounce ).plus( vi.multiply_scalar( 1 - bounce ) ); // for values between 0 and 1, pick a point in the middle
		fva = fva.divide_scalar( a.mass + b.mass ); // final velocity of a
		fvb = fvb.divide_scalar( a.mass + b.mass ); // final velocity of b

// isn't it better to set them to fv ?

		a.velocity = fva; //a.velocity.plus( fva );
		b.velocity = fvb; //b.velocity.plus( fvb );

// debugging

		// detect if objects are stuck inside one another after movement
		var afp = a.pos.plus( a.velocity ); // pos after movement
		var bfp = b.pos.plus( b.velocity );
		var radius = a.radius + b.radius; // collision distance
		if( afp.minus( bfp ).length2() > Math.pow(radius,2) ){return}

		// if so separate them
		a.pos = a.pos.plus( vn.multiply_scalar( a.radius ) ); // move them apart by their radius
		b.pos = b.pos.minus( vn.multiply_scalar( b.radius ) );
		log("collision response did not successfully separate objects");
	}
}

var BroadPhase =
{
	sphere: function(bodies)
	{
		var collisions = [];
		for(var i=0; i<bodies.length; i++)
		{
			var a = bodies[i];
			var a_has_velocity = a.velocity.has_velocity();
			// only check each pair once
			for(var j=(i+1); j<bodies.length; j++)
			{
				var b = bodies[j];
				// check collision masks
				//if (!(b.mask.include?(a.type) && (!a.mask.include?(b.type)){continue}
				// only check if either sphere moving
				if (!(a_has_velocity || b.velocity.has_velocity())){continue}
				// collect spheres which collide and the time/place it happens
				var info = {};
				if(CollisionTest.sphere_sphere( a, b, info ))
				{
					collisions.push([a,b,info])
				}
			}
		}
		return collisions;
	}
}

var Body = function(s)
{
	this.type          = s['type'];
	this.mask          = s['mask'];

	this.on_collision  = s['on_collision']  || function(){return true};
	this.pos           = s['pos']           || new Vec(0,0,0);
	this.orientation   = s['orientation']   || new Quat(0, 0, 0, 1).normalize()
	this.velocity      = s['velocity']      || new Vec(0,0,0);

	this.rotation_velocity  = s['rotation_velocity'] || new Vec(0,0,0);
	this.mass          = s['mass']          || 1;

	this.bounce        = s['bounce'];
	this.drag          = s['drag'];
	this.rotation_drag = s['rotation_drag'];

	// numbers can be 0 which in js is boolean false
  if(!this.mass){throw("mass cannot be zero")};
	if(s.rotation_drag == undefined){ this.rotation_drag = 5 }
	if(s.drag == undefined){ this.drag = 0.1 }
	if(s.bounce == undefined){ this.bounce = 0.5 } 
}
Body.prototype =
{
	move: function( vector ) // eye space
	{
		this.pos = this.pos.plus(
			this.orientation.vector(
				vector 
			) 
		);
	},
	rotate: function( vector )
	{
		this.orientation = this.orientation.rotate(
			vector.x, vector.y, vector.z
		); 
	}
}
var SphereBody = function(s)
{
	var body = new Body(s);
	body.radius = s.radius || 50;
	return body;
}


var World = function()
{
	this.bodies = []
	this.last_run = get_ticks();
	this.interval = 1/40
}
World.prototype =
{
	update: function()
	{
		if(!this.check_interval()){return}
		this.drag();
		this.collisions();
		if(this.callback){return this.callback()}
		this.velocities();
	},
	check_interval: function()
	{
		if(!this.interval){return true}
		if((get_ticks() - this.last_run) < this.interval){return false}
		this.last_run = get_ticks();
		return true;
	},
	drag: function()
	{
		for(var i=0; i<this.bodies.length; i++)
		{
			var body = this.bodies[i];
			if( body.velocity.has_velocity() )
			{
				body.velocity = body.velocity.minus(
					body.velocity.multiply_scalar(
						body.drag
					)
				);
			}
			if( body.rotation_velocity.has_velocity() )
			{
				body.rotation_velocity = body.rotation_velocity.minus(
					body.rotation_velocity.multiply_scalar(
						body.rotation_drag
					)
				);
			}
		}
	},
	collisions: function()
	{
		var pairs = BroadPhase.sphere( this.bodies );
		for( var i=0; i<pairs.length; i++)
		{
			var a = pairs[i][0];
			var b = pairs[i][1];
			var info = pairs[i][2];
			if( ! a.on_collision( a, b ) ) { continue }
			if( ! b.on_collision( b, a ) ) { continue }
			CollisionResponse.sphere_sphere( a, b, info );
		}
	},
	velocities: function()
	{
		for( var i=0; i<this.bodies.length; i++)
		{
			var body = this.bodies[i];
			if( body.velocity.has_velocity() )
			{
				body.pos = body.pos.plus( body.velocity );
			}
			if( body.rotation_velocity.has_velocity() )
			{
				body.rotate( body.rotation_velocity );
			}
		}
	}
}
