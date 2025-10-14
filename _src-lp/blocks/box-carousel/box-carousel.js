/* eslint-disable indent */
import Glide from '@glidejs/glide';
import { debounce } from '@repobit/dex-utils';
import { decorateIcons } from '../../scripts/lib-franklin.js';
import { detectModalButtons } from '../../scripts/scripts.js';

class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }

    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        // eslint-disable-next-line no-return-assign, no-promise-executor-return
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({
                from, to, start, end,
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
        // eslint-disable-next-line no-plusplus
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let {
                // eslint-disable-next-line prefer-const
                from, to, start, end, char,
            } = this.queue[i];
            if (this.frame >= end) {
                // eslint-disable-next-line no-plusplus
                complete++;
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
            // eslint-disable-next-line no-plusplus
            this.frame++;
        }
    }

    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

const ARROW_SVG_LEFT = `
<svg width="10" height="15" viewBox="0 0 10 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.34315 1.41419L7.92893 -2.2769e-05L0.857865 7.07104L2.27208 8.48526L9.34315 1.41419Z" fill="#A6ADB4"/>
<path d="M2.27208 5.65683L0.857865 7.07104L7.92893 14.1421L9.34315 12.7279L2.27208 5.65683Z" fill="#A6ADB4"/>
</svg>
`;

const ARROW_SVG_RIGHT = `
<svg width="10" height="15" viewBox="0 0 10 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.656854 1.41419L2.07107 -2.2769e-05L9.14214 7.07104L7.72792 8.48526L0.656854 1.41419Z" fill="white"/>
<path d="M7.72792 5.65683L9.14214 7.07104L2.07107 14.1421L0.656854 12.7279L7.72792 5.65683Z" fill="white"/>
</svg>
`;

/**
 * Generates HTML for carousel slides
 * @param {Array} slides - Array of slide elements
 * @returns {string} HTML string for all slides
 */
function generateSlidesHTML(slides) {
    const slidesHTML = [];
    slidesHTML.push(...slides.map((slide, idx) => {
        const isEven = (idx + 1) % 2 === 0;
        slide.querySelectorAll('picture').forEach((picture, idx2) => {
            picture.classList.add('images');
            picture.classList.add(`image-${idx2 + 1}`);
        });
        slide.querySelector('.images').closest('div').classList.add('images-container');
        const mobileImagesContainer = slide.querySelector('.images-container').cloneNode(true);
        mobileImagesContainer.classList.add('mobile-images-container');
        slide.querySelector('h3').insertAdjacentElement('afterend', mobileImagesContainer);
        slide.querySelector('p:not(.button-container):not(:has(img))')?.classList.add('text-element');
        return `
    <li class="carousel-item glide__slide ${isEven ? 'even' : 'odd'}">
      ${slide.innerHTML}
    </li>
  `;
    }));
    return slidesHTML.join('');
}

/**
 * Generates HTML for navigation dots
 * @param {Array} slides - Array of slide elements
 * @returns {string} HTML string for navigation dots
 */
function generateNavDotsHTML(slides) {
    return slides.map((_, i) => `
    <div class="navigation-item ${i === 0 ? 'active' : ''}" data-index="${i}"></div>
  `).join('');
}

/**
 * Generates HTML for arrow navigation
 * @returns {string} HTML string for arrows
 */
function generateArrowsHTML() {
    return `
      <a href class="arrow disabled left-arrow">
        ${ARROW_SVG_LEFT}
      </a>
      <a href class="arrow right-arrow">
        ${ARROW_SVG_RIGHT}
      </a>
  `;
}

/**
 * Builds the carousel HTML structure
 * @param {Array} slides - Array of slide elements
 * @returns {string} Complete carousel HTML
 */
function buildCarouselHTML(slides) {
    const slidesHTML = generateSlidesHTML(slides);
    const navDotsHTML = generateNavDotsHTML(slides);
    const arrowsHTML = generateArrowsHTML();

    return `
    <div class="carousel-header">
      <div class="arrows d-flex">${arrowsHTML}</div>
    </div>

    <div class="carousel-container glide">
      <div class="carousel glide__track" data-glide-el="track">
        <ul class="glide__slides">
          ${slidesHTML}
        </ul>
      </div>

      <div class="carousel-nav">
        <div class="carousel-nav-wrapper">
          ${navDotsHTML}
        </div>
      </div>
    </div>
  `;
}

/**
 * Updates navigation dots to reflect current slide
 * @param {HTMLElement} block - The carousel block element
 * @param {Object} glide - Glide instance
 */
function updateNav(block, glide) {
    const navDots = block.querySelectorAll('.navigation-item');
    navDots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === glide.index);
    });
}

/**
 * Updates arrow states based on current position
 * @param {HTMLElement} block - The carousel block element
 * @param {Object} glide - Glide instance
 * @param {number} totalSlides - Total number of slides
 */
function updateArrows(block, glide, totalSlides) {
    const leftArrow = block.querySelector('.left-arrow');
    const rightArrow = block.querySelector('.right-arrow');

    if (!leftArrow || !rightArrow) return;

    const currentIndex = glide.index;
    const perView = glide.settings.perView || 1;

    if (currentIndex === 0) {
        leftArrow.classList.add('disabled');
    } else {
        leftArrow.classList.remove('disabled');
    }

    if (currentIndex >= totalSlides - perView) {
        rightArrow.classList.add('disabled');
    } else {
        rightArrow.classList.remove('disabled');
    }
}

