import Constants from '../../scripts/constants.js';
import { productAliases } from '../../scripts/scripts.js';
import {
  matchHeights, adobeMcAppendVisitorId, getBackgroundImageUrl, parseStoreProduct, wrapChildrenWithProduct,
} from '../../scripts/utils.js';

const NO_DISCOUNT = '!it.option.price.discounted';
// the block is rebuilt from innerHTML, so the store scopes are added at the end, where these attributes say:
// the children of STORE_PRODUCT elements get wrapped, STORE_PRODUCT_ELEMENT elements get wrapped themselves
const STORE_PRODUCT = 'data-bwc-store-product';
const STORE_PRODUCT_ELEMENT = 'data-bwc-store-product-element';
const STORE_EVENT = 'data-bwc-store-event';

/**
 * @param {string} attribute STORE_PRODUCT | STORE_PRODUCT_ELEMENT
 * @param {string} product e.g. vsb/10/1
 * @param {string} storeEvent
 * @returns {string}
 */
function storeProductAttributes(attribute, product, storeEvent = '') {
  return `${attribute}="${product.trim()}"${storeEvent ? ` ${STORE_EVENT}="${storeEvent}"` : ''}`;
}

/**
 * Wraps the element itself (not only its children) with bd-product > bd-option
 * @param {HTMLElement} element
 * @param {object} storeProperties
 */
function wrapElementWithProduct(element, storeProperties) {
  const { parentNode, nextSibling } = element;
  const fragment = document.createDocumentFragment();
  fragment.append(element);
  wrapChildrenWithProduct(fragment, storeProperties);
  parentNode.insertBefore(fragment, nextSibling);
}

/**
 * @param {HTMLElement} block
 */
function wrapMarkedStoreProducts(block) {
  block.querySelectorAll(`[${STORE_PRODUCT}], [${STORE_PRODUCT_ELEMENT}]`).forEach((element) => {
    const isElementWrap = element.hasAttribute(STORE_PRODUCT_ELEMENT);
    const product = element.getAttribute(isElementWrap ? STORE_PRODUCT_ELEMENT : STORE_PRODUCT);
    const { productId, devices, subscription } = parseStoreProduct(product);
    const storeProperties = {
      productId, devices, subscription, storeEvent: element.getAttribute(STORE_EVENT) || '',
    };

    element.removeAttribute(STORE_PRODUCT);
    element.removeAttribute(STORE_PRODUCT_ELEMENT);
    element.removeAttribute(STORE_EVENT);

    if (isElementWrap) {
      wrapElementWithProduct(element, storeProperties);
    } else {
      wrapChildrenWithProduct(element, storeProperties);
    }
  });
}

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

/**
 * @param {HTMLElement} tablePrices
 * @param {string} prodName
 * @param {string} tablePricesText
 * @param {string} product yearly product, e.g. vsb/10/1; the card is wrapped with it
 * @param {string} [productM] monthly product, e.g. vsbm/10/1; its box gets its own store scope
 * @param {string} [display]
 */
