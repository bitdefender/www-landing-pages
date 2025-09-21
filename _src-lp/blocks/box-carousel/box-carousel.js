/* eslint-disable indent */
import Glide from '@glidejs/glide';
import { debounce } from '@repobit/dex-utils';
import { decorateIcons } from '../../scripts/lib-franklin.js';

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
    slidesHTML.push(...slides.map((slide) => {
        slide.querySelector('picture').classList.add('hey-it-works');
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

    block.classList.add('default-content-wrapper');
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
}
