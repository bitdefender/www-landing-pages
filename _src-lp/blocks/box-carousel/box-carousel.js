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

/* ---------- Original slider arrows ---------- */

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

/* ---------- Testimonials slider arrows ---------- */

const TESTIMONIAL_ARROW_PATH = `<path fill="#000" d="M4415 5430 c-92 -20 -148 -113 -125 -203 10 -37 83 -114 638 -669
l627 -628 -2011 0 -2011 0 -43 -23 c-73 -38 -108 -129 -79 -204 15 -42 68 -92
109 -103 22 -6 753 -10 2035 -10 l2000 0 -611 -604 c-354 -351 -618 -619 -628
-639 -70 -149 79 -302 222 -228 21 11 374 358 804 788 843 845 803 799 778
896 -10 37 -95 125 -788 820 -427 428 -788 784 -802 791 -35 18 -79 24 -115
16z"></path>`;

const TESTIMONIAL_ARROW_RIGHT = `
<svg version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 752 752" width="24" height="24" preserveAspectRatio="xMidYMid meet">
  <g transform="translate(0,752) scale(0.1,-0.1)">${TESTIMONIAL_ARROW_PATH}</g>
</svg>
`;

// Same icon, mirrored horizontally
const TESTIMONIAL_ARROW_LEFT = `
<svg version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 752 752" width="24" height="24" preserveAspectRatio="xMidYMid meet">
  <g transform="translate(752,752) scale(-0.1,-0.1)">${TESTIMONIAL_ARROW_PATH}</g>
</svg>
`;

const ANIMATION_TIMING = 'cubic-bezier(0.165, 0.840, 0.440, 1.000)';

/**
 * Per-variant configuration.
 * - default: the original slider (slider below 991px)
 * - testimonials: slider below 992px, static row of cards above (handled in CSS)
 */
const CAROUSEL_CONFIGS = {
    default: {
        shouldUseCarousel: () => window.innerWidth < 991,
        glideOptions: {
            type: 'carousel',
            gap: 20,
            perView: 1,
            focusAt: 'center',
            touchRatio: 0.5,
            touchAngle: 45,
            dragThreshold: 120,
            swipeThreshold: 80,
            animationDuration: 400,
            animationTimingFunc: ANIMATION_TIMING,
            peek: 0,
            bound: true,
        },
    },
    testimonials: {
        shouldUseCarousel: () => window.innerWidth < 992,
        glideOptions: {
            type: 'slider',
            gap: 20,
            perView: 2,
            bound: true,
            rewind: false,
            touchRatio: 0.5,
            touchAngle: 45,
            dragThreshold: 120,
            swipeThreshold: 80,
            animationDuration: 400,
            animationTimingFunc: ANIMATION_TIMING,
            peek: 0,
            breakpoints: {
                767: { perView: 1 },
            },
        },
    },
};

/**
 * Generates HTML for carousel slides (original slider)
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
 * Generates HTML for testimonial slides
 * Expected structure per slide:
 *   <div><div data-valign="middle">
 *     <p>Name<br>---</p>
 *     <table>...stars... | date</table>
 *     <p>Review text</p>
 *   </div></div>
 * @param {Array} slides - Array of slide elements
 * @returns {string} HTML string for all slides
 */
function generateTestimonialSlidesHTML(slides) {
    return slides.map((slide) => {
        const content = slide.querySelector('[data-valign]') || slide.firstElementChild || slide;
        const paragraphs = content.querySelectorAll(':scope > p');

        content.classList.add('testimonial-content');
        paragraphs[0]?.classList.add('testimonial-author');
        content.querySelector('table')?.classList.add('testimonial-rating');
        if (paragraphs.length > 1) {
            paragraphs[paragraphs.length - 1].classList.add('testimonial-text');
        }

        return `
    <li class="carousel-item glide__slide testimonial-item">
      ${slide.innerHTML}
    </li>
  `;
    }).join('');
}

/**
 * Removes empty rows (e.g. the empty first <div> authors leave in the doc)
 * @param {Array} slides - Array of slide elements
 * @returns {Array} Non-empty slides
 */
