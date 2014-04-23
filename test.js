var log = require('./Log');
var b = require('bonescript');
var pin = 'P8_26';

b.pinMode(pin, b.OUTPUT, whenDone);


function whenDone(){
    log.i("Args: ", arguments);
    log.i('ATTEMPTED TO ENABLE PIN: ' + pin);
}
