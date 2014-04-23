var baseUrl = "192.168.7.2:8079";

function Client(url){
    var retVal = {};
    var wsClient = new WebSocket("ws://" + url);

    retVal.Client = wsClient;

    return retVal;
}

var testClient = new Client(baseUrl);
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

testClient.Client.onopen = function(){
    console.log("Connection open to " + baseUrl);
};

testClient.Client.onclose = function(){
    console.log("Connection from " + baseUrl + " now closed.");
};

testClient.Client.onmessage = function(message){
    console.log("Received message:", message);
    lblRotateCur.text(message.data + " degrees");
};

btnRotateUp.click(function(){
    testClient.Client.send('increment');
});

btnRotateDown.click(function(){
    testClient.Client.send('decrement');
});