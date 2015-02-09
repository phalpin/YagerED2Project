var mainLoop = function(duration, displayBonehand){

    var sceneAvg = duration;

    var sceneIter = 0;

    var shouldExecute = function(){
        return sceneIter % sceneAvg == 0;
    };

    var whichFinger = function(finger){
        switch(finger.type){
            case 0:
                return "Thumb";
            case 1:
                return "Pointer";
            case 2:
                return "Middle";
            case 3:
                return "Ring";
            case 4:
                return "Pinky";
        };
    };

    var parseFinger = function(finger){
        var retObj = {};

        //Transformation
        retObj = {
            Flexion: finger.extended ? 0 : 100
        };

        return retObj;
    };

    var getFingers = function(hand){
        var retObj = {
            Thumb: null,
            Pointer: null,
            Middle: null,
            Ring: null,
            Pinky: null
        };

        for(var i = 0; i < hand.fingers.length; i++){
            var which = whichFinger(hand.fingers[i]);
            retObj[which] = parseFinger(hand.fingers[i]);
        }

        return retObj;
    };

    var parseHands = function(frame){
        var retObj = {
            Right: null,
            Left: null
        };

        var handType = function(hand){
            switch(hand.type){
                case 'right':
                    return 'Right';
                case 'left':
                    return 'Left';
            }
        };

        for(var i = 0; i < frame.hands.length; i++){
            retObj[handType(frame.hands[i])] = getFingers(frame.hands[i]);
        }

        return retObj;
    };

    var ref = this;

    var theLoop = Leap.loop(function(frame) {


        if(shouldExecute()){
            var hands = parseHands(frame);
            ref.Hands = hands;
        }

        sceneIter++;
    });

    if(displayBonehand){
        theLoop.use('boneHand', {
            targetEl: document.body,
            arm: false
        });
    }


    this.Hands = {
        Right: null,
        Left: null
    };

    //region Callback Management
    this.Events = {
        FlexionUpdate: "flexionUpdate"
    };

    this.callbacks = {};
    this.callbacks[this.Events.FlexionUpdate] = [];


    this.on = function(event, callback){

    };


    //endregion

    return this;
};