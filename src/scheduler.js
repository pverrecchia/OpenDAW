'use strict';
var source = null;
var isPlaying = false;		// Are we currently playing?
var startTime;			// The start time of the entire sequence.
var current16thNote;		// What note is currently last scheduled?
var tempo = 120.0;		// tempo (in beats per minute)
var lookahead = 25.0;		// How frequently to call scheduling function 
				//(in milliseconds)
var scheduleAheadTime = 0.1;	// How far ahead to schedule audio (sec)
				// This is calculated from lookahead, and overlaps 
				// with next interval (in case the timer is late)
var nextNoteTime = 0.0;		// when the next note is due.
var noteResolution = 0;		// 0 == 16th, 1 == 8th, 2 == quarter note
var noteLength = 0.05;		// length of "beep" (in seconds)
var timerID = 0;		// setInterval identifier.

var canvas,       		// the canvas element
    canvasContext;  		// canvasContext is the canvas' context 2D
var last16thNoteDrawn = -1;	// the last "box" we drew on the screen
var notesInQueue = [];      	// the notes that have been put into the web audio,
				// and may or may not have played yet. {note, time}

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
    // Add beat length to last beat time
    current16thNote++;	// Advance the beat number, wrap to zero
    
}

function scheduleNote( beatNumber, time ) {
    // push the note on the queue, even if we're not playing.
    //notesInQueue.push( { note: beatNumber, time: time } );
    var samples;

    if(times[beatNumber] != null){
	samples = times[beatNumber];
	
	source = ac.createBufferSource();
	source.connect(ac.destination);
	    
	for(var i = 0; i<samples.length; i++){
	    
	    //console.log(samples[0]);
	
	    source.buffer = buffers[samples[i]].buffer;
	
	    
	    source.start(time);
	    source.stop(time + buffers[samples[i]].buffer.duration);
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

function play2() {
//if(isPlaying) return;
//return if already playing
    isPlaying = !isPlaying;

    if (isPlaying) { // start playing
	current16thNote = 0;
	nextNoteTime = ac.currentTime;
	scheduler();	// kick off scheduling
    } else {
	source.stop(0);
	window.clearTimeout( timerID );
    }
}


function draw() {
    var currentNote = last16thNoteDrawn;
    var currentTime = ac.currentTime;

	
    while (notesInQueue.length && notesInQueue[0].time < currentTime) {
        currentNote = notesInQueue[0].note;
        notesInQueue.splice(0,1);   // remove note from queue
    }

    // set up to draw again
    requestAnimFrame(draw);
}

function initSched(params){
    requestAnimFrame(draw);	// start the drawing loop.
}