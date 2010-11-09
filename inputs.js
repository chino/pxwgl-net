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
	forward: function(pressed){ pressed ? movement.z = -1 : movement.z = 0; },
	back:    function(pressed){ pressed ? movement.z =  1 : movement.z = 0; },
	up:      function(pressed){ pressed ? movement.y =  1 : movement.y = 0; },
	down:    function(pressed){ pressed ? movement.y = -1 : movement.y = 0; },
	left:    function(pressed){ pressed ? movement.x = -1 : movement.x = 0; },
	right:   function(pressed){ pressed ? movement.x =  1 : movement.x = 0; }
}
//var max_speed = 1*3;
//var full_speed_fovy = 130;
var input = function(button,pressed)
{
	var action = bindings[button.toLowerCase()];
	if(!actions[action]) { return; }
	actions[action](pressed);
//	var speed = Math.abs(movement.z) + Math.abs(movement.x) + Math.abs(movement.y);
//	var avg = speed/max_speed;
//	var fovy = current_fovy;
//	if(avg>1){fovy = full_speed_fovy*avg}
//	_gl.perspective(fovy, 1.0, 10.0, 100000.0);
}
var keyboard = 
{
	pressed: {},
	press: function(e)
	{
		var c = String.fromCharCode(e.which);
		if(!keyboard.pressed[c])
		{
			keyboard.pressed[c] = true; 
			input(c,true); 
		}
	},
	release: function(e)
	{
		var c = String.fromCharCode(e.which);
		if(keyboard.pressed[c])
		{
			keyboard.pressed[c] = false;
			input(c,false);
		}
	}
}
var inputs_active = false;
var init_inputs = function()
{
	var e = $('#canvas-wrapper');
	mouse = new Mouse();
	e.mouseout(function(e)
	{
		movement = new Vec(0,0,0); 
		inputs_active = false;
		mouse.out(e);
	});
	e.mouseover(function(e)
	{
		inputs_active = true;
		mouse.over(e);
	});
	e.mousemove(function(e)
	{
		mouse.input(e)
	});
	$(document).keydown(function(e)
	{
		if(!inputs_active){return}
		keyboard.press(e);
	});
	$(document).keyup(function(e)
	{
		if(!inputs_active){return}
		keyboard.release(e);
	});
}
