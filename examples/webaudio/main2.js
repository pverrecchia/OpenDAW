var wavesurfer = (function () {
    'use strict';

    var createWavesurfer = function (song) {
        var canvas = document.createElement('canvas');
        $("#track"+song.track).append(canvas);
        canvas.width = parseFloat(song.duration);
        canvas.height = 80;

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