function filterEmptySlides(slides) {
    return slides.filter((slide) => slide.textContent.trim() !== ''
        || slide.querySelector('img, svg, picture'));
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
 * @param {boolean} isTestimonials - Use testimonial arrow icons
 * @returns {string} HTML string for arrows
 */
function generateArrowsHTML(isTestimonials = false) {
    const left = isTestimonials ? TESTIMONIAL_ARROW_LEFT : ARROW_SVG_LEFT;
    const right = isTestimonials ? TESTIMONIAL_ARROW_RIGHT : ARROW_SVG_RIGHT;
    return `
      <a href class="arrow disabled left-arrow" aria-label="Previous slide">
        ${left}
      </a>
      <a href class="arrow right-arrow" aria-label="Next slide">
        ${right}
      </a>
  `;
}

/**
 * Builds the carousel HTML structure
 * @param {Array} slides - Array of slide elements
 * @param {Function} slidesGenerator - Function that turns slides into <li> HTML
 * @param {boolean} isTestimonials - Whether this is the testimonials variant
 * @returns {string} Complete carousel HTML
 */
function buildCarouselHTML(slides, slidesGenerator = generateSlidesHTML, isTestimonials = false) {
    const slidesHTML = slidesGenerator(slides);
    const navDotsHTML = generateNavDotsHTML(slides);
    const arrowsHTML = generateArrowsHTML(isTestimonials);

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
 * Updates navigation dots to reflect current slide.
 * Dots for positions that can't be reached (when perView > 1) are hidden.
 * @param {HTMLElement} block - The carousel block element
 * @param {Object} glide - Glide instance
 */
function updateNav(block, glide) {
    const navDots = block.querySelectorAll('.navigation-item');
    const perView = glide.settings.perView || 1;
    const maxIndex = Math.max(navDots.length - perView, 0);

    navDots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === glide.index);
        dot.style.display = idx > maxIndex ? 'none' : '';
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
 * @param {Object} config - Variant config (see CAROUSEL_CONFIGS)
 * @returns {Object} Object containing glide instance and management functions
 */
function manageCarousel(block, slides, config = CAROUSEL_CONFIGS.default) {
    let glide = null;
    let isCarouselActive = false;

    const initCarousel = () => {
        if (!config.shouldUseCarousel() || isCarouselActive) return;

        glide = new Glide(block.querySelector('.glide'), { ...config.glideOptions });

        glide.mount();
        isCarouselActive = true;

        // Initial state
        updateNav(block, glide);
        updateArrows(block, glide, slides.length);

        // Update on slide change and when breakpoints change perView
        glide.on(['run', 'update', 'resize'], () => {
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
        block.querySelectorAll('.glide__slide').forEach((slide) => {
            slide.style.width = '';
            slide.style.marginLeft = '';
            slide.style.marginRight = '';
        });
    };

    const handleResize = debounce(() => {
        if (config.shouldUseCarousel()) {
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
    if (config.shouldUseCarousel()) {
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
    const isTestimonials = !!block.closest('.section')?.classList.contains('testimonials');

    // Extract slides from block children
    const [...allSlides] = [...block.children];
    const slides = isTestimonials ? filterEmptySlides(allSlides) : allSlides;

    if (isTestimonials) block.classList.add('box-carousel--testimonials');

    // Build and inject carousel HTML
    block.innerHTML = buildCarouselHTML(
        slides,
        isTestimonials ? generateTestimonialSlidesHTML : generateSlidesHTML,
        isTestimonials,
    );

    // Decorate icons and replace dividers
    decorateIcons(block);
    block.innerHTML = block.innerHTML.replaceAll('---', '<hr />');

    // Manage carousel based on screen size
    manageCarousel(
        block,
        slides,
        isTestimonials ? CAROUSEL_CONFIGS.testimonials : CAROUSEL_CONFIGS.default,
    );

    // Initialize text scramble effect (original slider only)
    if (!isTestimonials) initializeTextScramble(block);
    detectModalButtons(block);
}
