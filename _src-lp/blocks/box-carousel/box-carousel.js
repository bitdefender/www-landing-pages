/* eslint-disable indent */
import Glide from '@glidejs/glide';
import { debounce } from '@repobit/dex-utils';
import { decorateIcons } from '../../scripts/lib-franklin.js';

// ——————————————————————————————————————————————————
// TextScramble
// ——————————————————————————————————————————————————

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

function next(phrases, fx, counter) {
    fx.setText(phrases[counter]).then(() => {
        console.log('set text done');
        setTimeout(() => next(phrases, fx, counter), 800);
    });
    // eslint-disable-next-line no-param-reassign
    counter = (counter + 1) % phrases.length;
}

/**
 * Generates HTML for carousel slides
 * @param {Array} slides - Array of slide elements
 * @returns {string} HTML string for all slides
 */
function generateSlidesHTML(slides) {
    const slidesHTML = [];
    slidesHTML.push(...slides.map((slide) => {
        console.log('slide:', slide);
        slide.querySelectorAll('picture').forEach((picture, idx) => {
            picture.classList.add('images');
            picture.classList.add(`image-${idx + 1}`);
        });
        slide.querySelector('.images').closest('div').classList.add('images-container');
        const mobileImagesContainer = slide.querySelector('.images-container').cloneNode(true);
        mobileImagesContainer.classList.add('mobile-images-container');
        slide.querySelector('h3').insertAdjacentElement('afterend', mobileImagesContainer);
        slide.querySelector('p').classList.add('text-element');
        return `
    <li class="carousel-item glide__slide">
      ${slide.innerHTML}
    </li>
  `;
    }));
    return slidesHTML.join('');
}

export default async function decorate(block) {
    const [...slides] = [...block.children];
    const slidesHTML = generateSlidesHTML(slides);
    // Only one carousel-nav block: your original one with div.navigation-item
    const navDotsHTML = slides.map((_, i) => `
    <div class="navigation-item ${i === 0 ? 'active' : ''}" data-index="${i}"></div>
  `).join('');

    const arrowsHTML = `
      <a href class="arrow disabled left-arrow">
        ${ARROW_SVG_LEFT}
      </a>
      <a href class="arrow right-arrow">
        ${ARROW_SVG_RIGHT}
      </a>
  `;

    block.innerHTML = `
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
        ${navDotsHTML}
      </div>
    </div>
  `;

    decorateIcons(block);

    block.innerHTML = block.innerHTML.replaceAll('---', '<hr />');

    const glide = new Glide(block.querySelector('.glide'), {
        type: 'carousel',
        gap: 20,
        perView: 4,
        breakpoints: {
            991: { perView: 2 },
            767: { perView: 1 },
        },
    });

    glide.mount();

    function updateNav() {
        const navDots = block.querySelectorAll('.navigation-item');
        navDots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === glide.index);
        });
    }

    // Arrow click handlers to update glide
    const leftArrow = block.querySelector('.left-arrow');
    const rightArrow = block.querySelector('.right-arrow');

    function updateArrows() {
        if (!leftArrow || !rightArrow) return;

        const currentIndex = glide.index;
        const perView = glide.settings.perView || 1;
        const totalSlides = slides.length;

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

    updateNav();
    updateArrows();

    glide.on('run', () => {
        updateNav();
        updateArrows();
    });

    // Add click handlers for your nav dots to control glide
    const navDots = block.querySelectorAll('.navigation-item');
    navDots.forEach((dot) => {
        dot.addEventListener('click', () => {
            const idx = Number(dot.dataset.index);
            glide.go(`=${idx}`);
        });
    });

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

    window.addEventListener('resize', debounce(() => {
        glide.update();
    }, 250));

    window.dispatchEvent(new Event('resize'));

    const phrases = [];
    // eslint-disable-next-line prefer-const
    let counter = 0;
    const ems = block.querySelectorAll('h3 em');
    console.log('ems:', ems);
    ems.forEach((em) => {
        phrases.push(em.innerText);
    });

    ems.forEach((em) => {
        const fx = new TextScramble(em);
        next(phrases, fx, counter);
    });
}
