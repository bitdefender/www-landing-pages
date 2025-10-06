/*
 * YouTube Video Tracker
 * Tracks YouTube video events (play, pause, milestone, completed) and sends to Adobe Data Layer */

import { AdobeDataLayerService } from '@repobit/dex-data-layer';

let youtubeAPIPromise = null;

function loadYouTubeAPI() {
  if (youtubeAPIPromise) {
    return youtubeAPIPromise;
  }

  youtubeAPIPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }

    window.onYouTubeIframeAPIReady = () => {
      resolve();
    };

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  });

  return youtubeAPIPromise;
}

export default class YouTubeTracker {
  constructor(block, link, url) {
    this.block = block;
    this.link = link;
    this.url = url;

    const usp = new URLSearchParams(url.search);
    this.videoId = usp.get('v') || link.split('/').pop();

    // Detect Safari for auto-unmute functionality
    this.isSafari = YouTubeTracker.detectSafari();

    this.trackingState = {
      videoId: this.videoId,
      title: 'no title metadata provided',
      duration: 0,
      milestones: {
        25: false,
        50: false,
        75: false,
        100: false,
      },
      hasPlayed: false,
      progressInterval: null,
    };
  }

  static detectSafari() {
    const userAgent = navigator.userAgent;
    return /Safari/.test(userAgent) && !/Chrome/.test(userAgent) && !/CriOS/.test(userAgent);
  }

  updateVideoDataFromPlayer(player) {
    // Get video data from YouTube player
    const videoData = player.getVideoData ? player.getVideoData() : null;
    const duration = player.getDuration ? player.getDuration() : 0;

    if (videoData && videoData.title) {
      this.trackingState.title = videoData.title;
    }
    if (videoData && videoData.video_id) {
      this.trackingState.videoId = videoData.video_id;
    }
    if (duration > 0) {
      this.trackingState.duration = duration;
    }
  }

  sendTrackingEvent(eventName, playhead, milestone) {
    AdobeDataLayerService.push({
      event: eventName,
      video: {
        title: this.trackingState.title,
        id: this.trackingState.videoId,
        playhead: Math.round(playhead || 0),
        duration: this.trackingState.duration || 0,
        milestone: milestone || 0,
      },
    });
  }

  handlePlayingState(player) {
    // Auto-unmute on Safari after video starts playing (if user interacted with page)
    if (this.isSafari && player.isMuted && player.isMuted()) {
      try {
        player.unMute();
        console.log('Video auto-unmuted on Safari');
      } catch (error) {
        console.log('Could not auto-unmute video:', error);
      }
    }
    // Update video data from player if not yet populated
    if (!this.trackingState.duration || this.trackingState.title === 'no title metadata provided') {
      this.updateVideoDataFromPlayer(player);
    }

    if (!this.trackingState.hasPlayed) {
      this.trackingState.hasPlayed = true;
      this.sendTrackingEvent('youtube.play', 0, 0);
    }

    // Start tracking progress for milestones
    if (!this.trackingState.progressInterval) {
      this.trackingState.progressInterval = setInterval(() => {
        const time = player.getCurrentTime ? player.getCurrentTime() : 0;
        const dur = player.getDuration ? player.getDuration() : this.trackingState.duration;

        if (dur > 0) {
          const progress = (time / dur) * 100;

          // Check milestones
          if (progress >= 25 && !this.trackingState.milestones[25]) {
            this.trackingState.milestones[25] = true;
            this.sendTrackingEvent('youtube.milestone', time, 25);
          }
          if (progress >= 50 && !this.trackingState.milestones[50]) {
            this.trackingState.milestones[50] = true;
            this.sendTrackingEvent('youtube.milestone', time, 50);
          }
          if (progress >= 75 && !this.trackingState.milestones[75]) {
            this.trackingState.milestones[75] = true;
            this.sendTrackingEvent('youtube.milestone', time, 75);
          }
        }
      }, 1000);
    }
  }

  handlePausedState(currentTime) {
    if (this.trackingState.progressInterval) {
      clearInterval(this.trackingState.progressInterval);
      this.trackingState.progressInterval = null;
    }
    this.sendTrackingEvent('youtube.pause', currentTime, 0);
  }

  handleEndedState(duration, currentTime) {
    if (this.trackingState.progressInterval) {
      clearInterval(this.trackingState.progressInterval);
      this.trackingState.progressInterval = null;
    }
    if (!this.trackingState.milestones[100]) {
      this.trackingState.milestones[100] = true;
      this.sendTrackingEvent('youtube.completed', duration || currentTime, 100);
    }
  }

  onPlayerStateChange(event, player) {
    const currentTime = player.getCurrentTime ? player.getCurrentTime() : 0;
    const duration = player.getDuration ? player.getDuration() : this.trackingState.duration;

    // Playing
    if (event.data === window.YT.PlayerState.PLAYING) {
      this.handlePlayingState(player);
    }

    // Paused
    if (event.data === window.YT.PlayerState.PAUSED) {
      this.handlePausedState(currentTime);
    }

    // Ended (completed)
    if (event.data === window.YT.PlayerState.ENDED) {
      this.handleEndedState(duration, currentTime);
    }
  }

  initialize() {
    loadYouTubeAPI().then(() => {
      // Wait a bit for the iframe to be in the DOM
      setTimeout(() => {
        const iframe = this.block.querySelector('iframe');
        if (!iframe || !iframe.id) return;

        const player = new window.YT.Player(iframe.id, {
          events: {
            onStateChange: (event) => this.onPlayerStateChange(event, player),
          },
        });
      }, 500);
    });
  }
}
