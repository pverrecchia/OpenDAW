OpenDAW
=======

<p>
OpenDAW is an open source online digital audio workstation (DAW) based on the 
<a href = https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html target = "blank">Web Audio API </a>.

<br>
<br>

So far, various audio clips can be placed on multiple tracks at arbitrary start times according to a 
(currently preprogrammed) .json file. The accuracy of the scheduler is high enough to seamlessly playback looping samples
at the correct times. Samples can be placed at sixteenth note resolution. 

<br>
<br>

As much as possible from the following list of features will be implemented by the project deadline:

<ul>
  <li>Dynamically writable .json file for adding and rearranging samples in the workspace</li>
  <li>Dynamically adding and removing tracks</li>
  <li>Dynamically changing sample length</li>
  <li>Project save/export functionality</li>
  <li>Click and drag samples from directory to workspace</li>
  <li>Track-specific controls such as mute, volume and "solo"</li>
  <li>Equalization, reverb, compression and other essential effects</li>
  <li>Animated time cursor</li>
  <li>Animated level meter</li>
  <li>User-uploaded samples</li>
</ul>

<br>
<br>

<p>The breakdown of work will be the following:</p>
Adam:
<ul>
  <li>Designing and implementing HTML5 front end and jQuery User Interface</li>
  <li>JSON reading/writing for loading/storing projects</li>
  <li>Designing reverb and chorus audio effects</li>
</ul>


Projects that have helped our progress so far are 
<a href = https://github.com/katspaugh/wavesurfer.js target="blank"> Wavesurfer.js</a> for generating waveform graphics and
<a href = https://github.com/cwilso/metronome target="blank">Web Audio Metronome</a> for playback scheduling.
</p>

The technologies we have used so far or are planning to use:
<ul>
  <li>Google's Web Audio API</li>
  <li>Twitter Bootstrap (for HTML5 scaffoling and javascript components)</li>
  <li>jQuery and jQuery UI for frontend programming and UI components</li>
  <li>jsNode backend for writing JSON data</li>
</ul>

Adam Levine and Pietro Verrecchia <br>
MUMT 307: Audio and Computing 2 <br>
McGill University
