var ac = new (window.AudioContext || window.webkitAudioContext);

//var masterGainNode = ac.createGainNode();
//masterGainNode.connect(ac.destination);


var buffers = []; //contains AudioBuffer and id# of samples in workspace
var times = []; //contains start times of samples and their id#
var pixelsPer16 = 6; 			//pixels per 16th note. used for grid snapping
var pixelsPer4 = 4*pixelsPer16;		//pixels per 1/4 note	used for sample canvas size
	
	
var wavesurfer = (function () {
    'use strict';

    var createWavesurfer = function (song) {
        var bpm = 128;

        var startTimes = song.startTime;
        var sampleNumber = 0;
        var sampleUrl = song.url.split("/");
        var sampleTitle = sampleUrl[sampleUrl.length-1];
	var obj;
        $("#library").append("<li id=librarySample" + song.id +" class=\"librarySample\"><a href=\"#\">" + sampleTitle + "</a></li>");
        $("#librarySample" + song.id).draggable({ revert: true, helper: "clone" });
        $.each(startTimes, function(){
	    if(sampleNumber == 0){
		obj = ({bufferURL: song.url, id: song.id, startTimes: song.startTime});
	    }
	    var currentStartTime = song.startTime[sampleNumber] + sampleNumber;
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
                    $( "#sample" + song.id + "Span" + sampleNumber).attr('data-startTime',parseInt($( "#sample" + song.id + "Span" + sampleNumber).css('left')));
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
            wavesurfer.load(song.url);
            sampleNumber++;
        });

        return obj;
    };


    var processData = function (json) {
	var numberOfTracks = parseInt(json.projectInfo.tracks);
	for(var i=0;i<numberOfTracks;i++){
	    $("#trackBed").append("<div class=\"span9\"><div class=\"row-fluid\"><div class=\"span2 well\" style=\"height: 84px;\"><p>Track"+(i+1)+"</p><div class=\"btn-group\"><button class=\"btn btn-mini\"><i class=\"icon-headphones\"></i></button><button class=\"btn btn-mini\"><i class=\"icon-volume-off\"></i></button><button class=\"btn btn-mini\"><i class=\"icon-plus-sign\"></i></button></div></div><div id=\"track"+(i+1)+"\" class=\"span10 track\"></div></div></div>");
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
		    times[currentStartTime] = currentSample.id;
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
    play2();
});
$('body').bind('pause-event', function(e){
    stop2();
});
$('body').bind('stepBackward-event', function(e){
    //scheduler.playAt(0);
});

$(document).ready(function(){
    $("#playPause").click(function(){
        $('body').trigger('playPause-event');
    });
    $("#pause").click(function(){
        $('body').trigger('pause-event');
    });
    $("#step-backward").click(function(){
        $('body').trigger('stepBackward-event');
    });
    $( "#track1" ).droppable({
        accept: ".librarySample"
    });
    var c=document.getElementById("timeline");
    var ctx=c.getContext("2d");
    ctx.font = '8pt Calibri';
    ctx.textAlign = 'center';
    for(var i=0;i<500;i+=pixelsPer4){	//timeline draws bars at 1/4 notes
        ctx.moveTo(i,0);
        ctx.lineTo(i,10); 	
        ctx.stroke();
    }
    ctx.fillText("Bar",10,20);
    var bar = 2;
    for(var i=40;i<500;i+=40){
        ctx.fillText(bar, i, 20);
        bar++;
    }
	
});