var log = require('./Log');
var Servo = require('./Servo');
var fs = require('fs');
var configFilePath = 'config/rotation.json';
var fileEncoding = 'utf8';

var updateFile = function(amount){
	var rotation = {
		rotation: amount
	};
	
	fs.writeFileSync(configFilePath, JSON.stringify(rotation), { encoding: fileEncoding }, function(err){
		if(err){
			log.e("Failed to write to rotation file", err);
		}
		else{
			log.i("Saved rotation information for next run.");
		}
	});
};

var readFile = function(){
	var val = fs.readFileSync(configFilePath, { encoding: fileEncoding });
	return JSON.parse(val);
};

var oldValue = readFile();

var testServo = new Servo({
	Pin: 'P9_14',
	Debug: false,
	StartingRotation: oldValue.rotation
});

testServo.afterRotate(function(deg){
	log.i("Rotation state after the call: " + deg + " degrees");
	updateFile(deg);
});

testServo.beforeRotate(function(deg){
	log.i("Rotation state prior to call: " + deg + " degrees");
});

testServo.rotate(process.argv[2]);