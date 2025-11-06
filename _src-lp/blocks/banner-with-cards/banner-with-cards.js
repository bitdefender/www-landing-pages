import Constants from '../../scripts/constants.js';
import { productAliases } from '../../scripts/scripts.js';
import { matchHeights, updateProductsList, adobeMcAppendVisitorId } from '../../scripts/utils.js';

function createRadioBoxes(tableRadios, onSelectorClassM, onSelectorClass, idx, radio1, radio2) {
  const radioBoxParent = document.createElement('div');
  radioBoxParent.className = 'radioBoxParent d-flex';

  const createRadioBox = (id, className, name, value, text, type, checked = false) => {
    const radioBox = document.createElement('div');
    radioBox.innerHTML = `<div class="d-radio">
      <input type="radio" id="${id}" data-select="${type}" class="${className}" name="${name}" value="${value}" ${checked ? 'checked="checked"' : ''}>
      <label for="${id}">${text}</label>
    </div>`;
    return radioBox;
  };

  radioBoxParent.appendChild(createRadioBox(`pay_${onSelectorClassM}_${idx}`, `selector-${onSelectorClassM}`, `selectorBox_${idx}`, onSelectorClassM, radio1.textContent, 'monthly', true));
  radioBoxParent.appendChild(createRadioBox(`pay_${onSelectorClass}_${idx}`, `selector-${onSelectorClass}`, `selectorBox_${idx}`, onSelectorClass, radio2.textContent, 'yearly'));

  tableRadios.innerHTML = '';
  tableRadios.appendChild(radioBoxParent);
}

function updatePrices(tablePrices, prodName, tablePricesText, onSelectorClass, onSelectorClassM, display) {
  const trialText = tablePrices.closest('.section').dataset.trialText;
  const showPrice = tablePrices.closest('.section').dataset.showPrice;
  let showPriceText;
  if (showPrice) showPriceText = tablePrices.querySelector('tr:last-of-type').innerText.trim();

  // Clear existing content
  tablePrices.innerHTML = '';

  // Function to create and append price boxes
  const createPriceBox = (className, selectorClass) => {
    const pricesBox = document.createElement('div');
    pricesBox.className = `${className} ${prodName}_box prices_box await-loader prodload prodload-${selectorClass}`;
    pricesBox.innerHTML = `<div>
      <div class="display-flex">
        <span class="prod-oldprice oldprice-${selectorClass}"></span>
        <span class="prod-save" ${trialText ? 'style="display: none;"' : ''}> ${tablePricesText} <span class="save-${selectorClass}"></span></span>
        <span class="d-none percent percent-${selectorClass}">0%</span>
      </div>
      <div class="display-flex">
        <span class="prod-newprice${trialText ? ' newprice-0' : ''} newprice-${selectorClass}${showPrice && showPrice === 'per-month' ? '-monthly' : ''}"></span>
        ${showPriceText ? `<sup>${showPriceText}</sup>` : ''}
      </div>
    </div>
    `;

    tablePrices.appendChild(pricesBox);
    if (trialText) {
      const pricesTrial = document.createElement('p');
      pricesTrial.className = 'pricesTrial';
      pricesTrial.innerHTML = trialText.includes('no-trial-text') ? '' : trialText.replace('0', `<strong class="prod-newprice newprice-${selectorClass}"></strong>`);
      tablePrices.appendChild(pricesTrial);
    }
  };

  // Create yearly and monthly price boxes
  if (display) {
    createPriceBox(display, display === 'monthly' ? onSelectorClassM : onSelectorClass);
  } else {
    createPriceBox('monthly show', onSelectorClassM);
    createPriceBox('yearly hide', onSelectorClass);
  }
}

function createBuyButtons(tableBuyBtn, prodName, onSelectorClass, onSelectorClassM, display) {
  const trialText = tableBuyBtn.closest('.section').dataset.trialText;
  const hardcodedLink = tableBuyBtn.closest('.section').dataset.hardcodedLink;
  const btnText = trialText?.includes('no-trial-text') ? tableBuyBtn.textContent.replace('0%', '') : tableBuyBtn.textContent;
  const createButton = (className, selectorClass) => {
    const button = document.createElement('div');
    button.innerHTML = `<a href='${hardcodedLink ?? '#'}' title='Bitdefender ${prodName}' class='${className} ${hardcodedLink ? '' : `await-loader prodload prodload-${selectorClass} buylink-${selectorClass}`} red-buy-button referrerpolicy='no-referrer-when-downgrade'>${btnText}</a>`;

    return button.innerHTML;
  };

  if (display) {
    const buyButton = createButton(display, display === 'monthly' ? onSelectorClassM : onSelectorClass);
    tableBuyBtn.innerHTML = buyButton;
  } else {
    const buyButtonYearly = createButton('yearly hide', onSelectorClass);
    const buyButtonMonthly = createButton('monthly show', onSelectorClassM);
    tableBuyBtn.innerHTML = `${buyButtonYearly} ${buyButtonMonthly}`;
  }
}

