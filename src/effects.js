function muteTrack(trackNumber) {
    var node = trackMasterGains[trackNumber];
    if(node.gain.value){
        node.gain.value = 0;   
    }else{
        node.gain.value = 1;
    }
}

function solo(trackNumber) {
    for (var i=1; i <= globalNumberOfTracks; i++) {
        var node = trackMasterGains[i];
        if(i != trackNumber){  
            if(node.gain.value){
                node.gain.value = 0;   
            }else{
                node.gain.value = 1;
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