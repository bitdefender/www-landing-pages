/*
  Information:

  MetaData:
  - svgColor :svgColor = "blue" | #313fad,
  - svgSize : svgSize = "smal" | medium
  - columnsAlignment : columnsAlignment = center
  - upperTextWidth : upperTextWidth = 2/3

  Samples:
  - https://www.bitdefender.com/media/html/consumer/new/2020/cl-offer1-opt/ultimate-flv1.html
*/
import SvgLoaderComponent from '../../components/svg-loader/svg-loader.js';
import { getDatasetFromSection, matchHeights } from '../../scripts/utils.js';
import { decorateIcons } from '../../scripts/lib-franklin.js';

function initializeSlider(block) {
  const slidesContainer = block.closest('.slider-container');
  const slidesWrapper = slidesContainer.querySelector('.slides-wrapper');
  const slides = slidesContainer.querySelectorAll('.slide');
  const leftArrow = slidesContainer.querySelector('.arrow.left');
  const rightArrow = slidesContainer.querySelector('.arrow.right');

  let currentIndex = 0;
  const updateSlider = () => {
    // Update slide position
    slidesWrapper.style.transform = `translateX(-${currentIndex * 100}%)`;

    // Update arrow
    leftArrow.disabled = currentIndex === 0;
    rightArrow.disabled = currentIndex === slides.length - 1;

    // inactive arrows
    leftArrow.classList.toggle('inactive', currentIndex === 0);
    rightArrow.classList.toggle('inactive', currentIndex === slides.length - 1);
  };

  // Event listeners for arrows
  leftArrow.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex -= 1;
      updateSlider();
    }
  });

  rightArrow.addEventListener('click', () => {
    if (currentIndex < slides.length - 1) {
      currentIndex += 1;
      updateSlider();
    }
  });

  // Initialize the slider
  updateSlider();
}

function hasOldSvgImplementation(svgNameEl) {
  return svgNameEl.childElementCount === 0;
}

function sanitiseStrongItalic(el) {
  return el.firstElementChild?.tagName === 'STRONG' ? el.firstElementChild : el;
}

export default function decorate(block) {
  const { type } = block.closest('.section').dataset;
  const metaData = getDatasetFromSection(block);

  const svgColor = metaData.svgcolor;
  const svgSize = metaData.svgsize;
  const columnsAlignment = metaData.columnsalignment;
  const upperTextWidth = metaData.upperTextWidth;

  const formattedDataColumns = [...block.children[0].children].map((svgNameEl, tableIndex) => ({
    svgNameEl: sanitiseStrongItalic(svgNameEl),
    title: block.children[1]?.children[tableIndex]?.innerText,
    subtitle: block.children[2]?.children[tableIndex]?.innerHTML,
    buttons: block.children[5]?.children[tableIndex]?.innerHTML,
  }));

  const upperText = block.children[3];
  const bottomText = block.children[4];

  if (upperTextWidth === '2/3') {
    upperText.firstElementChild.classList.add('w-lg-65');
    upperText.firstElementChild.style.margin = '0 auto';
  }

  if (type === 'mobileSlider') {
    block.parentNode.classList.add('slider-container');
  }

  block.innerHTML = `
    <div class="container rounded-bottom">
      ${upperText ? `${upperText.innerHTML}` : ''}
      <div class="row ${columnsAlignment === 'center' ? 'justify-content-center' : ''}${type === 'mobileSlider' ? 'slides-wrapper' : ''}">
        ${formattedDataColumns.map((col) => `
          <div class="quotebox col-md-12 col-lg ${columnsAlignment === 'center' ? 'col-lg-4' : ''}${type === 'mobileSlider' ? 'slide' : ''}">
            <div class="icon-box-grid-column d-flex flex-column justify-content-start">
              ${hasOldSvgImplementation(col.svgNameEl) ? new SvgLoaderComponent(col.svgNameEl.innerText, svgColor, svgSize).render() : col.svgNameEl.innerHTML}
              ${col.title ? `<h6 class="title">${col.title}</h6> ` : ''}
              ${col.subtitle ? `<div class="subtitle">${col.subtitle}</div>` : ''}
              ${col.buttons ? `<div class="buttons">${col.buttons}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
      ${bottomText ? `${bottomText.innerHTML}` : ''}
    </div>
  `;

  if (type === 'mobileSlider') {
    const arrowsSlider = document.createElement('div');
    arrowsSlider.className = 'arrowsSlider';
    arrowsSlider.innerHTML = '<button class="arrow left"></button><button class="arrow right"></button>';
    block.parentNode.appendChild(arrowsSlider);

    // slider:
    initializeSlider(block);
  }

  decorateIcons(block);
  matchHeights(block, 'h6');
}
