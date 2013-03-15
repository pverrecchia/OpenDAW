var wavesurfer = (function () {
    'use strict';

    var createWavesurfer = function (song) {
        var canvas = document.createElement('canvas');
        $("#track"+song.track).append(canvas);
        //canvas.width = 1024;
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
            console.log(this.backend.currentBuffer.duration);
        });
        $("#playPause").click(function(){
            wavesurfers[0].playPause();
            wavesurfers[1].playPause();
        });
        $("#pause").click(function(){
            wavesurfers[0].pause();
            wavesurfers[1].pause();
        });
        $("#step-forward").click(function(){
            wavesurfers[0].pause();
            wavesurfers[1].pause();
        });
        $("#step-backward").click(function(){
            wavesurfers[0].playAt(0);
            wavesurfers[1].playAt(0);
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