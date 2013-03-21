var wavesurfer = (function () {
    'use strict';

    var createWavesurfer = function (song) {
        var bpm = 128;
        var startTimes = song.startTime;
        var sampleNumber = 0;
        var sampleUrl = song.url.split("/");
        var sampleTitle = sampleUrl[sampleUrl.length-1];
        $("#library").append("<span><li id=librarySample" + song.id +" class=\"librarySample\"><a href=\"#\">" + sampleTitle + "</a></li></span>");
        $("#librarySample" + song.id).draggable({ revert: true, helper: "clone" });
        $.each(startTimes, function(){
            var span = document.createElement('span');
            span.id = "sample" + song.id + "Span" + sampleNumber;
            var canvas = document.createElement('canvas');
            canvas.id = "sample" + song.id + "Canvas" + sampleNumber;
            $("#track"+song.track).append(span);
            $("#sample" + song.id + "Span" + sampleNumber).append(canvas);
            $("#sample" + song.id + "Span" + sampleNumber).width(parseFloat(song.duration) * ((10*bpm)/60));
            canvas.width = parseFloat(song.duration) * ((10*bpm)/60);
            canvas.height = 80;
            $( "#sample" + song.id + "Span" + sampleNumber).attr('data-startTime',song.startTime[sampleNumber]);
            $( "#sample" + song.id + "Span" + sampleNumber).css('left',"" + parseInt(song.startTime[sampleNumber]) + "px");
            $( "#sample" + song.id + "Span" + sampleNumber).draggable({
                axis: "x",
                containment: "parent",
                grid: [10, 0],
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
                cursorColor: 'navy'
            });
            wavesurfer.load(song.url);
            sampleNumber++;
        });

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