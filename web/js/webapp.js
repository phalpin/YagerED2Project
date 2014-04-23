var webApp = angular.module('yager', []);
var curClient;

webApp.controller('fingerCtrl', [
    '$scope', 'wsSvc', '$rootScope',
    function($scope, wsSvc, $rootScope){
        $scope.client = wsSvc.start();

        $scope.fingers = {};

        $scope.client.onopen = function(){
            console.log("Connection open");
            $rootScope.connectionState = "CONNECTED!";
            curClient = $scope.client;
        };

        $scope.client.onclose = function(){
            console.log("Connection now closed.");
            $rootScope.connectionState = "DISCONNECTED";
            $scope.apply();
        };

        $scope.client.onmessage = function(message){
            console.log("Received message:", message);
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
            FLEXION: 1
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
        }

    }
]);

webApp.service('wsSvc', [
    function(){
        return {
            start: function(){
                var baseUrl = "192.168.100.150:8079";
                return new WebSocket("ws://" + baseUrl);
            }
        }
    }
]);

/*
var btnRotateUp = $('#rotate-up');
var btnRotateDown = $('#rotate-down');
var frmRotateManual = $('#rotate-manual');
var txtRotateAmt = $('#rotate-requested-input');
var lblRotateCur = $('#servo-rotation');
var lblServoName = $('#servo-name');

frmRotateManual.submit(function(event){
    var rotAmt = txtRotateAmt.val();
    testClient.Client.send(rotAmt);
    event.preventDefault();
});





btnRotateUp.click(function(){
    testClient.Client.send('increment');
});

btnRotateDown.click(function(){
    testClient.Client.send('decrement');
});
*/