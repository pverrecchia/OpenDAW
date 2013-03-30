var ac = new (window.AudioContext || window.webkitAudioContext);

var masterGainNode = ac.createGainNode();
masterGainNode.connect(ac.destination);

//array of track master gain nodes
var trackMasterGains = [];
var trackVolumeGains = [];
var trackInputNodes = [];
var trackCompressors = [];

//the currently selected track (for editing effects etc.)
var activeTrack;

var buffers = []; //contains AudioBuffer and id# of samples in workspace
var times = []; //contains start times of samples and their id#
var pixelsPer16 = 6; 			//pixels per 16th note. used for grid snapping
var pixelsPer4 = 4*pixelsPer16;		//pixels per 1/4 note	used for sample canvas size
var bpm = 128;
    
jQuery.removeFromArray = function(value, arr) {
    return jQuery.grep(arr, function(elem, index) {
        return elem !== value;
    });
};
	
var globalNumberOfTracks;

var wavesurfer = (function () {
    'use strict';

    var createWavesurfer = function (song) {
        var startTimes = song.startTime;
        var sampleNumber = 0;
        var sampleUrl = song.url.split("/");
        var sampleTitle = sampleUrl[sampleUrl.length-1];
	var obj;
        $("#libraryList").append("<li id=librarySample" + song.id +" class=\"librarySample\" data-id="+song.id+" data-url="+song.url+" data-duration="+song.duration+"><a href=\"#\">" + sampleTitle + "</a></li>");
        $("#librarySample" + song.id).draggable({
	    revert: true,
	    helper: "clone",
	    start: function(event, ui) { $(this).css("z-index", 10); }
	});
        $.each(startTimes, function(){
	    if(sampleNumber == 0){
		obj = ({bufferURL: song.url, id: song.id, startTimes: song.startTime, track: song.track});
	    }
	    var currentStartTime = song.startTime[sampleNumber];
            var span = document.createElement('span');
            span.id = "sample" + song.id + "Span" + sampleNumber;
            var canvas = document.createElement('canvas');
            canvas.id = "sample" + song.id + "Canvas" + sampleNumber;
            $("#track"+song.track).append(span);
            $("#sample" + song.id + "Span" + sampleNumber).append(canvas);
            $("#sample" + song.id + "Span" + sampleNumber).width(parseFloat(song.duration) * ((pixelsPer4*bpm)/60));
            canvas.width = parseFloat(song.duration) * ((pixelsPer4*bpm)/60);
            canvas.height = 80;
            $( "#sample" + song.id + "Span" + sampleNumber).attr('data-startTime',song.startTime[sampleNumber]);
            $( "#sample" + song.id + "Span" + sampleNumber).css('left',"" + parseInt(currentStartTime*pixelsPer16) + "px");
	    $( "#sample" + song.id + "Span" + sampleNumber).css('position','absolute');
            $( "#sample" + song.id + "Span" + sampleNumber).draggable({
                axis: "x",
                containment: "parent",
                grid: [pixelsPer16, 0],		//grid snaps to 16th notes
                stop: function() {
		    //get rid of old entry in table
		    times[currentStartTime] = jQuery.removeFromArray(song.id, times[currentStartTime]);
                    $(this).attr('data-startTime',parseInt($(this).css('left'))/pixelsPer16);
		    var newStartTime = $(this).attr('data-startTime');
		    if(times[newStartTime] == null){
			times[newStartTime] = [song.id];
		    } else {
			times[newStartTime].push(song.id);
		    }
                }
            });
	    $( "#sample" + song.id + "Span" + sampleNumber ).resizable({
		helper: "ui-resizable-helper",
		handles: "e",
		grid: pixelsPer16
	    });
            var wavesurfer = Object.create(WaveSurfer);
            wavesurfer.init({
                canvas: canvas,
                waveColor: '#08c',
                progressColor: '#08c',
                loadingColor: 'purple',
                cursorColor: 'navy',
                audioContext: ac
            });
            wavesurfer.load(song.url);
            sampleNumber++;
        });

        return obj;
    };


    var processData = function (json) {
	var numberOfTracks = parseInt(json.projectInfo.tracks);
	//create track-specific nodes
	globalNumberOfTracks = numberOfTracks;
	createNodes(numberOfTracks);
	
	for(var i=0;i<numberOfTracks;i++){
	   var currentTrackNumber = i+1;
	    $("#trackBed").append("<div class=\"span9\"><div class=\"row-fluid\" id=\"selectTrack"+currentTrackNumber+"\"><div class=\"span2 trackBox\" style=\"height: 84px;\"><p style=\"margin: 0 0 0 0;\" id=\"track"+currentTrackNumber+"title\">Track"+currentTrackNumber+"</p><div style=\"margin: 5px 0 5px 0;\" id=\"volumeSlider"+currentTrackNumber+"\"></div><button type=\"button\" class=\"btn btn-mini\" id = \"solo"+currentTrackNumber+"\"><i class=\"icon-headphones\"></i></button><button type=\"button\" class=\"btn btn-mini\" id = \"mute"+currentTrackNumber+"\"><i class=\"icon-volume-off\"></i></button><button type=\"button\" class=\"btn btn-mini\"><i class=\"icon-plus-sign\"></i></button></div><div id=\"track"+currentTrackNumber+"\" class=\"span10 track\"></div></div></div>");
	    $("#volumeSlider"+currentTrackNumber).slider({
		value: 80,
		orientation: "horizontal",
		range: "min",
		min: 0,
		max: 100,
		animate: true,
		slide: function( event, ui ) {
		    var muteTrackNumber = $(this).attr('id').split('volumeSlider')[1];
		    setTrackVolume(muteTrackNumber, ui.value );
		}
	    });
	    $("#selectTrack"+currentTrackNumber).click(function(){
		var printTrackNumber = $(this).attr('id').split('selectTrack')[1];
		activeTrack = printTrackNumber;
		$("#trackEffectsHeader").html("Track "+printTrackNumber);
		$("#trackEffects").css("display","block");
	    });
	    $("#mute"+currentTrackNumber).click(function(){
		var muteTrackNumber = $(this).attr('id').split('mute')[1];
		$('body').trigger('mute-event', muteTrackNumber);
	    });
	     $("#solo"+currentTrackNumber).click(function(){
		var soloTrackNumber = $(this).attr('id').split('solo')[1];
		$('body').trigger('solo-event', soloTrackNumber);
	    });
	    $("#track"+(i+1)+"title").storage({
		storageKey : 'track'+(i+1)
	    });
	    $( "#track"+(i+1) ).droppable({
		accept: ".librarySample",
		drop: function( event, ui ) {
		    var startBar = Math.floor((ui.offset.left-$(this).offset().left)/6);
		    var sampleStartTime = startBar;
		    var span = document.createElement('span');
		    var sampleID = ui.helper.attr("data-id");
		    var sampleDuration = ui.helper.attr("data-duration");
		    var sampleURL = ui.helper.attr("data-url");
		    span.id = "sample" + sampleID + "Span";
		    var canvas = document.createElement('canvas');
		    canvas.id = "sample" + sampleID + "Canvas";
		    $(this).append(span);
		    $("#sample" + sampleID + "Span").append(canvas);
		    $("#sample" + sampleID + "Span").width(parseFloat(sampleDuration) * ((pixelsPer4*bpm)/60));
		    canvas.width = parseFloat(sampleDuration) * ((pixelsPer4*bpm)/60);
		    canvas.height = 80;
		    $( "#sample" + sampleID + "Span").attr('data-startTime',startBar);
		    $( "#sample" + sampleID + "Span").css('left',"" + startBar*pixelsPer16 + "px");
		    $( "#sample" + sampleID + "Span").css('position','absolute');
		    $( "#sample" + sampleID + "Span").draggable({
			axis: "x",
			containment: "parent",
			grid: [pixelsPer16, 0],		//grid snaps to 16th notes
			stop: function() {
			    times[startBar] = jQuery.removeFromArray(sampleID, times[startBar]);
			    $(this).attr('data-startTime',parseInt($(this).css('left'))/pixelsPer16);
			    var newStartTime = $(this).attr('data-startTime');
			    if(times[newStartTime] == null){
				times[newStartTime] = [sampleID];
			    } else {
				times[newStartTime].push(sampleID);
			    }
			}
		    });
		    
		    var wavesurfer = Object.create(WaveSurfer);
		    wavesurfer.init({
			canvas: canvas,
			waveColor: 'violet',
			progressColor: 'purple',
			loadingColor: 'purple',
			cursorColor: 'navy',
			audioContext: ac
		    });
		    wavesurfer.load(sampleURL);
		    if(buffers[sampleID]==undefined){
			load(sampleURL, sampleID);
		    }
		    if(times[sampleStartTime] == null){
			times[sampleStartTime] = [sampleID];
		    } else {
			times[sampleStartTime].push(sampleID);
		    }
		}
	    });
	}
	//wavesurfers is array of all tracks
        var wavesurfers = json.samples.map(createWavesurfer);
	$.each(wavesurfers, function(){
	    var currentSample = this;
	    //if they are in workspace...
	    if(currentSample != undefined){
		//load the buffer
		load(currentSample.bufferURL, currentSample.id);
		//store the times
		$.each(currentSample.startTimes, function(){
		    var currentStartTime = this;
		 if(times[currentStartTime] == null){
			times[currentStartTime] = [{id: currentSample.id, track: currentSample.track}];
		    } else {
			times[currentStartTime].push({id: currentSample.id, track: currentSample.track});
		    }
		});
	    }
	});
    };
	
	
	
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == this.DONE && this.status == 200) {
            processData(JSON.parse(this.responseText));
        }
    };
    xhr.open('GET', 'src/data/samples.json');
    xhr.send();
}());

	
function load (src, id) {

    var xhr = new XMLHttpRequest();
    xhr.responseType = 'arraybuffer';
    
    xhr.addEventListener('load', function (e) {
	ac.decodeAudioData(
	    e.target.response,
	    function (buffer) {
		buffers[id] = {buffer: buffer};
	    },
	    Error
	);			
    }, false);
    xhr.open('GET', src, true);
    xhr.send();
};



