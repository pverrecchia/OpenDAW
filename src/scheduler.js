'use strict';
var source = null;
var isPlaying = false;		// Are we currently playing?
var startTime;			// The start time of the entire sequence.
var current16thNote;		// What note is currently last scheduled?
var tempo = 128.0;		// tempo (in beats per minute)
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
    var secondsPerBeat = 60.0 / tempo;	// Notice this picks up the CURRENT 
    // tempo value to calculate beat length.
    nextNoteTime += 0.25 * secondsPerBeat;
    nextCursorTime += secondsPerBeat;
    // Add beat length to last beat time
    current16thNote++;	// Advance the beat number, wrap to zero
    
}

function scheduleNote( beatNumber, noteTime) {
    // push the note on the queue, even if we're not playing.
    notesInQueue.push( { note: beatNumber, time: noteTime } );
    var samples;
   
    if(times[beatNumber] != null){
	samples = times[beatNumber];
	    
	for(var i = 0; i<samples.length; i++){
	    
	    source = ac.createBufferSource();
	    source.connect(masterGainNode);
	    
	    source.buffer = buffers[samples[i]].buffer;
	    
	    activeSources.push(source);
	    source.start(noteTime);
	    source.stop(noteTime + buffers[samples[i]].buffer.duration);  
	}
    }
}

function scheduler() {
	// while there are notes that will need to play before the next interval, 
	// schedule them and advance the pointer.
	while (nextNoteTime < ac.currentTime + scheduleAheadTime ) {
		scheduleNote( current16thNote, nextNoteTime );
		nextNote();
		
		//get rid of finshed sources in activeSources array
		activeSources.forEach(function(element, index){
		    if (element.playbackState == 3) {
			activeSources.splice(index, 1);
		    }
		});
		
	}
	timerID = window.setTimeout( scheduler, lookahead );
	
	
}

function play2() {
//if(isPlaying) return;
//return if already playing
    isPlaying = !isPlaying;

    if (isPlaying) { // start playing
	k=0;
	nextK=k;
	cnt = 2;
	current16thNote = 0;
	nextNoteTime = ac.currentTime;
	scheduler();	// kick off scheduling
    } else {
	activeSources.forEach(function(element){
	    element.stop(0);
	});
	window.clearTimeout( timerID );
    }
}


function draw() {
    var currentNote = last16thNoteDrawn;
    var currentTime = ac.currentTime;
 
     while (notesInQueue.length && notesInQueue[0].time < currentTime) {
        currentNote = notesInQueue[0].note;
        notesInQueue.splice(0,1);   // remove note from queue
	
	//4,4,4,3 counter
	if (k == nextK) {
	    
	    if (cnt==4) {
		nextK+=3;
		cnt=0;
	    }else{
		nextK+=4;
	    }
	    
	    canvasContext.clearRect(0,0,canvas.width, canvas.height);
	    drawTimeline();
	    canvasContext.fillStyle = "FF9900";
	    
	    if (cnt == 1) {
		canvasContext.fillRect( (k +1 + Math.floor(k/15))*pixelsPer16 , 0, pixelsPer4, 10 );	    
	    }else{
		canvasContext.fillRect( (k + Math.floor(k/15))*pixelsPer16, 0, pixelsPer4, 10 );
	    }
	 
	   cnt++; 
	}
	k++
    }
    // set up to draw again
    requestAnimFrame(draw);
}

function drawTimeline(){
    
    canvasContext.fillStyle = "black";
    canvasContext.lineWidth = 1;
    for(var i=0;i<500;i+=pixelsPer4){	
        canvasContext.moveTo(i,0);
        canvasContext.lineTo(i,10); 	
        canvasContext.stroke();
    }
    /*canvasContext.fillText("Bar",10,20);
    var bar = 2;
    for(var i=40;i<500;i+=40){
        canvasContext.fillText(bar, i, 20);
        bar++;
    }*/
    
}

function initSched(params){
    
    canvas = document.getElementById( "timeline" );
    canvasContext = canvas.getContext( '2d' );
    requestAnimFrame(draw);	// start the drawing loop.
}

window.addEventListener("load", initSched);