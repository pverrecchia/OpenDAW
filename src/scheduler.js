'use strict';
var source = null;
var isPlaying = false;		// Are we currently playing?
var isPaused = false;
var isStopped = true;
var startTime;			// The start time of the entire sequence.
var current16thNote =0;		// What note is currently last scheduled?
var tempo = 128.0;		// tempo (in beats per minute)
var secondsPerBeat = 60.0/tempo;
var lookahead = 25.0;		// How frequently to call scheduling function 
				//(in milliseconds)
var scheduleAheadTime = 0.1;	// How far ahead to schedule audio (sec)
				// This is calculated from lookahead, and overlaps 
				// with next interval (in case the timer is late)
var nextNoteTime = 0.0;		// when the next note is due.
var nextCursorTime = 0.0;
var noteResolution = 0;		// 0 == 16th, 1 == 8th, 2 == quarter note
var noteLength = 0.05;		// length of "beep" (in seconds)
var timerID = 0;		// setInterval identifier.

var canvas,       		// the canvas element
    canvasContext;  		// canvasContext is the canvas' context 2D
var last16thNoteDrawn = 0;	// the last "box" we drew on the screen
var notesInQueue = [];      	// the notes that have been put into the web audio,
				// and may or may not have played yet. {note, time}
	
//array of source objects that are active at a given time			
var activeSources =[];

var pauseTime;
var pauseBeat;

//variables for cursor
var k =0;
var cnt =2;
var nextK = k;

// First, let's shim the requestAnimationFrame API, with a setTimeout fallback
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function( callback ){
        window.setTimeout(callback, 1000 / 60);
    };
})();



function nextNote() {
    // Advance current note and time by a 16th note...
   
    nextNoteTime += 0.25 * secondsPerBeat;
    // Add beat length to last beat time
    current16thNote++;	// Advance the beat number, wrap to zero
    
}

function scheduleNote( beatNumber, noteTime) {
    // push the note on the queue, even if we're not playing.
    notesInQueue.push( { note: beatNumber, time: noteTime } );
    var samples;
    
    if (isPlaying) {
		    activeSources.forEach(function(element, index){
			if (element.sourceNode.playbackState == 3) {
			    activeSources.splice(index, 1);
			}
		    });	
		}
   
    if(times[beatNumber] != null){
	samples = times[beatNumber];
	console.log(samples);
	//console.log(times[beatNumber].track);
	for(var i = 0; i<samples.length; i++){
	    
	    source = ac.createBufferSource();
	    source.connect(masterGainNode);
	    
	    source.buffer = buffers[samples[i].id].buffer;
	    
	    //push source node and the scheduled start time of the sample
	    activeSources.push({sourceNode: source, sourceStartBar: beatNumber});
	    source.start(noteTime);
	    //source.stop(noteTime + buffers[samples[i]].buffer.duration);  
	}
    }
}

function scheduler() {
	// while there are notes that will need to play before the next interval, 
	// schedule them and advance the pointer.
	while (nextNoteTime < ac.currentTime + scheduleAheadTime ) {
		scheduleNote( current16thNote, nextNoteTime );
		nextNote();

	}
	timerID = window.setTimeout( scheduler, lookahead );
	
	
}

function schedPlay(time) {
    //time input is ac.currentTime passed from main.js
    
    //if not playing, then play
    if (!isPlaying) {
	console.log("playing");
	//if resuming from a pause
	if (isPaused) {
	    console.log("pause resume");
	    //play all active sources at percents
	    console.log(activeSources);
	    activeSources.forEach(function(element, index){
		var percent = (current16thNote-element.sourceStartBar) / (element.sourceNode.buffer.duration/(secondsPerBeat*0.25));
		element.sourceNode.start(element.sourceNode.buffer.duration * percent);
		
	    });
	    
	    current16thNote = pauseBeat;
	}
	
	 isPlaying = !isPlaying;
	 isPaused = !isPlaying;
	 
	if(isPlaying){ 
	nextNoteTime = ac.currentTime;
	scheduler();
	}
    //if playing, then pause
    } else {
	window.clearTimeout( timerID );
	activeSources.forEach(function(element){
	    element.sourceNode.stop(0);
	});
	
	console.log("paused");
	isPlaying = !isPlaying;
	isPaused = !isPlaying;
	
	pauseTime = time;
	pauseBeat = k;
	
	//console.log(activeSources);
	console.log(current16thNote);
    }
}

function schedStop(){
   window.clearTimeout( timerID );
   activeSources.forEach(function(element){
	    element.sourceNode.stop(0);
	});
   
    k=0;
    nextK=k;
    current16thNote = 0;
    
    //clear cursor
    drawTimeline();
    
    if (isPlaying) {
	 isPlaying = false;
    }
    
    if (isPaused) {
	isPaused = false;
    }
    
    isStopped = true;
}

function schedStepBack() {
    drawCursor(0);
    if (isPlaying) {
	 schedStop();
    }else{
	k=0;
	nextK=k;
	current16thNote = 0;
	drawTimeline();
	
    }
    
    
}
function draw() {
    var currentNote = last16thNoteDrawn;
    var currentTime = ac.currentTime;
 
     while (notesInQueue.length && notesInQueue[0].time < currentTime) {
        currentNote = notesInQueue[0].note;
        notesInQueue.splice(0,1);   // remove note from queue
	 if (isPlaying) {
	    if (k == nextK) {
		nextK+=4;
    
		drawTimeline();
		drawCursor(k);
	    }
	    k++
	 }
    }
    
    // set up to draw again
    requestAnimFrame(draw);
}

function drawTimeline(){
    canvasContext.clearRect(0,0,canvas.width, canvas.height);
    canvasContext.fillStyle = "black";
    canvasContext.lineWidth = 1;
    for(var i=0;i<500;i+=pixelsPer4){	
        canvasContext.moveTo(i,0);
        canvasContext.lineTo(i,10); 	
        canvasContext.stroke();
    }
    canvasContext.fillText("Bar",10,20);
    
    var bar = 2;
    for(var i=35;i<500;i+=(2*pixelsPer4)){
        canvasContext.fillText(bar, i, 20);
        bar+=2;
    }
}

function drawCursor(bar) {
    canvasContext.fillStyle = "FF9900";
	    
    canvasContext.fillRect(bar*pixelsPer16, 0, pixelsPer4, 10 );
}

function cursorJump(bar) {
    if (isStopped) {
	isStopped = false;
	isPaused = true;
    }
    drawTimeline();
    drawCursor(bar*4);
    
   if (isPlaying) {
    activeSources.forEach(function(element){
	     element.sourceNode.stop(0);
	 });	
   }
    
    k=bar*4;
    nextK=k;
    current16thNote = k;
}

function loadActiveSources() {
    
}

function initSched(params){
    canvas = document.getElementById( "timeline" );
    canvas.addEventListener("click" , function(e){
						    var relX = e.offsetX;
						    var bar =Math.floor(relX/pixelsPer4);
						    //console.log(bar);
						    cursorJump(bar);
						}, false);
			    
    canvasContext = canvas.getContext( '2d' );
    canvasContext.font = '8pt Calibri';
    canvasContext.textAlign = 'center';
    requestAnimFrame(draw);	// start the drawing loop.
}

window.addEventListener("load", initSched);