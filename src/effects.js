var reverbIrBuffers = [];

function logslider(position) {
  // position will be between 0 and 100
  var minp = 0;
  var maxp = 100;

  // The result should be between 40hz an 20000hz
  var minv = Math.log(40);
  var maxv = Math.log(20000);

  // calculate adjustment factor
  var scale = (maxv-minv) / (maxp-minp);

  return Math.exp(minv + scale*(position-minp));
}

function muteTrack(trackNumber) {
    var node = trackMasterGains[trackNumber];
    if(!node.isMuted){
        node.node.gain.value = 0;
        node.isMuted = true;
    }
    else if (node.isMuted){
        node.node.gain.value = 1;
        node.isMuted = false;
    }
}

function solo(trackNumber) {
    var thisNode = trackMasterGains[trackNumber];
    if (!thisNode.isSolo) {
        thisNode.isSolo = true;

        for (var i=1; i <= globalNumberOfTracks; i++) {
            var node = trackMasterGains[i];

                if(i != trackNumber){
                    if(!node.isMuted){
                        node.node.gain.value = 0;
                        node.isMuted = true;
                    }
                }
        }
    }else if (thisNode.isSolo) {
        thisNode.isSolo = false;

        for (var i=1; i <= globalNumberOfTracks; i++) {
            var node = trackMasterGains[i];

                if(i != trackNumber){
                    if(node.isMuted){
                        node.node.gain.value = 1;
                        node.isMuted = false;
                    }
                }
        }
    }

}

function setMasterVolume(newValue) {
    var node = masterGainNode;
    node.gain.value = (newValue/100)* (newValue/100);
}

function setTrackVolume(trackNumber,newValue) {
    var node = trackVolumeGains[trackNumber];
    node.gain.value = (newValue/100)* (newValue/100);
}

function setCompressorThresholdValue(trackNumber,threshold){
    var node = trackCompressors[trackNumber];
    node.threshold.value = threshold;
}

function setCompressorRatioValue(trackNumber,ratio){
    var node = trackCompressors[trackNumber];
    node.ratio.value = ratio;
}

function setCompressorAttackValue(trackNumber,attack){
    var node = trackCompressors[trackNumber];
    node.attack.value = attack/1000;
}

function setFilterCutoffValue(trackNumber,freq){
    var node = trackFilters[trackNumber];
    node.frequency.value = logslider(freq);
}

function setFilterQValue(trackNumber,Q){
    var node = trackFilters[trackNumber];
    node.Q.value = Q;
}

function setReverbWetDryValue(trackNumber, v){
    var wet = v/100;
    var dry = 1-wet;
    //set wetGain node gain
    trackReverbs[trackNumber][4].gain.value = wet;

    //set dryGain node gain
    trackReverbs[trackNumber][5].gain.value = dry;
}

function setReverbIr(trackNumber, v){
    //if reverb buffer has already been loaded from wav file, use the exisiting arrayBuffer
   if (reverbIrBuffers[v] != null) {
    trackReverbs[trackNumber][2].buffer = reverbIrBuffers[v]

    //if not, create an arrayBuffer object from the wav file
   }else{
    loadReverbIR(v, trackReverbs[trackNumber][2]);
   }
}

function setDelayWetDryValue(trackNumber, v) {
    var wet = v/100;
    var dry = 1-wet;

    //set wet gain node
    trackDelays[trackNumber][3].gain.value = wet;

    //set dry gain node
    trackDelays[trackNumber][2].gain.value = dry;
}

function setDelayTimeValue(trackNumber, v) {
    var time = v*secondsPer16;

    //access delay node
    trackDelays[trackNumber][4].delayTime.value =time;
}

function setDelayFeedbackValue(trackNumber, v) {
    v = v/100;
    if (v >= 1.0) {
        v = 0.99
    }

    trackDelays[trackNumber][5].gain.value = v;
}