function updatePrices(tablePrices, prodName, tablePricesText, product, productM, display) {
  const trialText = tablePrices.closest('.section').dataset.trialText;
  const showPrice = tablePrices.closest('.section').dataset.showPrice;
  let showPriceText;
  if (showPrice) showPriceText = tablePrices.querySelector('tr:last-of-type').innerText.trim();

  // Clear existing content
  tablePrices.innerHTML = '';

  // Function to create and append price boxes
  const createPriceBox = (className, isMonthly) => {
    const boxProduct = isMonthly ? productM : product;
    // without a product (e.g. no monthly variant) the box stays empty
    const render = (attributes) => (boxProduct ? `data-store-render ${attributes}` : '');
    const hide = (hideType = '') => (boxProduct ? `data-store-hide="${NO_DISCOUNT}"${hideType ? ` data-store-hide-type="${hideType}"` : ''}` : '');
    let newPrice = render('data-store-price="discounted||full"');
    let newPriceText = '';
    if (showPrice && showPrice === 'per-month') {
      newPrice = render('data-store-price="discounted-monthly||full-monthly"');
    } else if (trialText && boxProduct) {
      // trial: the price is shown as 0 in the product currency
      newPrice = '';
      newPriceText = '{{= it.option.price.zero }}';
    }

    const pricesBox = document.createElement('div');
    pricesBox.className = `${className} ${prodName}_box prices_box await-loader`;
    pricesBox.innerHTML = `<div>
      <div class="display-flex">
        <span class="prod-oldprice" ${render('data-store-price="full"')} ${hide()}></span>
        <span class="prod-save" ${trialText ? 'style="display: none;"' : ''} ${hide('visibility')}> ${tablePricesText} <span ${render('data-store-discount="value"')}></span></span>
        <div class="prod-percent" ${hide('visibility')}>
          <span class="d-none percent" ${render('data-store-discount="percentage"')}></span>
        </div>
      </div>
      <div class="display-flex">
        <span class="prod-newprice" ${newPrice}>${newPriceText}</span>
        ${showPriceText ? `<sup>${showPriceText}</sup>` : ''}
      </div>
    </div>
    `;
    if (isMonthly && productM) pricesBox.setAttribute(STORE_PRODUCT_ELEMENT, productM.trim());
    if (isMonthly && productM) pricesBox.setAttribute(STORE_EVENT, 'info');

    tablePrices.appendChild(pricesBox);
    if (trialText) {
      const pricesTrial = document.createElement('p');
      pricesTrial.className = 'pricesTrial';
      pricesTrial.innerHTML = trialText.includes('no-trial-text') ? '' : trialText.replace('0', `<strong class="prod-newprice" ${render('data-store-price="discounted||full"')}></strong>`);
      if (isMonthly && productM) pricesTrial.setAttribute(STORE_PRODUCT_ELEMENT, productM.trim());
      tablePrices.appendChild(pricesTrial);
    }
  };

  // Create yearly and monthly price boxes
  if (display) {
    createPriceBox(display, display === 'monthly');
  } else {
    createPriceBox('monthly show', true);
    createPriceBox('yearly hide', false);
  }
}

/**
 * @param {HTMLElement} tableBuyBtn
 * @param {string} prodName
 * @param {string} product yearly product, e.g. vsb/10/1; the card is wrapped with it
 * @param {string} [productM] monthly product, e.g. vsbm/10/1; its button gets its own store scope
 * @param {string} [display]
 */
