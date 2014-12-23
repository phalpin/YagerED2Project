var log = require('./Log');
var Servo = require('./Servo');
var fs = require('fs');
var configFilePath = 'config/rotation.json';
var fileEncoding = 'utf8';
var serverPort = 8079;

var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ port: serverPort });

log.i("Server Created on port " + serverPort);

//region Servo Creation & Management.
var readFile = function(){
    var val = fs.readFileSync(configFilePath, { encoding: fileEncoding });
    return JSON.parse(val);
};
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
var oldValue = readFile();
var testServo = new Servo({
    Pin: 'P9_14',
    Debug: false,
    StartingRotation: oldValue.rotation
});
//endregion

wss.on('connection', function(ws){
    ws.on('message', function(message){
        if(message.toLowerCase() === 'exit'){
            process.exit(0);
        }
        testServo.rotate(message);
    });

    ws.send('welcome to Yager');

    testServo.afterRotate(function(deg){
        log.i("Rotation state after the call: " + deg + " degrees");
        updateFile(deg);
        ws.send(deg);
    });

    testServo.beforeRotate(function(deg){
        log.i("Rotation state prior to call: " + deg + " degrees");
    });
});



process.on('exit', function(code){
    log.i('Process exiting with code ' + code);
})

/*
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
*/