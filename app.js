var configFilePath = 'config/config.json';
var rotFilePath = 'config/rotation.json';
var fileEncoding = 'utf8';
var serverPort = 8079;




//region Requires
var log = require('./Log'),
    fs = require('fs'),
    WebSocketServer = require('ws').Server,
    Finger = require('./Finger')
;
//endregion



//Create the WebSocketServer



//region File Handling.
var readFile = function(path, encoding){
    return fs.readFileSync(path, { encoding: encoding });
};

var readConfigFile = function(){
    return JSON.parse(readFile(configFilePath));
};

var readRotFile = function(name){
    return JSON.parse(readFile(rotFilePath));
}

var writeRotFile = function(rotObj){
    fs.writeFileSync(rotFilePath, JSON.stringify(rotObj), { encoding: fileEncoding }, function(err){
        if(err){
            log.e("Failed to write to rotation file", err);
        }
        else{
            log.i("Saved rotation information for next run.");
        }
    });
};
//endregion

var cfg = readConfigFile();
var rot = readRotFile();
var _fingers = {};
var wss = new WebSocketServer({ port: serverPort })
log.i("Server Created on port " + serverPort);

//region Instantiation of the fingers.
for(var k in cfg.Fingers){
    var obj = cfg.Fingers[k];

    var getServoMinMax = function(configRequested){
        var r = cfg.ServoConfigs[configRequested];
        if(!r) throw new Error("Unknown Servo Configuration: ", configRequested);
        return r;
    };

    //Set up the rotation configuration.
    for(var s in obj.Servos){
        var servo = obj.Servos[s];
        var minMax = getServoMinMax(servo.ServoConfig);
        //log.i("MinMax Read:", minMax);
        servo.Min = minMax.min;
        servo.Max = minMax.max;
    }

    //Set up the starting flexion.
    if(rot[k] !== undefined) obj.StartingFlexion = rot[k];

    //Add it to the managed list.
    var fingerObj = new Finger(k, obj);


    fingerObj.onFlex(function(name, amount){
        rot[name] = amount;
        writeRotFile(rot);
    });

    _fingers[k] = fingerObj;
}
//endregion

var messageType = {
    COMMAND: 0,
    FLEXION: 1,
    MULTIFLEXION: 2
};

var handleCommand = function(command){
    switch(command.toLowerCase()){
        case 'exit':
            process.exit(0);
            break;
    }
};

var handleFlexion = function(command){
    if(_fingers[command.Finger]){
        _fingers[command.Finger].flex(command.FlexAmount);
    }
};

/*
[
    {
        Finger: name,
        FlexAmount: amount
    },
     {
         Finger: name,
         FlexAmount: amount
     }
]

 */

var handleMultiFlexion = function(command){
    for(var i = 0; i < command.length; i++){
        handleFlexion(command[i]);
    }
};

wss.on('connection', function(ws){

    //region Connection Setup (Initial DTO, message passing, etc);
    var INITDTO = {};
    for(var k in _fingers){
        _fingers[k].onFlex(function(name, amount){
            var retDto = {
                Name: name,
                Flexion: amount
            };


            ws.send(JSON.stringify(retDto));
        });
    }
    ws.send(JSON.stringify(_fingers));
    //endregion

    //region Message Handling.
    ws.on('message', function(message){
        log.i("message:", message);
        var cmd = JSON.parse(message);
        switch(cmd.Type){
            case messageType.COMMAND:
                handleCommand(cmd.Command);
                break;
            case messageType.FLEXION:
                handleFlexion(cmd.Command);
                break;
            case messageType.MULTIFLEXION:
                handleMultiFlexion(cmd.Command);
                break;
        }
    });
    //endregion
});


process.on('exit', function(code){
    log.i('Process exiting with code ' + code);
    console.log();
})