function createBuyButtons(tableBuyBtn, prodName, product, productM, display) {
  const trialText = tableBuyBtn.closest('.section').dataset.trialText;
  const hardcodedLink = tableBuyBtn.closest('.section').dataset.hardcodedLink;
  const btnText = trialText?.includes('no-trial-text') ? tableBuyBtn.textContent.replace('0%', '') : tableBuyBtn.textContent;
  const createButton = (className, isMonthly) => {
    const buttonProduct = isMonthly ? productM : product;
    let storeAttributes = '';
    if (!hardcodedLink && buttonProduct) {
      storeAttributes = `data-store-render data-store-buy-link="${parseStoreProduct(buttonProduct).trialDuration}"`;
      if (isMonthly) storeAttributes += ` ${storeProductAttributes(STORE_PRODUCT_ELEMENT, buttonProduct)}`;
    }

    const button = document.createElement('div');
    button.innerHTML = `<a href='${hardcodedLink ?? '#'}' title='Bitdefender ${prodName}' ${storeAttributes} class='${className} ${hardcodedLink ? '' : 'await-loader'} red-buy-button referrerpolicy='no-referrer-when-downgrade'>${btnText}</a>`;

    return button.innerHTML;
  };

  if (display) {
    const buyButton = createButton(display, display === 'monthly');
    tableBuyBtn.innerHTML = buyButton;
  } else {
    const buyButtonYearly = createButton('yearly hide', false);
    const buyButtonMonthly = createButton('monthly show', true);
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
    products, type, display, headerColor, textColor, cardsColor, backgroundColor, innerBackgroundColor, backgroundHide, paddingTop, paddingBottom, marginTop, bannerHide,
    marginBottom, imageCover, imageHeight, contentSize, greenTag, blockBackground, wrapperBackground, show,
  } = metaData;
  const [contentEl, pictureEl, contentRightEl, tosButton] = [...block.children];
  const prodBoxesParent = document.createElement('div');

  // config based on Metadatas
  if (block.querySelector('h1') && headerColor) block.querySelector('h1').style.color = headerColor;

  // apply discount
  contentEl.innerHTML = contentEl.innerHTML.replace(/xx%/g, '<span class="max-discount"></span>');

  // apply newprice
  if (contentRightEl) {
    contentRightEl.innerHTML = contentRightEl?.innerHTML.replace(/xx/g, `<span ${storeProductAttributes(STORE_PRODUCT, 'vpn/10/1')}><span data-store-render data-store-price="discounted||full"></span></span>`);
  }

  if (backgroundHide) parentBlock.classList.add(`hide-${backgroundHide}`);
  if (backgroundColor) parentBlockStyle.backgroundColor = backgroundColor;
  if (innerBackgroundColor) blockStyle.backgroundColor = innerBackgroundColor;
  if (textColor) blockStyle.color = textColor;
  if (paddingTop) blockStyle.paddingTop = `${paddingTop}rem`;
  if (paddingBottom) blockStyle.paddingBottom = `${paddingBottom}rem`;
  if (marginTop) blockStyle.marginTop = `${marginTop}rem`;
  if (marginBottom) blockStyle.marginBottom = `${marginBottom}rem`;

  if (bannerHide) parentBlock.classList.add(`block-hide-${bannerHide}`);
  if (wrapperBackground) block.parentElement.style.backgroundColor = wrapperBackground;

  if (!show && pictureEl && pictureEl.querySelector('img')) {
    if (blockBackground) {
      block.style.background = `url(${getBackgroundImageUrl(pictureEl.querySelector('img').getAttribute('src'))}) no-repeat top right / auto ${imageHeight || '100%'} ${backgroundColor || '#000'}`;
    } else {
      parentBlockStyle.background = `url(${getBackgroundImageUrl(pictureEl.querySelector('img').getAttribute('src'))}) no-repeat 0 0 / cover ${backgroundColor || '#000'}`;

      if (imageCover === 'full-right') {
        parentBlockStyle.background = `url(${getBackgroundImageUrl(pictureEl.querySelector('img').getAttribute('src'))}) no-repeat top right / auto ${imageHeight || '100%'} ${backgroundColor || '#000'}`;
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
      let product;
      let productM;
      if (!manualProdFlag) {
        [prodName, prodUsers, prodYears] = productsAsList[idx].split('/');
        prodName = prodName.trim();
        product = prod;
        onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;
        if (Constants.MONTHLY_PRODUCTS.includes(`${prodName}m`)) {
          productM = prod.replace(prodName, `${prodName}m`);
          onSelectorClassM = `${productAliases(`${prodName}m`)}-${prodUsers}${prodYears}`;
        }
      } else {
        [prodName, prodUsers, prodYears] = productsAsList[idx].split(',')[1].split('/');
        const [prodNameM, prodUsersM, prodYearsM] = productsAsList[idx].split(',')[0].split('/');
        product = productsAsList[idx].split(',')[1];
        onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;
        if (Constants.MONTHLY_PRODUCTS.includes(prodNameM)) {
          productM = productsAsList[idx].split(',')[0];
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
        const tablePricesText = tablePrices.querySelector('tr').textContent;
        const tableBuyBtn = contentRightItem.querySelector('table:last-of-type');
        // radios
        if (!display) {
          createRadioBoxes(tableRadios, onSelectorClassM, onSelectorClass, `${idx}_${counter}`, radio1, radio2);
        } else {
          tableRadios.remove();
        }

        // prices:
        updatePrices(tablePrices, prodName, tablePricesText, product, productM, display);

        // buylink
        createBuyButtons(tableBuyBtn, prodName, product, productM, display);
      }

      const prodBox = document.createElement('div');
      prodBox.className = 'prodBox-wrapper';
      // the whole card shares the (yearly) product, the monthly prices / button have their own scope
      prodBox.innerHTML = `<div class="prodBox box-${idx + 1}" ${storeProductAttributes(STORE_PRODUCT, product, 'info')}> ${contentRightItem.innerHTML} </div>`;
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

      prodBox.innerHTML = prodBox.innerHTML.replace(/0\s*%/g, '<span class="percent" data-store-render data-store-discount="percentage"></span>');
      // no discount: hide the text around the percentage
      prodBox.querySelectorAll('.percent[data-store-discount]').forEach((percent) => {
        if (percent.closest('.prices_box')) return;
        const container = percent.closest('p') || percent.parentElement;
        container.setAttribute('data-store-hide', NO_DISCOUNT);
        container.setAttribute('data-store-hide-type', 'visibility');
      });
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

  wrapMarkedStoreProducts(block);

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
