var wavesurfer = (function () {
    'use strict';

    var createWavesurfer = function (song) {
        var bpm = 128;
        var span = document.createElement('span');
        span.id = "sample" + song.id + "Span";
        var canvas = document.createElement('canvas');
        canvas.id = "sample" + song.id + "Canvas";
        $("#track"+song.track).append(span);
        $("#sample" + song.id + "Span").append(canvas);
        $("#sample" + song.id + "Span").width(parseFloat(song.duration) * ((10*bpm)/60));
        canvas.width = parseFloat(song.duration) * ((10*bpm)/60);
        canvas.height = 80;
        $( "#sample" + song.id + "Span" ).attr('data-startTime',song.startTime);
        $( "#sample" + song.id + "Span" ).css('left',"" + parseInt(song.startTime) + "px");
        $( "#sample" + song.id + "Span" ).draggable({
            axis: "x",
            containment: "parent",
            grid: [10, 0],
            stop: function() {
                $( "#sample" + song.id + "Span" ).attr('data-startTime',parseInt($( "#sample" + song.id + "Span" ).css('left')));
            }
        });
        
        
        var wavesurfer = Object.create(WaveSurfer);
        wavesurfer.init({
            canvas: canvas,
            waveColor: 'violet',
            progressColor: 'purple',
            loadingColor: 'purple',
            cursorColor: 'navy'
        });
        wavesurfer.load(song.url);
        return wavesurfer;
    };

    var processData = function (json) {
        var wavesurfers = json.map(createWavesurfer);
        $.each(wavesurfers, function(){
            var currentWaveSurfer = this;
            $('body').bind('playPause-event', function(e){
                currentWaveSurfer.playPause();
            });
            $('body').bind('pause-event', function(e){
                currentWaveSurfer.pause();
            });
            $('body').bind('stepBackward-event', function(e){
                currentWaveSurfer.playAt(0);
            });
        });
    };

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == this.DONE && this.status == 200) {
            processData(JSON.parse(this.responseText));
        }
    };
    xhr.open('GET', 'examples/webaudio/data/samples.json');
    xhr.send();
}());