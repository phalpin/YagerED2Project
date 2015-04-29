setTimeout(function(){
    var time = 100;
    var webApp = new mainLoop(time, {
        display: true,
        targetEl: document.getElementById("boneHandDisplay")
    });

    var reportFinger = function(hand, finger){
        console.log("   [" + finger + "]:", hand[finger]);
    };

    var reportHand = function(hands, which){
        console.log(which + " hand");
        var hand = hands[which];
        reportFinger(hand, "Wrist");
        reportFinger(hand, "Thumb");
        reportFinger(hand, "Pointer");
        reportFinger(hand, "Middle");
        reportFinger(hand, "Ring");
        reportFinger(hand, "Pinky");
    };

    var reportHands = function(hands){
        if(hands.Right) reportHand(hands, "Right");
        else console.log("RIGHT HAND NOT IN FRAME");

        if(hands.Left) reportHand(hands, "Left");
        else console.log("LEFT HAND NOT IN FRAME");
    };

    webApp.on('update', function(){
        reportHands(webApp.Hands);
    });
}, 0);
