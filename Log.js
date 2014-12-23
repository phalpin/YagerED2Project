var util = require('util');

var out = function(val){
    process.stdout.write(val);
};

var err = function(val){
    process.stderr.write(val);
};

module.exports = {

    //Info Method
    i: function(){
        out("[INFO]: " + util.format.apply(this, arguments) + "\n");
    },

    //Log Method
    l: function(){
        out("[LOG]: " + util.format.apply(this, arguments) + "\n");
    },

    //Warn Method
    w: function(){
        out("[WARN]: " + util.format.apply(this, arguments) + "\n");
    },

    //Error Method
    e: function(){
        err("[ERROR]: " + util.format.apply(this, arguments) + "\n");
    }

};