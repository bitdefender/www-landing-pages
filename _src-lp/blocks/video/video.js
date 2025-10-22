/*
 * Video Block
 * Show a video referenced by a link
 * https://www.aem.live/developer/block-collection/video
 */
import { UserAgent } from '@repobit/dex-utils';
import { getDatasetFromSection } from '../../scripts/utils.js';
import YouTubeTracker from './youtube-tracker.js';

function isSafariMobile() {
  return (UserAgent.os === 'ios' || UserAgent.os === 'Mac/iOS') && UserAgent.isSafari;
}

function embedYoutube(url, autoplay) {
  const usp = new URLSearchParams(url.search);
  const muteParam = autoplay && isSafariMobile() ? '&mute=1&muted=1' : '';
  const suffix = autoplay ? `&cc_load_policy=1&autoplay=1&playsinline=1${muteParam}` : '';
  const startTime = usp.get('t') ? `&start=${encodeURIComponent(usp.get('t'))}` : '';
  let vid = usp.get('v') ? encodeURIComponent(usp.get('v')) : '';
  const embed = url.pathname;

  if (url.origin.includes('youtu.be')) {
    [, vid] = url.pathname.split('/');
  }

  const iframeId = `youtube-player-${Math.random().toString(36).substr(2, 9)}`;

  return `<div style="left:0;width:100%;height:100%;position:relative;padding-bottom:56.25%;">
    <iframe id="${iframeId}"
      src="https://www.youtube.com${vid ? `/embed/${vid}?rel=0&v=${vid}&enablejsapi=1${suffix}${startTime}` : embed}"
      style="border:0;top:0;left:0;width:100%;height:100%;position:absolute;"
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; picture-in-picture"
      allowfullscreen
      scrolling="no"
      title="Content from Youtube"
      loading="lazy"></iframe>
  </div>`;
}

function embedVimeo(url, autoplay) {
  const [, video] = url.pathname.split('/');
  const suffix = autoplay ? '?muted=1&autoplay=1' : '';

  return `<div style="left:0;width:100%;height:0;position:relative;padding-bottom:56.25%;">
    <iframe src="https://player.vimeo.com/video/${video}${suffix}"
      style="border:0;top:0;left:0;width:100%;height:100%;position:absolute;"
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
  if (block.dataset.embedIsLoaded) return;
  if (!link) return;

  const url = new URL(link);
  const isYoutube = link.includes('youtube') || link.includes('youtu.be');
  const isVimeo = link.includes('vimeo');
  const isMp4 = link.includes('.mp4');

  if (isYoutube) {
    block.innerHTML = embedYoutube(url, autoplay);
    const tracker = new YouTubeTracker(block, link, url);
    tracker.initialize();
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
  block.classList.add(DESKTOP_ALIGN_ENUM[desktopAlign] || DESKTOP_ALIGN_ENUM.left);
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
    link: null,
    title: metadata.videoTitle,
    duration: metadata.videoDuration,
  };
}

/* ------------------ Text Scramble ------------------ */
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.update = this.update.bind(this);
  }

  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => {
      this.resolve = resolve; // no-return-assign & no-promise-executor-return safe
    });

    this.queue = [];

    for (let i = 0; i < length; i += 1) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({
        from,
        to,
        start,
        end,
      });
    }

    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();

    return promise;
  }

  update() {
    let output = '';
    let complete = 0;

    for (let i = 0, n = this.queue.length; i < n; i += 1) {
      const {
        from, to, start, end, char: prevChar,
      } = this.queue[i];
      let char = prevChar;

      if (this.frame >= end) {
        complete += 1;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="dud">${char}</span>`;
      } else {
        output += from;
      }
    }

    this.el.innerHTML = output;

    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame += 1;
    }
  }

  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

/** loop care merge și cu 1 singură frază */
function next(phrases, fx, i = 0, delay = 1000) {
  const phrase = phrases[i % phrases.length];
  fx.setText(phrase).then(() => {
    setTimeout(() => next(phrases, fx, (i + 1) % phrases.length, delay), delay);
  });
}

function initializeTextScramble(block) {
  const section = block.closest('.section');
  if (!section) return;

  // ia toate <em> din default-content-wrapper (în afara block-ului video)
  const ems = section.querySelectorAll('.default-content-wrapper em');
  if (!ems.length) return;

  // frazele vin din toate <em>-urile existente
  const phrases = [...ems].map((em) => em.textContent.trim()).filter(Boolean);
  if (!phrases.length) return;

  // animăm în buclă în primul <em> (chiar dacă e o singură frază)
  const targetEm = ems[0];
  const fx = new TextScramble(targetEm);
  targetEm.textContent = ''; // pornește din „gol” ca să se vadă efectul
  next(phrases, fx, 0, 1000);

  // dacă ai mai multe <em>, celelalte le poți goli ca să nu dubleze textul
  for (let i = 1; i < ems.length; i += 1) {
    ems[i].textContent = '';
  }
}

/* ------------------ Decorate ------------------ */
export default async function decorate(block) {
  const metadata = getDatasetFromSection(block);
  const {
    desktopAlign,
    // extragem DOAR ce folosim ca să evităm no-unused-vars
    backgroundImage,
  } = metadata;

  // ia link-ul (dacă există) înainte de a goli block-ul
  const linkEl = block.querySelector('a');
  const originalLink = linkEl?.href || null;

  const placeholder = block.querySelector('picture');
  block.textContent = '';

  positionVideoContainer(block, desktopAlign);

  const currentVideoData = getCurrentVideoData(metadata);
  const videoLink = currentVideoData.link || originalLink;

  if (placeholder && videoLink) {
    const wrapper = document.createElement('div');
    wrapper.className = 'video-placeholder';
    wrapper.innerHTML = '<div class="video-placeholder-play"><button type="button" title="Play"></button></div>';
    wrapper.prepend(placeholder);
    wrapper.addEventListener('click', () => {
      loadVideoEmbed(block, videoLink, true);
    });
    block.append(wrapper);
  } else if (videoLink) {
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

  // Background: clasă + var CSS (media query în CSS – desktop doar)
  if (backgroundImage) {
    const wrapperEl = block.closest('.video-wrapper') || block.parentElement || block;
    wrapperEl.classList.add('video-bg-desktop');
    wrapperEl.style.setProperty('--video-bg-url', `url("${backgroundImage}")`);
  }

  // Scramble text (loop chiar și cu 1 frază)
  initializeTextScramble(block);
}
