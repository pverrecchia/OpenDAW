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
    node.gain.value = newValue/100;
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