/**
 * Sets up navigation dot click handlers
 * @param {HTMLElement} block - The carousel block element
 * @param {Object} glide - Glide instance
 */
function setupNavDotHandlers(block, glide) {
    const navDots = block.querySelectorAll('.navigation-item');
    navDots.forEach((dot) => {
        dot.addEventListener('click', () => {
            const idx = Number(dot.dataset.index);
            glide.go(`=${idx}`);
        });
    });
}

/**
 * Sets up arrow navigation handlers
 * @param {HTMLElement} block - The carousel block element
 * @param {Object} glide - Glide instance
 */
function setupArrowHandlers(block, glide) {
    const leftArrow = block.querySelector('.left-arrow');
    const rightArrow = block.querySelector('.right-arrow');

    if (leftArrow) {
        leftArrow.addEventListener('click', (e) => {
            e.preventDefault();
            glide.go('<');
        });
    }
    if (rightArrow) {
        rightArrow.addEventListener('click', (e) => {
            e.preventDefault();
            glide.go('>');
        });
    }
}

/**
 * Checks if carousel should be active based on screen width
 * @returns {boolean} True if screen width is below 768px
 */
function shouldUseCarousel() {
    return window.innerWidth < 991;
}

/**
 * Shows or hides navigation elements based on carousel state
 * @param {HTMLElement} block - The carousel block element
 * @param {boolean} show - Whether to show navigation elements
 */
function toggleNavigationVisibility(block, show) {
    const navContainer = block.querySelector('.carousel-nav');
    const arrowsContainer = block.querySelector('.carousel-header');

    if (navContainer) {
        navContainer.style.display = show ? 'inline-flex' : 'none';
    }
    if (arrowsContainer) {
        arrowsContainer.style.display = show ? 'block' : 'none';
    }
}

/**
 * Manages carousel lifecycle based on screen size
 * @param {HTMLElement} block - The carousel block element
 * @param {Array} slides - Array of slide elements
 * @returns {Object} Object containing glide instance and management functions
 */
function manageCarousel(block, slides) {
    let glide = null;
    let isCarouselActive = false;

    const initCarousel = () => {
        if (!shouldUseCarousel() || isCarouselActive) return;

        glide = new Glide(block.querySelector('.glide'), {
            type: 'carousel',
            gap: 20,
            perView: 1,
            focusAt: 'center',
            touchRatio: 0.5,
            touchAngle: 45,
            dragThreshold: 120,
            swipeThreshold: 80,
            animationDuration: 400,
            animationTimingFunc: 'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
            peek: 0,
            bound: true,
        });

        glide.mount();
        isCarouselActive = true;

        // Initial state
        updateNav(block, glide);
        updateArrows(block, glide, slides.length);

        // Update on slide change
        glide.on('run', () => {
            updateNav(block, glide);
            updateArrows(block, glide, slides.length);
        });

        // Setup event handlers
        setupNavDotHandlers(block, glide);
        setupArrowHandlers(block, glide);

        // Show navigation
        toggleNavigationVisibility(block, true);
    };

    const destroyCarousel = () => {
        if (!isCarouselActive || !glide) return;

        glide.destroy();
        glide = null;
        isCarouselActive = false;

        // Hide navigation
        toggleNavigationVisibility(block, false);

        // Reset any inline styles that might have been added by Glide
        const glideTrack = block.querySelector('.glide__track');
        const glideSlides = block.querySelector('.glide__slides');
        if (glideTrack) {
            glideTrack.style.transform = '';
        }
        if (glideSlides) {
            glideSlides.style.transform = '';
            glideSlides.style.width = '';
        }
    };

    const handleResize = debounce(() => {
        if (shouldUseCarousel()) {
            if (!isCarouselActive) {
                initCarousel();
            } else if (glide) {
                glide.update();
            }
        } else {
            destroyCarousel();
        }
    }, 250);

    // Initial setup
    if (shouldUseCarousel()) {
        initCarousel();
    } else {
        toggleNavigationVisibility(block, false);
    }

    // Listen for resize events
    window.addEventListener('resize', handleResize);
    window.dispatchEvent(new Event('resize'));
    return {
        glide,
        destroy: destroyCarousel,
        handleResize,
    };
}

function next(phrases, fx, counter) {
    fx.setText(phrases[counter]).then(() => {
        setTimeout(() => next(phrases, fx, counter), 800);
    });
    // eslint-disable-next-line no-param-reassign
    counter = (counter + 1) % phrases.length;
}

/**
 * Initializes text scramble effect for emphasized text
 * @param {HTMLElement} block - The carousel block element
 */
function initializeTextScramble(block) {
    const phrases = [];
    // eslint-disable-next-line prefer-const
    let counter = 0;
    const ems = block.querySelectorAll('h3 em');

    ems.forEach((em) => {
        phrases.push(em.innerText);
    });

    ems.forEach((em) => {
        const fx = new TextScramble(em);
        next(phrases, fx, counter);
    });
}

export default async function decorate(block) {
    // Extract slides from block children
    const [...slides] = [...block.children];

    // Build and inject carousel HTML
    block.innerHTML = buildCarouselHTML(slides);

    // Decorate icons and replace dividers
    decorateIcons(block);
    block.innerHTML = block.innerHTML.replaceAll('---', '<hr />');

    // Manage carousel based on screen size
    manageCarousel(block, slides);

    // Initialize text scramble effect
    initializeTextScramble(block);
    detectModalButtons(block);
}
