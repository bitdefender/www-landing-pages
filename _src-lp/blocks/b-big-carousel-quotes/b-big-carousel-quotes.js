import SvgLoaderComponent from '../../components/svg-loader/svg-loader.js';
import { generateUuidv4 } from '../../scripts/utils.js';
import { isView } from '../../scripts/scripts.js';

export default function decorate(block) {
  const carouselSlides = [...block.children];
  const arrowSvg = new SvgLoaderComponent('arrow-left').render();
  const carouselId = generateUuidv4();
  const offsetWidth = 2.5;
  const maxSlideNr = carouselSlides.length - 1;
  let isDesktopView = isView('desktop');

  function getReadMoreEl(el) {
    return el.children[0].children[3]?.classList
      .contains('button-container') && el.children[0].children[3];
  }
  function render() {
    block.innerHTML = `
       <div id="${carouselId}" class="carousel slide carousel-fade" data-bs-wrap="false">
          <div class="carousel-indicators">
            ${carouselSlides.map((slide, idx) => {
    const readMoreEl = getReadMoreEl(slide);
    const slideImgEl = slide.children[0].children[readMoreEl ? 4 : 3];
    return `
              <div
                role="button"
                data-bs-target="#${carouselId}"
                data-bs-slide-to="${idx}"
                class="${idx === 0 ? 'active' : ''}"
                aria-current="${idx === 0 ? 'true' : 'false'}"
                aria-label="Slide ${idx + 1}">
                ${slideImgEl.innerHTML}
              </div>
            `;
  }).join('')}
          </div>

          <div class="carousel-inner">
            ${carouselSlides.map((slide, idx) => {
    const [quoteEl, authorEl, positionEl] = slide.children[0].children;
    const readMoreEl = getReadMoreEl(slide);
    const pictureEl = slide.children[0].children[readMoreEl ? 5 : 4];
    return `
                <div class="carousel-item ${idx === 0 ? 'active' : ''}">
                  <div class="inner">
                    <q>${quoteEl.innerText}</q>
                    <div class="separator"></div>
                    <div class="author">${authorEl.innerText}</div>
                    <div class="position">${positionEl.innerText}</div>
                    ${readMoreEl ? `<a class="read-more" href="${readMoreEl.children[0].href}" title="${readMoreEl.children[0].innerText}">${readMoreEl.children[0].innerText}</a>` : ''}
                  </div>
                  ${isDesktopView ? pictureEl.innerHTML : ''}
                </div>
                `;
  }).join('')}
          </div>

          <button class="carousel-control-prev disabled" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev" >
            ${arrowSvg}
            <span class="visually-hidden">Previous</span>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
            ${arrowSvg}
            <span class="visually-hidden">Next</span>
          </button>
        </div>
    `;

    const carousel = document.getElementById(carouselId);
    const carouselIndicators = carousel.querySelector('.carousel-indicators');
    const carouselIndicatorsButton = carouselIndicators.children[1];
    const ciButtonStyles = window.getComputedStyle(carouselIndicatorsButton);
    const ciButtonMarginLeft = parseFloat(ciButtonStyles.marginLeft);
    const prevButton = carousel.querySelector('.carousel-control-prev');
    const nextButton = carousel.querySelector('.carousel-control-next');

    function getIncrementScroll() {
      return carouselIndicatorsButton.offsetWidth + ciButtonMarginLeft + offsetWidth;
    }

    function updateNavigationButtonsState(currentSlideIndex) {
      if (currentSlideIndex === 0) {
        prevButton.classList.add('disabled');
      } else if (currentSlideIndex > 0 && currentSlideIndex < maxSlideNr) {
        prevButton.classList.remove('disabled');
        nextButton.classList.remove('disabled');
      } else if (currentSlideIndex === maxSlideNr) {
        nextButton.classList.add('disabled');
      }
    }

    carousel.addEventListener('slide.bs.carousel', (event) => {
      const { direction, to } = event;

      if (direction === 'left') {
        carouselIndicators.scrollLeft += getIncrementScroll();
      } else {
        carouselIndicators.scrollLeft -= getIncrementScroll();
      }

      updateNavigationButtonsState(to);
    });

    const ref = document.querySelector('.b-big-carousel-quotes-container');

    const resizeObserver = new ResizeObserver(() => {
      const newViewportView = isView('desktop');

      const viewHasChanged = isDesktopView !== newViewportView;

      if (viewHasChanged) {
        isDesktopView = newViewportView;

        render();
      }
    });

    resizeObserver.observe(ref);
  }

  render();
}
