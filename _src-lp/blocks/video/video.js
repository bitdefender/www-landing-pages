/*
 * Video Block
 * Show a video referenced by a link
 * https://www.aem.live/developer/block-collection/video
 */

import { getDatasetFromSection } from '../../scripts/utils.js';
import YouTubeTracker from './youtube-tracker.js';

function isSafariMobile() {
  const userAgent = navigator.userAgent;
  console.log(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent) && !/CriOS/.test(userAgent);
  const isMobile = /iPhone|iPad|iPod/.test(userAgent);
  return isSafari && isMobile;
}

function embedYoutube(url, autoplay) {
  const usp = new URLSearchParams(url.search);
  const muteParam = autoplay && isSafariMobile() ? '' : '';
  const suffix = autoplay ? `&muted=1&autoplay=1&playsinline=1${muteParam}` : '';
  const startTime = usp.get('t') ? `&start=${encodeURIComponent(usp.get('t'))}` : '';
  let vid = usp.get('v') ? encodeURIComponent(usp.get('v')) : '';
  const embed = url.pathname;
  if (url.origin.includes('youtu.be')) {
    [, vid] = url.pathname.split('/');
  }
  // Generate unique ID for iframe
  const iframeId = `youtube-player-${Math.random().toString(36).substr(2, 9)}`;
  return `<div style="left: 0; width: 100%; height: 100%; position: relative; padding-bottom: 56.25%;">
  <iframe id="${iframeId}" src="https://www.youtube.com${vid ? `/embed/${vid}?rel=0&v=${vid}&enablejsapi=1${suffix}${startTime}` : embed}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
  allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; picture-in-picture" allowfullscreen="" scrolling="no" title="Content from Youtube" loading="lazy"></iframe>
  </div>`;
}

function embedVimeo(url, autoplay) {
  const [, video] = url.pathname.split('/');
  const suffix = autoplay ? '?muted=1&autoplay=1' : '';
  return `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="https://player.vimeo.com/video/${video}${suffix}" 
      style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
      frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen  
      title="Content from Vimeo" loading="lazy"></iframe>
    </div>`;
}

function getVideoElement(source, autoplay) {
  const video = document.createElement('video');
  video.setAttribute('controls', '');
  video.dataset.loading = 'true';
  video.addEventListener('loadedmetadata', () => delete video.dataset.loading);
  if (autoplay) video.setAttribute('autoplay', '');

  const sourceEl = document.createElement('source');
  sourceEl.setAttribute('src', source);
  sourceEl.setAttribute('type', `video/${source.split('.').pop()}`);
  video.append(sourceEl);

  return video;
}

function setupSafariAutoUnmute(block) {
  let hasInteracted = false;

  const handleFirstInteraction = () => {
    if (hasInteracted) return;
    hasInteracted = true;

    // Find the YouTube iframe and try to unmute
    const iframe = block.querySelector('iframe[id^="youtube-player"]');
    if (iframe && window.YT) {
      try {
        const player = new window.YT.Player(iframe.id);
        if (player.isMuted && player.isMuted()) {
          player.unMute();
          console.log('Video unmuted after user interaction on Safari');
        }
      } catch (error) {
        console.log('Could not unmute video after interaction:', error);
      }
    }

    // Remove event listeners after first interaction
    document.removeEventListener('touchstart', handleFirstInteraction);
    document.removeEventListener('click', handleFirstInteraction);
  };

  // Listen for first user interaction
  document.addEventListener('touchstart', handleFirstInteraction, { once: true });
  document.addEventListener('click', handleFirstInteraction, { once: true });
}

const loadVideoEmbed = (block, link, autoplay) => {
  if (block.dataset.embedIsLoaded) {
    return;
  }
  const url = new URL(link);

  const isYoutube = link.includes('youtube') || link.includes('youtu.be');
  const isVimeo = link.includes('vimeo');
  const isMp4 = link.includes('.mp4');

  if (isYoutube) {
    block.innerHTML = embedYoutube(url, autoplay);
    const tracker = new YouTubeTracker(block, link, url);
    tracker.initialize();

    // Set up auto-unmute functionality for Safari
    if (isSafariMobile() && autoplay) {
      setupSafariAutoUnmute(block);
    }
  } else if (isVimeo) {
    block.innerHTML = embedVimeo(url, autoplay);
  } else if (isMp4) {
    block.textContent = '';
    block.append(getVideoElement(link, autoplay));
  }

  block.dataset.embedIsLoaded = true;
};

const DESKTOP_ALIGN_ENUM = {
  left: 'left',
  right: 'right',
  center: 'center',
};

function positionVideoContainer(block, desktopAlign) {
  block.classList.add(DESKTOP_ALIGN_ENUM[desktopAlign] || DESKTOP_ALIGN_ENUM.LEFT);
}

function isMobileDevice() {
  return window.innerWidth < 768;
}

function getCurrentVideoData(metadata) {
  const isMobile = isMobileDevice();
  if (isMobile && metadata.mobileVideo) {
    return {
      link: metadata.mobileVideo,
      title: metadata.mobileVideoTitle || metadata.videoTitle,
      duration: metadata.mobileVideoDuration || metadata.videoDuration,
    };
  }

  return {
    link: null, // Will use the original link from the block
    title: metadata.videoTitle,
    duration: metadata.videoDuration,
  };
}

export default async function decorate(block) {
  const metadata = getDatasetFromSection(block);
  const {
    // eslint-disable-next-line no-unused-vars
    desktopAlign, videoTitle, videoDuration, mobileVideo, mobileVideoTitle, mobileVideoDuration,
  } = metadata;

  const placeholder = block.querySelector('picture');
  const originalLink = block.querySelector('a').href;
  block.textContent = '';

  positionVideoContainer(block, desktopAlign);

  // Determine which video to use based on device
  const currentVideoData = getCurrentVideoData(metadata);
  const videoLink = currentVideoData.link || originalLink;

  if (placeholder) {
    const wrapper = document.createElement('div');
    wrapper.className = 'video-placeholder';
    wrapper.innerHTML = '<div class="video-placeholder-play"><button type="button" title="Play"></button></div>';
    wrapper.prepend(placeholder);
    wrapper.addEventListener('click', () => {
      loadVideoEmbed(block, videoLink, true);
    });
    block.append(wrapper);
  } else {
    block.classList.add('lazy-loading');
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        loadVideoEmbed(block, videoLink, true);
        block.classList.remove('lazy-loading');
      }
    });
    observer.observe(block);
  }
}
