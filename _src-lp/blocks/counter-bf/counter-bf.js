/* eslint-disable no-template-curly-in-string */
import { loadCSS } from '../../scripts/lib-franklin.js';
import { productAliases } from '../../scripts/scripts.js';
import { addScript, GLOBAL_EVENTS, updateProductsList } from '../../scripts/utils.js';

export default function decorate(block) {
  // get data attributes set in metaData
  const parentBlock = block.closest('.section');
  const metaData = parentBlock.dataset;

  // config new elements
  const {
    textColor, backgroundColor, paddingTop, paddingBottom, marginTop,
    marginBottom, counterSwitchOn, counterHeadings, counterTheme, backgroundHide, products, type,
  } = metaData;

  const [contentEl, pictureBF, pictureCM] = [...block.children];
  if (backgroundHide) parentBlock.classList.add(`hide-${backgroundHide}`);

  if (counterSwitchOn) {
    // adding neccessary scripts: js, css
    loadCSS('https://cdn.jsdelivr.net/npm/flipdown@0.3.2/dist/flipdown.min.css');
    addScript('https://cdn.jsdelivr.net/npm/flipdown@0.3.2/src/flipdown.min.js', {}, 'defer', () => {
      document.dispatchEvent(new Event(GLOBAL_EVENTS.COUNTER_LOADED));
    });

    // config - hardcoded dates for December 2025 campaign (Romania time)
    const switchOnDate = new Date('2025-11-30T22:00:00.000Z').getTime() / 1000; // 1 Dec 00:00 Romania time
    const flipClockConfig = {
      theme: counterTheme || 'dark',
      switchOn: switchOnDate,
      headings: counterHeadings ? counterHeadings.split(',') : '',
    };

    // additional classes for each image
    const bannerImageBf = pictureBF && pictureBF.querySelector('picture');
    if (bannerImageBf) bannerImageBf.classList.add('pictureBF', 'banner-image', 'flipClock-image');

    if (pictureCM) {
      const bannerImageCM = pictureCM.querySelector('picture');
      bannerImageCM.classList.add('pictureCM', 'banner-image', 'flipClock-image');
      bannerImageCM.style.display = 'none';
    }

    let onePicture = false;
    if (pictureBF && !pictureCM) {
      parentBlock.style.background = `url(${pictureBF.querySelector('img').getAttribute('src').split('?')[0]}) no-repeat right top / 1400px 100% ${backgroundColor || '#000'}`;
      onePicture = true;
    }

    if (type && type === 'with_discount' && contentEl.querySelector('ul')) {
      const ulList = contentEl.querySelector('ul');
      const discountText = ulList.closest('tr').querySelector('td:last-of-type');
      const divBulina = document.createElement('div');
      divBulina.className = 'prod-percent red_bck_circle';
      divBulina.innerHTML = discountText.innerText;
      discountText.innerHTML = '';
      discountText.appendChild(divBulina);
    }

    block.innerHTML = block.innerHTML.replace('<p>[counter]</p>', `
      <div style="display: none" id="flipdown" class="flipdown"></div>
    `);

    block.innerHTML = `
      <div class="container-fluid">
        <div class="row d-xs-block d-sm-flex d-md-flex d-lg-flex position-relative">
          <div class="col-12 d-block d-sm-block d-md-none d-lg-none p-0 text-center bck-img">
            ${!onePicture && pictureBF ? pictureBF.innerHTML : ''}
            ${!onePicture && pictureCM ? pictureCM.innerHTML : ''}
          </div>

          <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6 ps-4 counter-text">${contentEl.innerHTML}</div>

          ${!onePicture ? `<div class="col-6 d-none d-sm-none d-md-block d-lg-block img-right bck-img">
            ${!onePicture && pictureBF ? pictureBF.innerHTML : ''}
            ${!onePicture && pictureCM ? pictureCM.innerHTML : ''}
          </div>` : ''}
        </div>
      </div>`;

    // replacing [count]
    block.innerHTML = block.innerHTML.replace('[counter]', `
      <div style="display: none" id="flipdown" class="flipdown"></div>
    `);

    const blockFlopDown = block.querySelector('#flipdown');
    if (blockFlopDown && blockFlopDown.closest('table')) {
      blockFlopDown.closest('table').id = 'flipdownTable';
      if (counterTheme) {
        blockFlopDown.closest('table').classList.add(counterTheme);
      }
    }

    const flipdownTable = block.querySelector('table#flipdownTable');
    const skip2ndCounter = flipdownTable !== null;

    // Hardcoded dates for December 2025 campaign (Romania time)
    const counterSwitchOnUpdated = new Date('2025-11-30T22:00:00.000Z').getTime() / 1000; // 1 Dec 00:00 Romania
    const newTime = new Date('2025-12-04T21:59:59.000Z').getTime() / 1000; // 4 Dec 23:59 Romania
    const currentTime = Math.floor(Date.now() / 1000);

    if (skip2ndCounter && counterSwitchOnUpdated > currentTime) {
      flipdownTable.style.display = 'block';
    } else {
      flipdownTable.style.display = 'none';
      if (contentEl.querySelector('div').children.length === 1) {
        parentBlock.remove();
      }
    }

    if (newTime > currentTime) {
      block.querySelector('table#flipdownTable').style.display = 'block';
      document.addEventListener(GLOBAL_EVENTS.COUNTER_LOADED, () => {
        // Initialize the first counter
        // eslint-disable-next-line no-undef
        const firstCounter = new FlipDown(Number(counterSwitchOnUpdated), flipClockConfig);
        firstCounter.start().ifEnded(() => {
          block.innerHTML = block.innerHTML.replace('Black Friday', 'Cyber Monday');
          document.title = 'Cyber Monday Sales';
          // Clear previous HTML and pictures
          block.querySelector('#flipdown').innerHTML = '';
          block.querySelectorAll('.pictureBF').forEach((elem) => { elem.style.display = 'none'; });
          block.querySelectorAll('.pictureCM').forEach((elem) => { elem.style.display = 'block'; });

          // Initialize the second counter
          // eslint-disable-next-line no-undef
          const secondCounter = new FlipDown(Number(newTime), flipClockConfig);
          secondCounter.start();
        });

        if (!firstCounter.countdownEnded) {
          block.querySelectorAll('.pictureBF').forEach((elem) => { elem.style.display = 'block'; });
          block.querySelectorAll('.pictureCM').forEach((elem) => { elem.style.display = 'none'; });
        }
      }, { once: true }); // Ensures listener only triggers once
    }

    // update background color if set, if not set default: #000
    if (backgroundColor) {
      parentBlock.style.backgroundColor = backgroundColor;
    }

    if (textColor) {
      block.style.color = textColor;
      block.children[2].style.color = textColor;
    }

    if (paddingTop) block.style.paddingTop = `${paddingTop}rem`;
    if (paddingBottom) block.style.paddingBottom = `${paddingBottom}rem`;
    if (marginTop) parentBlock.style.marginTop = `${marginTop}rem`;
    if (marginBottom) parentBlock.style.marginBottom = `${marginBottom}rem`;
  } else {
    block.innerHTML = 'Provide a valid counter Section Metadata';
  }

  if (products) {
    const productsAsList = products && products.split(',');

    productsAsList.forEach((prod, idx) => {
      // eslint-disable-next-line prefer-const
      let [prodName, prodUsers, prodYears] = productsAsList[idx].split('/');
      prodName = prodName.trim();
      updateProductsList(prod);
      const selectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;

      const pricesBox = document.createElement('div');
      pricesBox.className = `${prodName}_box prices_box d-none prodload-${selectorClass}`;
      pricesBox.innerHTML = `<div>
        <div class="">
          <span class="prod-oldprice oldprice-${selectorClass}"></span>
          <span class="prod-save"><span class="save-${selectorClass}"></span></span>
          <span class="d-none percent percent-${selectorClass}">0%</span>
        </div>
        <div class="">
          <span class="prod-newprice newprice-${selectorClass}"></span>
        </div>
      </div>`;
      block.appendChild(pricesBox);
    });

    block.innerHTML = block.innerHTML.replace(/0%/g, '<span class="max-discount"></span>');
  }
}
