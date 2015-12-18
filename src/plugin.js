import videojs from 'video.js';

// Default options for the plugin.
const defaults = {
  namespace: "video",
  endedThreshold: 3*60,
  watchedThreshold: 1*60,
  setDuration: 20*60
};

/**
 * Function to invoke when the player is ready.
 *
 * This is a great place for your plugin to initialize itself. When this
 * function is called, the player will have its DOM and child components
 * in place.
 *
 * @function onPlayerReady
 * @param    {Player} player
 * @param    {Object} [options={}]
 */
const onPlayerReady = (player, options) => {
  player.addClass('vjs-resumer');
};

/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a "ready" state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you; if not, remove the wait for "ready"!
 *
 * @function resumer
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */
const resumer = function(options) {
  if(!options.videoId) {
    return videojs.log("Resumer Plugin: videoId is not provided...");
  }

  var storageKey =  null;
  var endedThreshold = null;
  var watchedThreshold = null;
  var minDuration = null;
  var startTime = 0;
  var duration = 0;
  
  this.on("seeking", function() {
    startTime = this.currentTime();
  });
  this.on("canplay", function() {
    if(duration < minDuration || this.currentTime() != 0) {
      return;
    }
    var resumeFrom = parseInt(localStorage.getItem(this.storageKey) || 0);
    if(resumeFrom > 0) {
      this.currentTime(resumeFrom);
    }
  });

  this.on("timeupdate", function() {
    duration = this.duration();
    let curTime = this.currentTime();
    if(duration < minDuration) {
      return;
    }

    if(curTime > duration - endedThreshold) {
      removeVideoInfo();
    }
    if((curTime - startTime) > watchedThreshold) {
      localStorage.setItem(this.storageKey, curTime);
    }

  });

  function removeVideoInfo() {
    localStorage.removeItem(this.storageKey);
  }

  this.ready(() => {
    options = videojs.mergeOptions(defaults, options);
    this.storageKey = String(options.namespace) + String(options.videoId);
  });
};

// Register the plugin with video.js.
videojs.plugin('resumer', resumer);

export default resumer;
