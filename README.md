OpenDAW
=======

<p>
OpenDAW is an open source online digital audio workstation (DAW) based on the 
<a href = https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html target = "blank">Web Audio API </a>. Try OpenDAW <a href = http://opendaw.azurewebsites.net target = "blank"> here </a>.
</p>

![ScreenShot](https://raw.github.com/pvererecchia/OpenDAW/master/img/opendaw.PNG)
<br>
<h3>Update 2: April 22, 2013</h3>

<h6>Project Summary</h6>
<p>
The goal of the OpenDAW project was to create an open source online digital audio workstation using Google's Web Audio API. This API is
not currently web standard so the project only works in the latest versions of Google Chrome and Safari browsers. The node-oriented interface
of Web Audio allows for the type of audio program we were looking to create - highly customizable parameters on source, effect, and output nodes with
open ended connectivity between nodes. A number of other smaller Web Audio projects partly inspired our work (these can be viewed at the bottom
of the specification document). Our end result resembles a multi-track DAW where tracks can be independently affected by a chain of effects. There are
many features which would still need to be implemented for a fully functional program, but our work is a solid start.
</p>

<p>
The technologies used for OpenDAW besides the Web Audio API were Javascript, JQuery, and JQuery UI. The scaffolding of the site (the
page layout) was built on Twitter Bootstrap and other HTML/CSS programming. A number of third party open source JQuery components were modified and
used in our design including Wavesurfer, jQuery Knob, VUMeter and jRecorder. The citations for these can be found at the end of the presentation
document below. We also built the scheduler (the main timing component for the application) based off of a tutorial.
</p>


<p>
The basic workflow of the program upon loading is as follows: the page sends out a request for the JSON file associated with the current project. The JSON
file has a project info section which has information on the tempo, number of tracks, and effects on each track. The DOM of the page is then populated with
the HTML objects corresponding to the project (such as div elements for each track). The JSON file also contains the sample information for the project
which loads the appropriate audio buffers, and sets up the start times for each relevant sample. Once the initial load happens, the user can interact with
the jQueryUI and javascript components on the interface (such as drag and drop of samples, and knob values for effects). Upon updating, these UI components
update the backend (Web Audio API) which cause the appropriate change in playback (such as the start time of a sample or the parameters for a filter).
</p>

<p>
The backbone of OpenDAW's playback capability is the lookahead scheduler script. The scheduler constantly scans
the audio sample start times across all tracks to identify the samples that need to be played next. When one or 
more upcoming audio events are found, the scheduler script has enough time to schedule the samples at the correct playing time.
The scheduler script has a finite lifetime which is the amount of time it scans ahead. There is a recursive component to
the lookahead scheduler which allows more than one instance of the script to exist at a given time. By staggering multiple instances 
of the scheduler in time, the system is robust enough to playbck samples seamlessly among other ongoing concurrent
Javascript threads. More information about the design of the scheduler can be found <a href = "http://www.html5rocks.com/en/tutorials/audio/scheduling/"
target = "blank">here</a>.
</p>

<p>
The API has built-in single nodes for audio effects such as filtering and compression. Effects such as delay and 
reverb can be constructed by connecting multiple nodes together. The compression effect has controls for threshold level,
compression ratio and attack time. For the filter node; cutoff frequency, resonance and filter type (low-pass, high-pass,
band-pass, etc.) are controllable. The filter and compression effects in OpenDAW were made simply using these nodes. The
reverb and delay effects are also based on nodes built in to the API but require some extra work to implement controls such as wet/dry
signal mixing, delay feedback gain or multiple reverb impulse response selection. We have begun to experiment with
modulation-based effects using the oscillator node to create an LFO. A tremolo effect is currently in development. Tracks are 
designed to have their own audio bus which allows for unique effect chains on every track. The processed track signals 
are merged at the master volume node before continuing to the destination node. 
</p>

<p>
One of the challenges we faced in the project was maintaining modularity (breaking down functionality into independent and interchangable modules).
We found this to be very important both because of the large scale of the project, and the opportunity to expand it later. A place we believe
we acheived this was in our JSON data storage for project information. Instead of having the data for all the samples and effects in the main javascript
file, they are loaded from a different JSON file which minimizes the data that needs to be stored and also would allow for saving project files later.
One of the places where we could have improved on modularity was in the effect chain. At the current moment,
there is only one possible ordering for effects in the chain. Because of this limitation we have a fair amount of repeated code (if/else statements) which
check for prior/future node attachments. Given more time, we would create a system which allows for ANY arrangment of effects in the chain for each
track, and be able to update the backend more efficiently. Another future design consideration will be incorporating user-designed audio effects into
OpenDAW. This will require restructuring the way the audio bus is implemented in code and possibly some loose standardization for the way effect patches are 
created using the API. Some of the next important features that will increase
usability are to add include saving changes to workspace sessions and exporting finshed products to .WAV format.  
</p>

<p>
-Adam and Pietro
</p>


<h6>Progress since last update:</h6>
<ul>
  <li>Read/Write .json file for adding and rearranging samples in the workspace as well as seperate projects</li>
  <li><del>Add track functionality</del> <i>completed</i></li>
  <li>Remove track functionality</li>
  <li>Dynamic sample length</li>
  <li>Project save/export functionality</li>
  <li><del>Click and drag samples from directory to workspace</del> <i>completed</i></li>
  <li><del>Track-specific controls such as mute, volume and "solo"</del> <i>completed</i></li>
  <li><del>Record functionality<del> <i>completed</i></li>
  <li><del>Equalization, reverb, compression and other essential effects</del> <i>completed</i></li>
  <li><del>Animated time cursor</del> <i>completed</i></li>
  <li><del>Animated level meter</del> <i>completed</i></li>
  <li>User-uploaded samples</li>
</ul>

<a href = "https://docs.google.com/presentation/d/1BJaS6c8hqJ_MFRLzce2q5IobM6fkv_2eIF2FPUToPyk/pub?start=false&loop=false&delayms=3000" target = "blank">Class presentation</a>

<hr>
<h3>Update 1: March 26, 2013</h3>
<p>
So far, various audio clips can be placed on multiple tracks at arbitrary start times according to a 
(currently preprogrammed) .json file. The look-ahead scheduler is accurate enough to seamlessly playback looping samples
in perfect time (even for worst case javascript threading). Samples can be placed at sixteenth note resolution. 
</p>

As much as possible from the following list of features will be implemented by the project deadline:

<ul>
  <li>Read/Write .json file for adding and rearranging samples in the workspace as well as seperate projects</li>
  <li>Add/remove track functionality</li>
  <li>Dynamic sample length</li>
  <li>Project save/export functionality</li>
  <li>Click and drag samples from directory to workspace</li>
  <li>Track-specific controls such as mute, volume and "solo"</li>
  <li>Record functionality</li>
  <li>Equalization, reverb, compression and other essential effects</li>
  <li>Animated time cursor</li>
  <li>Animated level meter</li>
  <li>User-uploaded samples</li>
</ul>



<p>The breakdown of work will be the following:</p>
Adam:
<ul>
  <li>Designing and implementing HTML5 front end and jQuery User Interface</li>
  <li>JSON reading/writing for loading/storing projects</li>
  <li>Designing reverb and chorus audio effects</li>
  <li>Drag and drop from library to project</li>
  <li>Project save functionality</li>
  <li>Record functionality</li>
</ul>

Pietro:
<ul>
  <li>Complete sample scheduling and cursor timing</li>
  <li>Track-specific audio controls</li>
  <li>Global playback audio controls</li>
  <li>Filtering and equalization effects</li>
  <li>Audio file export functionality</li>
  
</ul>

</p>

<p>
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

<hr>
Adam Levine and Pietro Verrecchia <br>
MUMT 307: Audio and Computing 2 <br>
McGill University
