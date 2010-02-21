var step = 100;
var movement = new Vec(0,0,0);
var bindings = {
	w: 'forward',
	s: 'back',
	e: 'up',
	d: 'down',
	f: 'left',
	g: 'right'
}
var actions = {
	forward: function(pressed){ pressed ? movement.z += step : movement.z = 0; },
	back: function(pressed){ pressed ? movement.z -= step : movement.z = 0; },
	up: function(pressed){ pressed ? movement.y += step : movement.y = 0; },
	down: function(pressed){ pressed ? movement.y -= step : movement.y = 0; },
	left: function(pressed){ pressed ? movement.x -= step : movement.x = 0; },
	right: function(pressed){ pressed ? movement.x += step : movement.x = 0; }
}
//var max_speed = step*3;
//var full_speed_fovy = 130;
var input = function(button,pressed)
{
	var action = bindings[button.toLowerCase()];
	if(!actions[action]) { return; }
	actions[action](pressed);
//	var speed = Math.abs(movement.z) + Math.abs(movement.x) + Math.abs(movement.y);
//	var avg = speed/max_speed;
//	var fovy = current_fovy;
//	if(avg>step){fovy = full_speed_fovy*avg}
//	_gl.perspective(fovy, 1.0, 10.0, 100000.0);
}
var keyboard = 
{
	pressed: {},
	press: function(e)
	{
		var c = String.fromCharCode(e.keyCode);
		if(!keyboard.pressed[c])
		{
			keyboard.pressed[c] = true; 
			input(c,true); 
		}
	},
	release: function(e)
	{
		var c = String.fromCharCode(e.keyCode);
		if(keyboard.pressed[c])
		{
			keyboard.pressed[c] = false;
			input(c,false);
		}
	}
}

