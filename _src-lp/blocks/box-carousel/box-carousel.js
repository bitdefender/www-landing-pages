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

const ANIMATION_TIMING = 'cubic-bezier(0.165, 0.840, 0.440, 1.000)';

/**
 * Per-variant configuration.
 * - default: the original slider (slider below 991px)
 * - testimonials: slider on every screen size
 *   (1 slide on mobile, 2 on tablet, 4 on desktop)
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
        shouldUseCarousel: () => true,
        glideOptions: {
            type: 'slider',
            gap: 20,
            perView: 4,
            bound: true,
            rewind: false,
            touchRatio: 0.5,
            touchAngle: 45,
            dragThreshold: 120,
            swipeThreshold: 80,
            animationDuration: 400,
            animationTimingFunc: ANIMATION_TIMING,
            peek: 0,
            // Glide breakpoints are max-width values
            breakpoints: {
                991: { perView: 2 },
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
 * Generates HTML for arrow navigation.
 * Icons are rendered via CSS (see .arrow::before in box-carousel.scss).
 * @returns {string} HTML string for arrows
 */
function generateArrowsHTML() {
    return `
      <a href class="arrow disabled left-arrow" aria-label="Previous slide"></a>
      <a href class="arrow right-arrow" aria-label="Next slide"></a>
  `;
}

/**
 * Builds the carousel HTML structure
 * @param {Array} slides - Array of slide elements
 * @param {Function} slidesGenerator - Function that turns slides into <li> HTML
 * @returns {string} Complete carousel HTML
 */
function buildCarouselHTML(slides, slidesGenerator = generateSlidesHTML) {
    const slidesHTML = slidesGenerator(slides);
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

    // Recalculate slide widths whenever the block's own width changes
    // (e.g. the section was still hidden while the slider was mounting)
    if ('ResizeObserver' in window) {
        const resizeObserver = new ResizeObserver(debounce(() => {
            if (glide) glide.update();
        }, 100));
        resizeObserver.observe(block);
    }
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