initSched({
    bufferArray: buffers,
    audioContext: ac
});


$('body').bind('playPause-event', function(e){
    schedPlay(ac.currentTime);
});
$('body').bind('stop-event', function(e){
    schedStop();
});
$('body').bind('stepBackward-event', function(e){
    schedStepBack();
});
$('body').bind('mute-event', function(e, trackNumber){
    muteTrack(trackNumber);
});
$('body').bind('solo-event', function(e, trackNumber){
    solo(trackNumber);
});

$(document).ready(function(){
    $(".effectDrag").draggable({
	revert: true,
	helper: "clone"
    });
    $("#effectSortable").sortable({
	cancel: "canvas,input"
    });
    $("#trackEffects").droppable({
	accept: ".effectDrag",
	drop: function(event, ui){
	    $("#"+ui.draggable[0].textContent).removeClass('effect');
	    if(ui.draggable[0].textContent == "Compressor"){
		var trackCompressor = ac.createDynamicsCompressor();
		var inputNode = trackInputNodes[activeTrack];
		var volumeNode = trackVolumeGains[activeTrack];
		inputNode.disconnect();
		inputNode.connect(trackCompressor);
		trackCompressor.connect(volumeNode);
		trackCompressors[activeTrack] = trackCompressor;
	    }
	}
    });

    $("#compressorThresholdKnob").knob({
	change : function(v) {
	    setCompressorThresholdValue(activeTrack,v);
	}
    });
    $("#compressorRatioKnob").knob({
	change : function(v) {
	    setCompressorRatioValue(activeTrack,v);
	}
    });
    $("#compressorAttackKnob").knob({
	change : function(v) {
	    setCompressorAttackValue(activeTrack,v);
	}
    });
    $(".dial").knob();
    $('.btn-mini').button();
    $("#playPause").click(function(){
        $('body').trigger('playPause-event');
    });
    $("#stop").click(function(){
        $('body').trigger('stop-event');
    });
    $("#step-backward").click(function(){
        $('body').trigger('stepBackward-event');
    });
    $("#trackEffectsClose").click(function(){
	$("#trackEffects").css("display","none");
    });
   drawTimeline();
	
});

function createNodes(numTracks) {
    //for each track create a master gain node. specific tracks represented by array index i
    for (var i = 1; i <= numTracks; i++) {
	var trackMasterGainNode = ac.createGainNode();
	var trackInputNode = ac.createGainNode();
	var trackVolumeNode = ac.createGainNode();
	
	trackMasterGainNode.connect(masterGainNode);
	trackVolumeNode.connect(trackMasterGainNode);
	trackInputNode.connect(trackVolumeNode);
	
	trackMasterGains[i] = trackMasterGainNode;
	trackVolumeGains[i] = trackVolumeNode;
	trackInputNodes[i] = trackInputNode;
    }


}