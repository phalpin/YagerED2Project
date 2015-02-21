var webApp = angular.module('yager', []);
var curClient;

webApp.controller('fingerCtrl', [
    '$scope', 'wsSvc', '$rootScope',
    function($scope, wsSvc, $rootScope){
        $scope.client = wsSvc.start();

        $scope.fingers = {};

        $scope.massSelectedFingers = [];
        $scope.massFlexion = 0;

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
            var dto = $scope.getDto($scope.commandType.MULTIFLEXION);
            dto.Command = [];
            for (var i = 0; i < $scope.massSelectedFingers.length; i++){
                var finger = $scope.massSelectedFingers[i];
                dto.Command.push({
                    Finger: finger.name,
                    FlexAmount: $scope.massFlexion
                });
            }

            console.log(dto);
            $scope.client.send(JSON.stringify(dto));
        };

        $scope.toggleMassFlexion = function(finger){
            var index = $scope.massSelectedFingers.indexOf(finger);
            if(index == -1) $scope.massSelectedFingers.push(finger);
            else {
                $scope.massSelectedFingers.splice(index, 1);
            }
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