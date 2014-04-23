var Servo = require('./Servo');
var log = require('./Log');

module.exports = function(name, cfg){

    if(!name){
        throw new Error("You must include a name for the finger!");
    }

    if(!cfg){
        throw new Error("You must include a configuration for finger '" + name + "'!");
    }


    var options = {};
    options.Debug = cfg.Debug;
    options.MinRotation = cfg.MinRotation;
    options.MaxRotation = cfg.MaxRotation;
    options.Servo = new Servo({
        Pin: cfg.Servos[0].Pin,
        Debug: options.Debug,
        min: options.MinRotation,
        max: options.MaxRotation
    });


    var callbacks = [];

    var doCallbacks = function(amount){
        for(var cb in callbacks){
            callbacks[cb](amount);
        }
    };

    var beforeRot = function(oldAmount){
        doCallbacks(oldAmount);
    };

    var afterRot = function(newAmount){
        doCallbacks(newAmount);
    };

    var getRotationDegrees = function(percentage){
        //return percentage / .00555556;
        return percentage * modifier;
    };

    var getRotationPct = function(degrees){
        return degrees / modifier;
    };


    options.Servo.beforeRotate(function(deg){
        beforeRot(getRotationPct(deg));
    });

    options.Servo.afterRotate(function(deg){
        afterRot(getRotationPct(deg));
    });
    //endregion

    var retVal = {

        /**
         * Method to retrieve the details of this particular finger.
         * @returns {{Name: *, Servos: {Pin: (opts.Pin|*)}[]}}
         */
        getDetails: function(){
            return {
                Name: options.Name,
                Debug: options.Debug,
                Servos:[
                    {
                        "Pin": options.Pin
                    }
                ]
            };
        },

        /**
         * Method to flex a finger.
         * @param amount Percentage you want to flex a given finger (0 to 100)
         */
        flex: function(amount){
            debug(function(){ log.i("Requested Rotation of finger " + options.Name + ": " + amount);});
            hostServo.rotate(getRotationDegrees(amount));
        }
    };

    return retVal;
};