function activateRadios(block, type) {
  const allRadios = block.querySelectorAll('input[type="radio"]');
  allRadios.forEach((radio) => {
    const radioID = radio.id;
    block.addEventListener('click', (event) => {
      const { target } = event;
      if (target.tagName === 'INPUT' && target.id === radioID) {
        const select = target.dataset.select;
        let prodBox = target.closest('.prodBox');

        if (typeof type !== 'undefined' && type === 'combined') {
          prodBox = event.target.closest('.hasProds');
          allRadios.forEach((r) => {
            r.checked = (r.dataset.select === select);
          });
        }

        if (prodBox) {
          ['yearly', 'monthly'].forEach((period) => {
            prodBox.querySelectorAll(`.${period}`).forEach((item) => {
              item.classList.toggle('show');
              item.classList.toggle('hide');
            });
          });
        }
      }
    });
  });
}

let counter = 0;
export default function decorate(block) {
  counter += 1;
  // 1st set of variables:
  const parentBlock = block.closest('.section');
  const parentBlockStyle = block.closest('.section').style;
  const blockStyle = block.style;
  const metaData = block.closest('.section').dataset;

  // get Metadatas:
  const {
    products, type, display, headerColor, textColor, cardsColor, backgroundColor, backgroundHide, paddingTop, paddingBottom, marginTop, bannerHide,
    marginBottom, imageCover, imageHeight, contentSize, greenTag, blockBackground, wrapperBackground, show,
  } = metaData;
  const [contentEl, pictureEl, contentRightEl, tosButton] = [...block.children];
  const prodBoxesParent = document.createElement('div');

  // config based on Metadatas
  if (block.querySelector('h1')) {
    if (headerColor) block.querySelector('h1').style.color = headerColor;
    block.querySelector('h1').innerHTML = block.querySelector('h1').innerHTML.replace('xx%', '<span class="max-discount"></span>');
  }

  if (backgroundHide) parentBlock.classList.add(`hide-${backgroundHide}`);
  if (backgroundColor) parentBlockStyle.backgroundColor = backgroundColor;
  if (textColor) blockStyle.color = textColor;
  if (paddingTop) blockStyle.paddingTop = `${paddingTop}rem`;
  if (paddingBottom) blockStyle.paddingBottom = `${paddingBottom}rem`;
  if (marginTop) blockStyle.marginTop = `${marginTop}rem`;
  if (marginBottom) blockStyle.marginBottom = `${marginBottom}rem`;

  if (bannerHide) parentBlock.classList.add(`block-hide-${bannerHide}`);
  if (wrapperBackground) block.parentElement.style.backgroundColor = wrapperBackground;

  if (!show && pictureEl && pictureEl.querySelector('img')) {
    if (blockBackground) {
      block.style.background = `url(${pictureEl.querySelector('img').getAttribute('src').split('?')[0]}) no-repeat top right / auto ${imageHeight || '100%'} ${backgroundColor || '#000'}`;
    } else {
      parentBlockStyle.background = `url(${pictureEl.querySelector('img').getAttribute('src').split('?')[0]}) no-repeat 0 0 / cover ${backgroundColor || '#000'}`;

      if (imageCover === 'full-right') {
        parentBlockStyle.background = `url(${pictureEl.querySelector('img').getAttribute('src').split('?')[0]}) no-repeat top right / auto ${imageHeight || '100%'} ${backgroundColor || '#000'}`;
      }
    }
  }

  if (contentSize) parentBlock.classList.add(`content-${contentSize}`);

  // if we have set products
  if (products) {
    let manualProdFlag = false;
    let productsAsList;
    if (products.includes('[') || products.includes(']')) {
      productsAsList = products.match(/\[([^\]]+)\]/g).map((group) => group.replace(/[[\]]/g, '').trim());
      manualProdFlag = true;
    } else {
      productsAsList = products && products.split(',');
    }

    const selectorBox = document.createElement('div');
    selectorBox.className = 'productSelector justify-content-start';
    if (productsAsList.length > 1) {
      block.classList.add('hasMoreThan1');
    }
    productsAsList.forEach((prod, idx) => {
      let onSelectorClass;
      let onSelectorClassM;
      let prodName;
      let prodUsers;
      let prodYears;
      if (!manualProdFlag) {
        [prodName, prodUsers, prodYears] = productsAsList[idx].split('/');
        prodName = prodName.trim();
        updateProductsList(prod);
        onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;
        if (Constants.MONTHLY_PRODUCTS.includes(`${prodName}m`)) {
          updateProductsList(prod.replace(prodName, `${prodName}m`));
          onSelectorClassM = `${productAliases(`${prodName}m`)}-${prodUsers}${prodYears}`;
        }
      } else {
        [prodName, prodUsers, prodYears] = productsAsList[idx].split(',')[1].split('/');
        const [prodNameM, prodUsersM, prodYearsM] = productsAsList[idx].split(',')[0].split('/');
        updateProductsList(productsAsList[idx].split(',')[1]);
        onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;
        if (Constants.MONTHLY_PRODUCTS.includes(prodNameM)) {
          updateProductsList(productsAsList[idx].split(',')[0]);
          onSelectorClassM = `${productAliases(prodNameM)}-${prodUsersM}${prodYearsM}`;
        }
      }

      const contentRightItem = contentRightEl.children[idx];
      if (!contentRightItem) return;
      const [bluePill, tableRadios, tablePrices] = contentRightItem.querySelectorAll('table');
      if (bluePill) {
        bluePill.style.display = 'none';

        bluePill.querySelectorAll('tr').forEach((row) => {
          Array.from(row.cells).forEach((cell) => {
            if (cell.textContent.trim() !== '' || cell.innerHTML) {
              bluePill.style.display = '';
            }
          });
        });
      }

      if (tableRadios && tablePrices) {
        const [radio1, radio2] = tableRadios.querySelectorAll('td');
        const tablePricesText = tablePrices.textContent;
        const tableBuyBtn = contentRightItem.querySelector('table:last-of-type');
        // radios
        if (!display) {
          createRadioBoxes(tableRadios, onSelectorClassM, onSelectorClass, `${idx}_${counter}`, radio1, radio2);
        } else {
          tableRadios.remove();
        }

        // prices:
        updatePrices(tablePrices, prodName, tablePricesText, onSelectorClass, onSelectorClassM, display);

        // buylink
        createBuyButtons(tableBuyBtn, prodName, onSelectorClass, onSelectorClassM, display);
      }

      const prodBox = document.createElement('div');
      prodBox.className = 'prodBox-wrapper';
      prodBox.innerHTML = `<div class="prodBox box-${idx + 1}"> ${contentRightItem.innerHTML} </div>`;
      if (cardsColor && cardsColor === 'grey') {
        const prodBoxCard = prodBox.querySelector('.prodBox');
        prodBoxCard.style.backgroundColor = '#F6F6F6';
        prodBoxCard.style.boxShadow = 'unset';
        prodBoxCard.style.border = '1px solid #D1D1D1';
      }

      if (greenTag) {
        const greenTagEl = `<div class="prod-box-green-tag"><p><strong>${greenTag}</strong></p></div>`;
        prodBox.innerHTML = greenTagEl + prodBox.innerHTML;
      }

      if (tosButton) {
        tosButton.classList.add('tos-button');
        prodBox.insertAdjacentElement('beforeend', tosButton);
      }
      prodBox.innerHTML = prodBox.innerHTML.replace(/0\s*%/g, `<span class="percent percent-${onSelectorClass}"></span>`);
      prodBoxesParent.appendChild(prodBox);
    });
  }

  if (show && show === '3-cols' && pictureEl && pictureEl.querySelector('img')) {
    const imgBox = document.createElement('div');
    imgBox.className = 'imgBox-wrapper';
    imgBox.innerHTML = pictureEl;
  }

  // display
  block.innerHTML = `
    <div class="customWrapper d-flex hasProds">
      ${contentEl.textContent.trim() !== '' ? contentEl.innerHTML : ''}
      ${show && show === '3-cols' ? `<div class="imgBox">
        ${pictureEl.innerHTML.replace(/0\s*%/g, '<span class="max-discount"></span>')}
      </div> ` : ''}
      ${products ? prodBoxesParent.innerHTML : ''}
    </div>
  `;

  // activate radios
  if (!display) activateRadios(block, type);

  matchHeights(block, 'h3');
  matchHeights(block, '.prodBox p:first-of-type');
  matchHeights(block, '.prodBox ul:first-of-type');
  matchHeights(block, '.prices_box > div > div:first-of-type');

  const trialButton = block.querySelector('.banner-with-cards .prodBox a');
  if (trialButton && !trialButton.href.includes('store')) {
    adobeMcAppendVisitorId('.banner-with-cards .prodBox a');
  }
}
