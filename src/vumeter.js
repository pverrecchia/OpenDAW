var sourceNode;
var splitter;
var analyser, analyser2;
var javascriptNode;

// get the context from the canvas to draw on
var ctx = $("#VUmeterCanvas").get()[0].getContext("2d");

// create a gradient for the fill. Note the strange
// offset, since the gradient is calculated based on
// the canvas, not the specific element we draw
var gradient = ctx.createLinearGradient(0,0,0,80);
gradient.addColorStop(1,'#000000');
gradient.addColorStop(0.75,'#ff0000');
gradient.addColorStop(0.25,'#ffff00');
gradient.addColorStop(0,'#ffffff');


setupAudioNodes();

function setupAudioNodes() {

    // setup a javascript node
    javascriptNode = ac.createScriptProcessor(2048, 1, 1);
    // connect to destination, else it isn't called
    javascriptNode.connect(ac.destination);

    // setup a analyzer
    analyser = ac.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 1024;

    analyser2 = ac.createAnalyser();
    analyser2.smoothingTimeConstant = 0.0;
    analyser2.fftSize = 1024;

    // create a buffer source node
    //sourceNode = ac.createBufferSource();
    splitter = ac.createChannelSplitter();

    // connect the source to the analyser and the splitter
    masterGainNode.connect(splitter);

    // connect one of the outputs from the splitter to
    // the analyser
    splitter.connect(analyser,0,0);
    splitter.connect(analyser2,1,0);

    // connect the splitter to the javascriptnode
    // we use the javascript node to draw at a
    // specific interval.
    analyser.connect(javascriptNode);

}

// when the javascript node is called
// we use information from the analyzer node
// to draw the volume
javascriptNode.onaudioprocess = function() {

    // get the average for the first channel
    var array =  new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);
    var average = getAverageVolume(array);

    // get the average for the second channel
    var array2 =  new Uint8Array(analyser2.frequencyBinCount);
    analyser2.getByteFrequencyData(array2);
    var average2 = getAverageVolume(array2);

    // clear the current state
    ctx.clearRect(0, 0, 30, 80);

    // set the fill style
    ctx.fillStyle=gradient;

    // create the meters
    ctx.fillRect(0,80-average,10,80);
    ctx.fillRect(15,80-average2,10,80);
}

function getAverageVolume(array) {
    var values = 0;
    var average;

    var length = array.length;

    // get all the frequency amplitudes
    for (var i = 0; i < length; i++) {
        values += array[i];
    }

    average = values / length;
    return average;
}
