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