function createTrackReverb() {
    var reverbNetwork = [6];

    var reverbIn = ac.createGain();
    var dryGain = ac.createGain();
    var wetGain = ac.createGain();
    var reverbOut = ac.createGain();
    var conv1 = ac.createConvolver();
    var rev1Gain = ac.createGain();

    wetGain.connect(reverbOut);
    dryGain.connect(reverbOut);
    rev1Gain.connect(wetGain);

    conv1.connect(rev1Gain);
    loadReverbIR(0, conv1);


    reverbIn.connect(dryGain);
    reverbIn.connect(conv1);

    wetGain.gain.value = 0.5;
    dryGain.gain.value = 0.5;

    reverbNetwork[0]=reverbIn;
    reverbNetwork[1]=reverbOut;
    reverbNetwork[2]=conv1;
    reverbNetwork[3]=rev1Gain;
    reverbNetwork[4]=wetGain;
    reverbNetwork[5]=dryGain;

    return reverbNetwork;
}

 function loadReverbIR(reverb, convNode) {
    var url;
    switch (reverb) {
        case 0:
            url = 'src/data/ir/BelleMeade.wav';
        break;

        case 1:
            url = 'src/data/ir/ir_rev_short.wav'
        break;
    }

    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    request.onload = function () {
	convNode.buffer = ac.createBuffer(request.response, false);
        reverbIrBuffers[reverb] = convNode.buffer;
    }
    request.send();

}

/*function setReverbIR(trackNumber, reverb){
    var reverbList=document.getElementById("reverbList");
    var ir = value=reverbList.options[reverbList.selectedIndex].text;

    loadReverbIR(ir, trackReverbs[trackNumber][2].buffer);
}*/

function setFilterType(trackNumber,type){
    var node = trackFilters[trackNumber];
    if(type == 0){
        node.type = 0;
    } else if(type == 1){
        node.type = 1;
    } else if(type == 2){
        node.type = 2;
    }
}

function createTrackDelay() {
    var delayNetwork = [6];

    var delayIn = ac.createGain();
    var delayOut = ac.createGain();
    var dryGain = ac.createGain();
    var wetGain = ac.createGain();
    var fbGain = ac.createGain();
    var delayNode = ac.createDelayNode();

    wetGain.connect(delayOut);
    dryGain.connect(delayOut);
    delayIn.connect(dryGain);
    delayIn.connect(delayNode);
    delayNode.connect(fbGain);
    delayNode.connect(wetGain);
    fbGain.connect(delayNode);

    dryGain.gain.value = 0.5;
    wetGain.gain.value = 0.5;
    fbGain.gain.value = 0.2;

    delayNetwork[0] = delayIn;
    delayNetwork[1] = delayOut;
    delayNetwork[2] = dryGain;
    delayNetwork[3] = wetGain;
    delayNetwork[4] = delayNode;
    delayNetwork[5] = fbGain;

    return delayNetwork;

}

function createTrackTremolo() {
    var tremoloNetwork = [5];

    var tremoloIn = ac.createGain();
    var tremoloOut = ac.createGain();
    var lfoGain = ac.createGain();
    var lfo = ac.createOscillator();
    var depth = ac.createGain();

    lfo.type = lfo.SINE;
    lfo.frequency = 0.1;

    lfoGain.gain.value = 1;

    depth.connect(tremoloOut);
    tremoloIn.connect(depth);
    lfoGain.connect(depth.gain);
    lfo.connect(lfoGain);

    lfo.start(0);

    tremoloNetwork[0] = tremoloIn;
    tremoloNetwork[1] = tremoloOut;
    tremoloNetwork[2] = lfoGain;
    tremoloNetwork[3] = lfo;
    tremoloNetwork[4] = depth;

    return tremoloNetwork;
}

function setTremoloRateValue(trackNumber, v) {

    //access rate node
     //trackTremolos[trackNumber][3].stop();
    trackTremolos[trackNumber][3].frequency=v;
     //trackTremolos[trackNumber][3].start();
}

function setTremoloDepthValue(trackNumber, v) {
    v=v/200;
    //access lfo gain node
    trackTremolos[trackNumber][2].gain.value=v;
}

