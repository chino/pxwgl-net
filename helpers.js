
	var get_ticks = function(){ return new Date().getTime(); }

  // Only add setZeroTimeout to the window object, and hide everything
  // else in a closure.
  var add_setZeroTimeout = function() 
	{
        var timeouts = [];
        var messageName = "zero-timeout-message";

        // Like setTimeout, but only takes a function argument.  There's
        // no time argument (always zero) and no arguments (you have to
        // use a closure).
        function setZeroTimeout(fn) {
            timeouts.push(fn);
            window.postMessage(messageName, "*");
        }

        function handleMessage(event) {
            if (event.source == window && event.data == messageName) {
                event.stopPropagation();
                if (timeouts.length > 0) {
                    var fn = timeouts.shift();
                    fn();
                }
            }
        }

        window.addEventListener("message", handleMessage, true);

        // Add the one thing we want added to the window object.
        window.setZeroTimeout = setZeroTimeout;
   }

  function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
      return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
      if (k.nodeType == 3) {
        str += k.textContent;
      }
      k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
      return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(shader));
      return null;
    }

    return shader;
  }
