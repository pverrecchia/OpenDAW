var ac = new (window.AudioContext || window.webkitAudioContext);

var masterGainNode = ac.createGainNode();
masterGainNode.connect(ac.destination);


var buffers = []; //contains AudioBuffer and id# of samples in workspace
var times = []; //contains start times of samples and their id#
var pixelsPer16 = 6; 			//pixels per 16th note. used for grid snapping
var pixelsPer4 = 4*pixelsPer16;		//pixels per 1/4 note	used for sample canvas size
var bpm = 128;
	
	
var wavesurfer = (function () {
    'use strict';

    var createWavesurfer = function (song) {
        var startTimes = song.startTime;
        var sampleNumber = 0;
        var sampleUrl = song.url.split("/");
        var sampleTitle = sampleUrl[sampleUrl.length-1];
	var obj;
        $("#library").append("<li id=librarySample" + song.id +" class=\"librarySample\" data-id="+song.id+" data-url="+song.url+" data-duration="+song.duration+"><a href=\"#\">" + sampleTitle + "</a></li>");
        $("#librarySample" + song.id).draggable({
	    revert: true,
	    helper: "clone",
	    start: function(event, ui) { $(this).css("z-index", 10); }
	});
        $.each(startTimes, function(){
	    if(sampleNumber == 0){
		obj = ({bufferURL: song.url, id: song.id, startTimes: song.startTime});
	    }
	    var currentStartTime = song.startTime[sampleNumber] + (song.startTime[sampleNumber]/15);
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
	    $( "#track"+(i+1) ).droppable({
		accept: ".librarySample",
		drop: function( event, ui ) {
		    var startBar = Math.floor((ui.offset.left-$(this).offset().left)/6);
		    var sampleStartTime = startBar - Math.floor(startBar/15);
		    console.log(startBar);
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
			    $( "#sample" + sampleID + "Span").attr('data-startTime',parseInt($( "#sample" + sampleID + "Span").css('left')));
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
			times[currentStartTime] = [currentSample.id];
		    } else {
			times[currentStartTime].push(currentSample.id);
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
    var c=document.getElementById("timeline");
    var ctx=c.getContext("2d");
    ctx.font = '8pt Calibri';
    ctx.textAlign = 'center';
    //timeline draws bars at 1/4 notes
    for(var i=0;i<500;i+=pixelsPer4){	
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