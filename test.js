var b = require('bonescript');
var SERVO = 'P9_14';
var SPEED = 60;




var getRotAmount = function(req){
	var requestedRotation = parseFloat(req);
	if (requestedRotation > 180){
		requestedRotation %= 180;
	}
	var min = 0.028, max = 0.137;
	var diff = max - min;
	var adj = diff / 180.0;
	var calc = min + (requestedRotation * adj);
	return calc;
}

var rot = getRotAmount(process.argv[2]);
console.log("Requested Rotation: ", process.argv[2]);
console.log("Evaluated PWM:", rot);

b.pinMode(SERVO, b.OUTPUT);
b.analogWrite(SERVO, rot, SPEED);