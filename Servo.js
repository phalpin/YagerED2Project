var log = require('./Log');
var b = require('bonescript');

module.exports = function(options){
    var opts = {
        Pin: 'P9_14',
        Debug: false,
        StartingRotation: 0
    };
    if(options){
        if(options.Pin) opts.Pin = options.Pin;
        if(options.Debug) opts.Debug = options.Debug;
        if(options.StartingRotation) opts.StartingRotation = parseInt(options.StartingRotation);
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
        var min = 0.028, max = 0.137;
        var diff = max - min;
        var adj = diff / 180.0;
        var calc = min + (requestedRotation * adj);
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
        if(success.value === true){
            curRotation = reqRotation;
            reqRotation = -1;
            doCallbacks(curRotation, afterCallbacks);
        }
        else{
            log.e("Failure to rotate to " + reqRotation + " degrees");
            reqRotation = -1;
        }
    };
    //endregion



    var retVal = {

        /**
         * The rotate method - enter a value from 0 to 180 degrees to have the servo rotate.
         * @param amount Value (degrees) from 0 to 180 degrees.
         */
        rotate: function(amount){
            var amt = parseInt(amount);
            beforeRot(amt);
            if(amt != curRotation){
                var rot = getRotAmount(amount);
                debug(function(){
                    log.i("Requested Rotation: ", process.argv[2]);
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
    log.i('Servo initialized with pin:', opts.Pin, ' to angle:', opts.StartingRotation);
    return retVal;
};
