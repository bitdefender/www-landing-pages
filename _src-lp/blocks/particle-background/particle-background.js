/* eslint-disable prefer-const */
/* eslint-disable camelcase */
// eslint-disable-next-line no-unused-vars
function isView(viewport) {
  const element = document.querySelectorAll(`[data-${viewport}-detector]`)[0];
  return !!(element && getComputedStyle(element).display !== 'none');
}

let tsParticles;
let loadAll;
const particleIdSelector = 'ts-particles';

async function loadParticles(options) {
  // eslint-disable-next-line import/no-unresolved
  tsParticles = (await import('https://cdn.jsdelivr.net/npm/@tsparticles/engine@3.1.0/+esm')).tsParticles;
  // eslint-disable-next-line import/no-unresolved
  loadAll = (await import('https://cdn.jsdelivr.net/npm/@tsparticles/all@3.1.0/+esm')).loadAll;

  await loadAll(tsParticles);

  await tsParticles.load({ id: particleIdSelector, options });
}

async function init(block) {
  const particleDiv = document.createElement('div');
  particleDiv.setAttribute('id', particleIdSelector);

  block.parentElement.classList.add('we-container');
  const particleBackground = block.parentElement.querySelector('.particle-background');
  particleBackground.prepend(particleDiv);

  const configs = {
    particles: {
      number: {
        value: 30,
      },
      color: {
        value: '#ffffff',
      },
      links: {
        enable: true,
        distance: 200,
      },
      shape: { type: 'circle' },
      opacity: { value: 0.6 },
      size: {
        value: {
          min: 2,
          max: 4,
        },
      },
      move: {
        enable: true,
        speed: 2,
      },
    },
    background: { color: '#016DFF' },
    poisson: { enable: true },
    fullScreen: { enable: false },
  };

  // Options for the Intersection Observer
  const options = {
    root: null, // null means observing intersections relative to the viewport
    rootMargin: '1500px', // Adjust this value to fire the event sooner or later
    threshold: 0, // Threshold set to 0 means the event will be fired as soon as one pixel is visible
  };

  // Create a new Intersection Observer instance
  const observer = new IntersectionObserver((entries, o) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadParticles(configs);

        // Stop observing
        o.unobserve(entry.target);
      }
    });
  }, options);

  // Start observing the target element
  observer.observe(block);
}

export default async function decorate(block) {
  await init(block);

  window.dispatchEvent(new CustomEvent('shadowDomLoaded'), {
    bubbles: true,
    composed: true, // This allows the event to cross the shadow DOM boundary
  });
}
