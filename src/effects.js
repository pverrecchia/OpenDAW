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

function createTrackReverb() {
    var reverbNetwork = [6];
    
    var reverbIn = ac.createGainNode();
    var dryGain = ac.createGainNode();
    var wetGain = ac.createGainNode();
    var reverbOut = ac.createGainNode();
    var conv1 = ac.createConvolver();
    var rev1Gain = ac.createGainNode();
    
    wetGain.connect(reverbOut);
    dryGain.connect(reverbOut);
    rev1Gain.connect(wetGain);
    
    conv1.connect(rev1Gain);
    loadReverbIR('src/data/ir/BelleMeade.wav', conv1);
   
    
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

 function loadReverbIR(url, convNode) {
    // As with the main sound source, 
    // the Impulse Response loads asynchronously
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    request.onload = function () {
	convNode.buffer = ac.createBuffer(request.response, false); 
    }
    request.send();
    
}

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

