var webApp = angular.module('yager', []);
var curClient;

webApp.controller('fingerCtrl', [
    '$scope', 'wsSvc', '$rootScope', '$timeout',
    function($scope, wsSvc, $rootScope, $timeout){
        $scope.client = wsSvc.start();

        $scope.timeBetweenLoops = 50;
        $scope.leapMotion = new mainLoop($scope.timeBetweenLoops, false);
        $scope.fingers = {};

        $scope.shouldUpdateFromLeapMotion = false;
        $scope.massSelectedFingers = [];
        $scope.massFlexion = 0;

        $scope.client.onopen = function(){
            //console.log("Connection open");
            $rootScope.connectionState = "CONNECTED!";
            curClient = $scope.client;
        };

        $scope.client.onclose = function(){
            //console.log("Connection now closed.");
            $rootScope.connectionState = "DISCONNECTED";
            $scope.apply();
        };

        $scope.client.onmessage = function(message){
            //console.log("Received message:", message);
            var obj = JSON.parse(message.data);
            if(obj.Name){
                $scope.fingers[obj.Name].currentFlexion = obj.Flexion;
                $scope.fingers[obj.Name].requestedFlexion = obj.Flexion;
            }
            else{
                for(var k in obj){
                    var curObj = obj[k];
                    curObj.name = k;
                    curObj.requestedFlexion = curObj.currentFlexion;
                    $scope.fingers[k] = curObj;
                }
            }


            $scope.$apply();
            console.log("Resultant fingers: ", $scope.fingers);
        };

        $scope.commandType = {
            COMMAND: 0,
            FLEXION: 1,
            MULTIFLEXION: 2
        };

        $scope.getDto = function(type){
            return {
                Type: type,
                Command: {}
            };
        };

        $scope.sendCommand = function(command){
            var dto = $scope.getDto($scope.commandType.COMMAND);
            dto.Command = command;
            $scope.client.send(JSON.stringify(dto));
        };

        $scope.sendFlexion = function(name, flexion){
            var dto = $scope.getDto($scope.commandType.FLEXION);
            dto.Command = {
                Finger: name,
                FlexAmount: flexion
            };
            $scope.client.send(JSON.stringify(dto));
        };

        $scope.applyFlexion = function(fingerName){
            if($scope.fingers[fingerName]){
                var finger = $scope.fingers[fingerName];
                $scope.sendFlexion(finger.name, finger.requestedFlexion);
            }
        };

        $scope.massApplyFlexion = function(){
            for (var i = 0; i < $scope.massSelectedFingers.length; i++){
                var finger = $scope.massSelectedFingers[i];
                finger.requestedFlexion = $scope.massFlexion;
            }

            $scope.massSendFlexion();
        };

        $scope.massSendFlexion = function(){
            var dto = $scope.getDto($scope.commandType.MULTIFLEXION);
            dto.Command = [];
            for (var i = 0; i < $scope.massSelectedFingers.length; i++){
                var finger = $scope.massSelectedFingers[i];
                dto.Command.push({
                    Finger: finger.name,
                    FlexAmount: finger.requestedFlexion
                });
            }

            console.log(dto);
            $scope.client.send(JSON.stringify(dto));
        };

        $scope.getFingerRef = function(fingerName){
            for(var i in $scope.fingers){
                if(i == fingerName){
                    return $scope.fingers[i];
                }
            }
        };

        $scope.toggleMassFlexion = function(finger){
            var index = $scope.massSelectedFingers.indexOf(finger);
            if(index == -1) $scope.massSelectedFingers.push($scope.getFingerRef(finger.name));
            else {
                $scope.massSelectedFingers.splice(index, 1);
            }
        };

        $scope.enableMassFlexion = function(finger){
            var index = $scope.massSelectedFingers.indexOf(finger);
            if(index == -1) $scope.massSelectedFingers.push($scope.getFingerRef(finger.name));
        };

        $scope.disableMassFlexion = function(finger){
            var index = $scope.massSelectedFingers.indexOf($scope.getFingerRef(finger.name));
            if(index != -1) $scope.massSelectedFingers.splice(index, 1);
        };


        $scope.handleHands = function(hands){
            var right = hands.Right;
            var left = hands.Left;

            if(right){
                console.log("$scope.massSelectedFingers:", $scope.massSelectedFingers);
                var adjustFingers = function(lFinger, bFinger){
                    var bb = $scope.fingers[bFinger];
                    var lm = $scope.leapMotion.Hands.Right[lFinger];


                    console.log("BEFORE: Beaglebone:", bb, "LeapMotion", lm);
                    if(lm.Flexion == 0) bb.requestedFlexion = 1;
                    else bb.requestedFlexion = lm.Flexion;
                    console.log("AFTER: Beaglebone:", bb, "LeapMotion", lm);

                    //$scope.sendFlexion(bb.name, lm.Flexion);
                };

                adjustFingers("Pointer", "TestFinger2");
                adjustFingers("Middle", "TestFinger3");
                adjustFingers("Ring", "TestFinger4");
                adjustFingers("Pinky", "TestFinger5");
                adjustFingers("Thumb", "TestFinger");

                console.log($scope.massSelectedFingers);

                $scope.massSendFlexion();
                //$scope.massApplyFlexion();
            }
        };

        $scope.leapmotionUpdate = function(){
            if($scope.shouldUpdateFromLeapMotion){
                console.log($scope.leapMotion.Hands);
                $scope.handleHands($scope.leapMotion.Hands);
                $timeout(function(){
                    if($scope.shouldUpdateFromLeapMotion){
                        $scope.leapmotionUpdate();
                    }
                }, $scope.timeBetweenLoops);
            }
        };

        $scope.toggleLeapmotionUpdates = function(){
            $scope.shouldUpdateFromLeapMotion = !$scope.shouldUpdateFromLeapMotion;
            $scope.leapmotionUpdate();
        };

    }
]);

webApp.service('wsSvc', [
    function(){
        return {
            start: function(){
                var baseUrl = "192.168.100.101:8079";
                return new WebSocket("ws://" + baseUrl);
            }
        }
    }
]);