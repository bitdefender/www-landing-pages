/* eslint-disable */
import { matchHeights } from '../../scripts/utils.js';

function createCarousel(block, autoplay = false, startFrom = 0) {
  const section = block.closest('.section');
  const items = [...block.children].map((el) => el.innerHTML);

  block.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'carousel-container';

  const track = document.createElement('div');
  track.className = 'carousel-track';

  const slides = [];
  const dots = [];

  let current = 0;
  let prevArrow;
  let nextArrow;

  function getVisibleSlides() {
    if (window.innerWidth < 450) return 1;
    if (window.innerWidth < 768) return 2;

    return 3;
  }

  let visibleSlides = getVisibleSlides();

  function hasNavigation() {
    return items.length > visibleSlides;
  }

  items.forEach((html, i) => {
    const slide = document.createElement('div');
    slide.className = 'carousel-el';

    if (i === 0) {
      slide.classList.add('active');
    }

    slide.innerHTML = `<div class="carousel-content">${html}</div>`;

    slides.push(slide);
    track.append(slide);
  });

  container.append(track);
  block.append(container);

  // Bullets
  if (hasNavigation()) {
    const nav = document.createElement('div');
    nav.className = 'carousel-navigation';

    const maxIndex = Math.max(0, items.length - visibleSlides);

    for (let i = 0; i <= maxIndex; i++) {
      const dot = document.createElement('div');
      dot.className = 'carousel-dot';

      if (i === 0) {
        dot.classList.add('active');
      }

      dot.onclick = () => goTo(i);

      dots.push(dot);
      nav.append(dot);
    }

    block.append(nav);
  }

  function updateArrows() {
    if (!prevArrow) return;

    const maxIndex = Math.max(0, items.length - visibleSlides);

    const prevInactive = current === 0;
    const nextInactive = current >= maxIndex;

    prevArrow.disabled = prevInactive;
    nextArrow.disabled = nextInactive;

    prevArrow.classList.toggle('inactive', prevInactive);
    nextArrow.classList.toggle('inactive', nextInactive);
  }

  function goTo(index) {
    const maxIndex = Math.max(0, items.length - visibleSlides);

    current = Math.max(0, Math.min(index, maxIndex));

    const slideWidth = slides[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;

    track.style.transform = `translateX(-${(slideWidth + gap) * current}px)`;

    slides.forEach((s, i) => {
      s.classList.toggle('active', i === current);
    });

    dots.forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });

    updateArrows();
  }

  // Arrows
  if (hasNavigation()) {
    const arrows = document.createElement('div');
    arrows.className = 'carousel-arrows-container';

    prevArrow = document.createElement('button');
    nextArrow = document.createElement('button');

    prevArrow.className = 'carousel-prev';
    nextArrow.className = 'carousel-next';

    prevArrow.innerHTML =
      '<img src="/_src-lp/images/icons/blue-arrowleft.svg" alt="Bitdefender">';
    nextArrow.innerHTML =
      '<img src="/_src-lp/images/icons/blue-arrowright.svg" alt="Bitdefender">';

    prevArrow.onclick = () => goTo(current - 1);
    nextArrow.onclick = () => goTo(current + 1);

    arrows.append(prevArrow, nextArrow);

    if (section.dataset.arrows === 'bottom') {
      block.append(arrows);
    } else {
      section.querySelector('.default-content-wrapper')?.append(arrows);
    }

    updateArrows();
  }

  let resizeTimer;

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
      const newVisibleSlides = getVisibleSlides();

      if (newVisibleSlides !== visibleSlides) {
        visibleSlides = newVisibleSlides;

        // Dacă se schimbă breakpoint-ul, refacem carousel-ul
        createCarousel(block, autoplay, startFrom);
      } else {
        goTo(current);
      }
    }, 150);
  });

  if (autoplay && hasNavigation()) {
    setInterval(() => {
      const maxIndex = Math.max(0, items.length - visibleSlides);
      goTo(current >= maxIndex ? 0 : current + 1);
    }, 3000);
  }

  if (startFrom > 0 && hasNavigation()) {
    requestAnimationFrame(() => goTo(startFrom - 1));
  }
}

export default function decorate(block) {
  const section = block.closest('.section');

  createCarousel(
    block,
    section.dataset.autoplay === 'true',
    Number(section.dataset.startsfrom || 0),
  );
}