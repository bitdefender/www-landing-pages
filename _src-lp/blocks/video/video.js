/*
 * Video Block
 * Show a video referenced by a link
 * https://www.aem.live/developer/block-collection/video
 */

import { AdobeDataLayerService } from '@repobit/dex-data-layer';
import { getDatasetFromSection } from '../../scripts/utils.js';

function embedYoutube(url, autoplay) {
  const usp = new URLSearchParams(url.search);
  const suffix = autoplay ? '&muted=1&autoplay=1&playsinline=1&mute=1' : '';
  const startTime = usp.get('t') ? `&start=${encodeURIComponent(usp.get('t'))}` : '';
  let vid = usp.get('v') ? encodeURIComponent(usp.get('v')) : '';
  const embed = url.pathname;
  if (url.origin.includes('youtu.be')) {
    [, vid] = url.pathname.split('/');
  }
  return `<div style="left: 0; width: 100%; height: 100%; position: relative; padding-bottom: 56.25%;">
  <iframe src="https://www.youtube.com${vid ? `/embed/${vid}?rel=0&v=${vid}${suffix}${startTime}` : embed}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
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

function trackYoutubeVideo(link, url, videoTitle, videoDuration) {
  const usp = new URLSearchParams(url.search);
  AdobeDataLayerService.push({
    event: 'youtube.play',
    video: {
      title: videoTitle || 'no title metadata provided',
      id: usp.get('v') || link.split('/').pop(),
      playhead: 0,
      duration: videoDuration || 0,
      milestone: 0,
    },
  });
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

  const url = new URL(videoLink);
  const isYoutube = videoLink.includes('youtube') || videoLink.includes('youtu.be');
  if (isYoutube) {
    trackYoutubeVideo(videoLink, url, videoTitle, videoDuration);
  }
}
