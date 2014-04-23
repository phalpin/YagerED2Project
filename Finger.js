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
    options.StartingFlexion = cfg.StartingFlexion;
    options.Servo = new Servo({
        Pin: cfg.Servos[0].Pin,
        Debug: options.Debug,
        MinRotation: options.MinRotation,
        MaxRotation: options.MaxRotation,
        Min: options.Min,
        Max: options.Max
    });

    //if(options.Debug) log.i("Finger '" + name + "' initialized with config:", cfg);
    //if(options.Debug) log.i('Options:',options);

    var modifier = 1.8;

    var callbacks = [];

    var doCallbacks = function(amount){
        for(var cb in callbacks){
            callbacks[cb](name, amount);
        }
    };

    var beforeRot = function(oldAmount){
        doCallbacks(oldAmount);
    };

    var afterRot = function(newAmount){
        doCallbacks(newAmount);
    };

    var getRotationDegrees = function(percentage){
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
            if(options.Debug) log.i("Requested Flexion of finger " + name + ": " + amount);
            var rot = getRotationDegrees(amount);
            options.Servo.rotate(rot);
        },

        onFlex: function(callback){
            callbacks.push(callback);
        },

        currentFlexion: options.StartingFlexion
    };

    return retVal;
};