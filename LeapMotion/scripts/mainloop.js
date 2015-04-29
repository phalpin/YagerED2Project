var mainLoop = function(duration, boneHand){

    //var sceneAvg = duration;
    var sceneAvg = duration;

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
            var tgtHand = retObj[handType(frame.hands[i])] = getFingers(frame.hands[i]);

            if(tgtHand) {
                var rollAmt = parseInt(frame.hands[i].roll() * (180 / Math.PI));
                var rollFactor = undefined;
                if(Math.abs(rollAmt) > 90){
                    rollAmt = rollAmt > 0 ? 90 : -90;
                }

                rollFactor = 100 - (rollAmt + 90)/1.8;
                tgtHand.Wrist = { Flexion: rollFactor };
            }
        }

        return retObj;
    };

    var ref = this;

    var tempHands = { Right: {}, Left: {} };

    var applyToTempHands = function(hands){
        var applyToTempHandFinger = function(hand, which, finger){
            if(!tempHands){
                tempHands = { Right: {}, Left: {} };
            }

            if(!tempHands[which][finger]){
                tempHands[which][finger] = 0;
            }

            tempHands[which][finger] += hand[which][finger].Flexion;
        };

        var applyFingers = function(hands, hand){
            applyToTempHandFinger(hands, hand, "Thumb");
            applyToTempHandFinger(hands, hand, "Pointer");
            applyToTempHandFinger(hands, hand, "Middle");
            applyToTempHandFinger(hands, hand, "Ring");
            applyToTempHandFinger(hands, hand, "Pinky");
            applyToTempHandFinger(hands, hand, "Wrist");
            iters[hand]++;
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
        var hands = {
            Right: {}, Left: {}
        };

        var adjustFinger = function(min, max, cur){
            var normalized = ((cur - min)/(max-min))*100;
            if(normalized > 100) normalized = 100;
            else if (normalized < 0) normalized = 0;
            return normalized;
        };

        for(var k in tempHands){
            var hand = tempHands[k];
            for(var j in hand){
                var finger = hand[j];
                finger /= iters[k];
                switch(j){
                    case "Thumb":
                        finger = adjustFinger(65, 100, finger);
                        break;
                    case "Pointer":
                        finger = adjustFinger(1.42, 100, finger);
                        break;
                    case "Middle":
                        finger = adjustFinger(8, 100, finger);
                        break;
                    case "Ring":
                        finger = adjustFinger(12, 100, finger);
                        break;
                    case "Pinky":
                        finger = adjustFinger(22, 100, finger);
                        break;
                }
                finger = finger < 0 ? 0 : finger;
                hands[k][j] = { Flexion: finger };
            }
            iters[k] = 0;
        }

        tempHands = { Right: {}, Left: {} };

        return hands;
    };

    var updateHands = function(hands){
        if(!hands.Right || hands.Right.Middle == undefined) hands.Right = null;
        if(!hands.Left || hands.Left.Middle == undefined) hands.Left = null;
        ref.Hands = hands;
        notifyObservers("update");
    };

    var theLoop = Leap.loop(function(frame) {

        var hands = parseHands(frame);
        applyToTempHands(hands);

        if(shouldExecute()) {
            var hands = getTempHandAvg();
            updateHands(hands);
            //var hands = parseHands(frame);
            updateHands(hands);
        }

        sceneIter++;
    });

    if(boneHand){
        boneHand.targetEl = boneHand.targetEl ? boneHand.targetEl : document.body;
        if(boneHand.display === true){
            theLoop.use('boneHand', {
                targetEl: boneHand.targetEl,
                arm: false,
                boneColor: (new THREE.Color).setHex(0x111111),
                jointColor: (new THREE.Color).setHex(0x5daa00)
            });
        }

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

    function notifyObservers(event){
        for(var i = 0; i < ref.callbacks[event].length; i++){
            try{
                ref.callbacks[event][i]();
            }
            catch(ex){
                console.warn('Exception in Notification:', ex);
            }
        }
    }

    this.on = function(event, callback){
        if(!this.callbacks[event]) this.callbacks[event] = [];
        this.callbacks[event].push(callback);
    };


    //endregion

    return this;
};