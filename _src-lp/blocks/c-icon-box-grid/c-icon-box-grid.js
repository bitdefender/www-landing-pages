/*
  Information:

  MetaData:
  - svgColor :svgColor = "blue" | #313fad,
  - svgSize : svgSize = "smal" | medium
  - columnsAlignment : columnsAlignment = center
  - upperTextWidth : upperTextWidth = 2/3
  - layout : layout = "featured-left" (66%: card1 full + cards2-4 câte 33% | 33%: card5 full)

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

function getColumnClasses(index, layout, columnsAlignment, type) {
  let classes = `quotebox col-md-12 col-lg ${columnsAlignment === 'center' ? 'col-lg-4' : ''}${type === 'mobileSlider' ? 'slide' : ''}`;

  if (layout === 'featured-left') {
    if (index === 0) {
      classes = `quotebox col-12${type === 'mobileSlider' ? ' slide' : ''}`;
    } else if (index <= 3) {
      classes = `quotebox col-md-6 col-lg-4${type === 'mobileSlider' ? ' slide' : ''}`;
    } else {
      classes = `quotebox col-12${type === 'mobileSlider' ? ' slide' : ''}`;
    }
  }

  return classes;
}

export default function decorate(block) {
  const { type } = block.closest('.section').dataset;
  const metaData = getDatasetFromSection(block);

  const svgColor = metaData.svgcolor;
  const svgSize = metaData.svgsize;
  const columnsAlignment = metaData.columnsalignment;
  const upperTextWidth = metaData.upperTextWidth;
  const layout = metaData.layout;

  const formattedDataColumns = [...block.children[0].children].map((svgNameEl, tableIndex) => ({
    svgNameEl: sanitiseStrongItalic(svgNameEl),
    title: block.children[1]?.children[tableIndex]?.innerHTML,
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

  let htmlContent = '';

  if (layout === 'featured-left' && formattedDataColumns.length >= 5) {
    const firstFourCards = formattedDataColumns.slice(0, 4);
    const fifthCard = formattedDataColumns[4];
    const remainingCards = formattedDataColumns.slice(5);

    htmlContent = `
      <div class="container rounded-bottom">
        ${upperText ? `${upperText.innerHTML}` : ''}
        <div class="row">
          <div class="col-12 col-lg-8">
            <div class="row">
              <div class="${getColumnClasses(0, layout, columnsAlignment, type)}">
                <div class="icon-box-grid-column d-flex flex-column justify-content-start">
                  ${hasOldSvgImplementation(firstFourCards[0].svgNameEl) ? new SvgLoaderComponent(firstFourCards[0].svgNameEl.innerText, svgColor, svgSize).render() : firstFourCards[0].svgNameEl.innerHTML}
                  ${firstFourCards[0].title ? `<h6 class="title">${firstFourCards[0].title}</h6> ` : ''}
                  ${firstFourCards[0].subtitle ? `<div class="subtitle">${firstFourCards[0].subtitle}</div>` : ''}
                  ${firstFourCards[0].buttons ? `<div class="buttons">${firstFourCards[0].buttons}</div>` : ''}
                </div>
              </div>
              ${firstFourCards.slice(1).map((col, index) => `
                <div class="${getColumnClasses(index + 1, layout, columnsAlignment, type)}">
                  <div class="icon-box-grid-column d-flex flex-column justify-content-start">
                    ${hasOldSvgImplementation(col.svgNameEl) ? new SvgLoaderComponent(col.svgNameEl.innerText, svgColor, svgSize).render() : col.svgNameEl.innerHTML}
                    ${col.title ? `<h6 class="title">${col.title}</h6> ` : ''}
                    ${col.subtitle ? `<div class="subtitle">${col.subtitle}</div>` : ''}
                    ${col.buttons ? `<div class="buttons">${col.buttons}</div>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="col-12 col-lg-4">
            <div class="row">
              <div class="${getColumnClasses(4, layout, columnsAlignment, type)}">
                <div class="icon-box-grid-column d-flex flex-column justify-content-start">
                  ${hasOldSvgImplementation(fifthCard.svgNameEl) ? new SvgLoaderComponent(fifthCard.svgNameEl.innerText, svgColor, svgSize).render() : fifthCard.svgNameEl.innerHTML}
                  ${fifthCard.title ? `<h6 class="title">${fifthCard.title}</h6> ` : ''}
                  ${fifthCard.subtitle ? `<div class="subtitle">${fifthCard.subtitle}</div>` : ''}
                  ${fifthCard.buttons ? `<div class="buttons">${fifthCard.buttons}</div>` : ''}
                </div>
              </div>
              ${remainingCards.map((col, index) => `
                <div class="${getColumnClasses(index + 5, layout, columnsAlignment, type)}">
                  <div class="icon-box-grid-column d-flex flex-column justify-content-start">
                    ${hasOldSvgImplementation(col.svgNameEl) ? new SvgLoaderComponent(col.svgNameEl.innerText, svgColor, svgSize).render() : col.svgNameEl.innerHTML}
                    ${col.title ? `<h6 class="title">${col.title}</h6> ` : ''}
                    ${col.subtitle ? `<div class="subtitle">${col.subtitle}</div>` : ''}
                    ${col.buttons ? `<div class="buttons">${col.buttons}</div>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        ${bottomText ? `${bottomText.innerHTML}` : ''}
      </div>
    `;
  } else {
    htmlContent = `
      <div class="container rounded-bottom">
        ${upperText ? `${upperText.innerHTML}` : ''}
        <div class="row ${columnsAlignment === 'center' && layout !== 'featured-left' ? 'justify-content-center' : ''}${type === 'mobileSlider' ? 'slides-wrapper' : ''}">
          ${formattedDataColumns.map((col, index) => `
            <div class="${getColumnClasses(index, layout, columnsAlignment, type)}">
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
  }

  if (layout) {
    block.setAttribute('data-layout', layout);
  }

  block.innerHTML = htmlContent;

  if (type === 'mobileSlider') {
    const arrowsSlider = document.createElement('div');
    arrowsSlider.className = 'arrowsSlider';
    arrowsSlider.innerHTML = '<button class="arrow left"></button><button class="arrow right"></button>';
    block.parentNode.appendChild(arrowsSlider);

    initializeSlider(block);
  }

  decorateIcons(block);
  matchHeights(block, 'h6');
}
