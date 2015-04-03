var mainLoop = function(duration, displayBonehand){

    //var sceneAvg = duration;
    var sceneAvg = 1;

    var sceneIter = 0;
    var iters = {
        Right: 0,
        Left: 0
    };

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

    var getFlexionFromAngle = function(angle){
        var fingerFlexion = angle >= 90 ? 100 : angle * 1.1111111;
        var invertedFlexion = 100 - fingerFlexion;

        return parseInt(fingerFlexion);
    };

    var getFlexion = function(finger, hand){
        var indexNorm = finger.proximal.direction();
        var palmNorm = hand.palmNormal;
        var angle = Math.acos(Leap.vec3.dot(indexNorm, palmNorm));
        var angleDeg = parseInt(angle * (180 / Math.PI));


        return getFlexionFromAngle(angleDeg);
    };

    var parseFinger = function(finger, hand){
        var retObj = {};

        //Transformation
        retObj = {
            Flexion: getFlexion(finger, hand)
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
            retObj[which] = parseFinger(hand.fingers[i], hand);
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

            if(frame.hands[i]) {
                var rollAmt = parseInt(frame.hands[i].roll() * (180 / Math.PI));
                var rollFactor = undefined;
                if(Math.abs(rollAmt) > 90){
                    rollAmt = rollAmt > 0 ? 90 : -90;
                }

                rollFactor = 100 - (rollAmt + 90)/1.8;
                console.log("Roll:", rollAmt);
                console.log("RollFactor:", rollFactor);
            }
            retObj[handType(frame.hands[i])] = getFingers(frame.hands[i]);
        }

        return retObj;
    };

    var ref = this;

    var tempHands = { Right: null, Left: null };

    var applyToTempHands = function(hands){
        var applyToTempHandFinger = function(hand, which, finger){
            if(!tempHands){
                tempHands = { Right: null, Left: null };
            }

            if(!tempHands[which][finger]){
                tempHands[which][finger] = 0;
            }

            tempHands[which][finger] += hand[finger];
            iters[which]++;
        };

        var applyFingers = function(hands, hand){
            applyToTempHandFinger(hands, hand, "Thumb");
            applyToTempHandFinger(hands, hand, "Pointer");
            applyToTempHandFinger(hands, hand, "Middle");
            applyToTempHandFinger(hands, hand, "Ring");
            applyToTempHandFinger(hands, hand, "Pinky");
        };

        if(hands.Right != null){
            var hand = "Right";
            applyFingers(hands, hand);
        }

        if(hands.Left != null){
            var hand = "Left";
            applyFingers(hands, hand);
        }

    };

    var getTempHandAvg = function(){

    };

    var updateHands = function(hands){
        ref.Hands = hands;
    };

    var theLoop = Leap.loop(function(frame) {


        if(shouldExecute()){
            var hands = parseHands(frame);
            updateHands(hands);
            //if(tempHands != null){
                //var hands = getTempHandAvg();
                //updateHands(hands);
            //}
            //else{
                //updateHands(hands);
            //}

        }
        else{
            //var hands = parseHands(frame);
            //applyToTempHands(hands);
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
        var tgt = this.callbacks[this.Events.FlexionUpdate];
        if(!tgt) tgt = [];

        tgt.push(callback);
    };


    //endregion

    return this;
};