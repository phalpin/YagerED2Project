var log = require('./Log');
var Servo = require('./Servo');
var fs = require('fs');
var configFilePath = 'config/config.json';
//var configFilePath = 'config/rotation.json';
var fileEncoding = 'utf8';
var serverPort = 8079;


//region Servo Configuration
var Finger = require('./Finger');
var _fingers = [];
//endregion

//Create the WebSocketServer
//var WebSocketServer = require('ws').Server, wss = new WebSocketServer({ port: serverPort });
//log.i("Server Created on port " + serverPort);

//region Configuration File
var readConfigFile = function(){
    var val = fs.readFileSync(configFilePath, { encoding: fileEncoding });
    return JSON.parse(val);
};
var cfg = readConfigFile();
//endregion

//region Instantiation of the fingers.
for(var k in cfg.Fingers){
    var obj = cfg.Fingers[k];
    _fingers.push(new Finger(k, obj));
}
//endregion

/*
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
    Debug: true,
    StartingRotation: oldValue.rotation
});

//endregion

wss.on('connection', function(ws){
    var rotOnConn = testServo.getRotation();
    ws.send(testServo.getRotation().toString());
    log.i('Received new connection, sent original rotation:', rotOnConn);

    ws.on('message', function(message){
        log.i("message:", message);
        switch(message.toLowerCase()){
            case 'exit':
                process.exit(0);
                break;
            case 'increment':
                testServo.increaseBy(1);
                break;
            case 'decrement':
                testServo.increaseBy(-1);
                break;
            default:
                testServo.rotate(message);
                break;
        }
    });

    testServo.afterRotate(function(deg){
        log.i("Rotation state after the call: " + deg + " degrees");
        updateFile(deg);
        ws.send(deg.toString());
        //testServo2.rotate(deg);
    });

    testServo.beforeRotate(function(deg){
        log.i("Rotation state prior to call: " + deg + " degrees");
    });
});
*/


process.on('exit', function(code){
    log.i('Process exiting with code ' + code);
})
