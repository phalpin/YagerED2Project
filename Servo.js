var log = require('./Log');
var b = require('octalbonescript');

var readFile = function(){
    var val = fs.readFileSync(configFilePath, { encoding: fileEncoding });
    return JSON.parse(val);
};

module.exports = function(options){
    var opts = {
        Pin: 'P9_14',
        Debug: false,
        StartingRotation: 0,
        Min: 0.028,
        Max: 0.137
    };

    if(options){
        if(options.Pin) opts.Pin = options.Pin;
        if(options.Debug) opts.Debug = options.Debug;
        if(options.StartingRotation) opts.StartingRotation = parseInt(options.StartingRotation);
        if(options.Min) opts.Min = options.Min;
        if(options.Max) opts.Max = options.Max;
        if(options.MinRotation !== undefined) opts.MinRotation = options.MinRotation;
        if(options.MaxRotation !== undefined) opts.MaxRotation = options.MaxRotation;
    }

    var SERVO = opts.Pin;
    var SPEED = 60;
    var curRotation = opts.StartingRotation;
    var reqRotation = -1;
    var beforeCallbacks = [];
    var afterCallbacks = [];

    //region Helper Methods
    var getRotAmount = function(req){
        var requestedRotation = parseFloat(req);

        if (requestedRotation > 180){
            requestedRotation %= 180;
        }

        var diff = opts.Max - opts.Min;
        var adj = diff / 180.0;
        var calc = opts.Min + (requestedRotation * adj);
        return calc;
    };

    var doCallbacks = function(rot, cbs){
        for(var cb in cbs){
            cbs[cb](rot);
        }
    };

    var debug = function(func){
        if(opts.Debug === true){
            func();
        }
    };

    var beforeRot = function(amount){
        reqRotation = amount;
        doCallbacks(curRotation, beforeCallbacks);
    };

    var afterRot = function(success){
        curRotation = reqRotation;
        reqRotation = -1;
        doCallbacks(curRotation, afterCallbacks);
    };
    //endregion



    var retVal = {

        /**
         * The rotate method - enter a value from 0 to 180 degrees to have the servo rotate.
         * @param amount Value (degrees) from 0 to 180 degrees.
         */
        rotate: function(amount){
            var amt = amount;
            beforeRot(amt);
            if(amt != curRotation){
                var rot = getRotAmount(amount);
                debug(function(){
                    log.i("Requested Rotation:", amount);
                    log.i("Evaluated PWM:", rot);
                });
                b.analogWrite(SERVO, rot, SPEED, afterRot);
            }
            else{
                afterRot({value: true});
            }
        },

        /**
         * Allows you to add a callback before the servo rotates.
         * @param callback
         */
        beforeRotate: function(callback){
            beforeCallbacks.push(callback);
        },

        /**
         * Allows you to add a callback after the servo rotates.
         * @param callback
         */
        afterRotate: function(callback){
            afterCallbacks.push(callback);
        },

        /**
         * Returns the amount of rotation of this servo currently.
         * @returns {number}
         */
        getRotation: function(){
            return curRotation;
        },

        /**
         * Increases the current rotation by X (provided) degrees.
         * @param amount
         */
        increaseBy: function(amount){
            retVal.rotate(curRotation + amount);
        }
    };

    b.pinMode(SERVO, b.OUTPUT);
    debug(function(){log.i('Servo initialized with pin:', opts.Pin, ' to angle:', opts.StartingRotation);});
    return retVal;
};
