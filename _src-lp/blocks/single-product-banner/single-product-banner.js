import Constants from '../../scripts/constants.js';
import { productAliases } from '../../scripts/scripts.js';
import { getBackgroundImageUrl, parseStoreProduct, wrapChildrenWithProduct } from '../../scripts/utils.js';

const NO_DISCOUNT = '!it.option.price.discounted';
// the block is rebuilt from innerHTML, so the store scopes are added at the end, where this attribute says
const STORE_PRODUCT_ATTRIBUTE = 'data-spb-store-product';
const STORE_EVENT_ATTRIBUTE = 'data-spb-store-event';

let counter = 0;

/**
 * @param {HTMLElement} element
 * @param {string} product e.g. ps/10/1
 * @param {string} storeEvent
 */
function markStoreProduct(element, product, storeEvent = '') {
  element.setAttribute(STORE_PRODUCT_ATTRIBUTE, product.trim());
  if (storeEvent) element.setAttribute(STORE_EVENT_ATTRIBUTE, storeEvent);
}

/**
 * @param {HTMLElement} block
 */
function wrapMarkedStoreProducts(block) {
  const markedElements = [block, ...block.querySelectorAll(`[${STORE_PRODUCT_ATTRIBUTE}]`)]
    .filter((element) => element.hasAttribute(STORE_PRODUCT_ATTRIBUTE));

  markedElements.forEach((element) => {
    const { productId, devices, subscription } = parseStoreProduct(element.getAttribute(STORE_PRODUCT_ATTRIBUTE));
    wrapChildrenWithProduct(element, {
      productId, devices, subscription, storeEvent: element.getAttribute(STORE_EVENT_ATTRIBUTE) || '',
    });
    element.removeAttribute(STORE_PRODUCT_ATTRIBUTE);
    element.removeAttribute(STORE_EVENT_ATTRIBUTE);
  });
}

export default function decorate(block) {
  counter += 1;
  // get data attributes set in metaData
  const parentBlock = block.closest('.section');
  const parentBlockStyle = block.closest('.section').style;
  const blockStyle = block.style;
  const metaData = block.closest('.section').dataset;

  // config new elements
  const {
    products, product, textColor, backgroundColor, paddingTop, paddingBottom, marginTop, imageCover, bannerHide,
    marginBottom, preselected, billedYearly, billedMonthly, per, logo, type,
  } = metaData;
  const [contentEl, pictureEl, contentRightEl, boxEl] = [...block.children];

  if (type && type === 'slide') parentBlock.classList.add(type);

  const tablePrices = contentRightEl.querySelector('table');
  const tableBuybtn = contentRightEl.querySelector('table:last-of-type');
  const buyButtonText = tableBuybtn.textContent;

  if (backgroundColor) parentBlockStyle.backgroundColor = backgroundColor;
  if (textColor) blockStyle.color = textColor;

  if (paddingTop) blockStyle.paddingTop = `${paddingTop}rem`;
  if (paddingBottom) blockStyle.paddingBottom = `${paddingBottom}rem`;
  if (marginTop) blockStyle.marginTop = `${marginTop}rem`;
  if (marginBottom) blockStyle.marginBottom = `${marginBottom}rem`;

  if (bannerHide) parentBlock.classList.add(`block-hide-${bannerHide}`);

  let imgPosition = 'top right';
  if (imageCover) {
    imgPosition = `top ${imageCover}`;
  }
  if (pictureEl && pictureEl.querySelector('img')) parentBlockStyle.background = `url(${getBackgroundImageUrl(pictureEl.querySelector('img').getAttribute('src'))}) no-repeat ${imgPosition} / cover ${backgroundColor || '#000'}`;

  [...contentEl.querySelectorAll('table')].forEach((table) => {
    const aliasTr = table.querySelector('tr');

    if (aliasTr && aliasTr.textContent.trim() === 'display') {
      aliasTr.parentNode.removeChild(aliasTr);
      table.style.display = 'block';
    }
  });

  if (products) {
    const productsAsList = products && products.split(',');
    const selectorBox = document.createElement('div');
    selectorBox.className = 'productSelector justify-content-start';
    if (type && type === 'slide') {
      selectorBox.classList.add('slideToggle');
    }
    const selectorBoxOptions = ['yearly', 'monthly'];
    const selectorBoxTexts = Array.from(tablePrices.querySelectorAll('td')).map((td) => td.innerHTML);

    productsAsList.forEach((item, idx) => {
      // eslint-disable-next-line prefer-const
      let [prodName, prodUsers, prodYears] = productsAsList[idx].split('/');
      prodName = prodName.trim();
      const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;
      const { trialDuration } = parseStoreProduct(item);
      const pricesBox = document.createElement('div');
      let show;
      let checkedOption = 0;
      if (preselected && preselected === 'monthly' && idx === 1) {
        show = 'show';
        checkedOption = 1;
      } else if (preselected && preselected === 'monthly' && idx === 0) {
        show = '';
      } else if (idx === 0) {
        // default selected - yearly
        show = 'show';
      }

      // prices
      let billed = '';
      if (billedYearly) {
        billed = billedYearly.replace('XX', '<span class=\'d-inline-flex\' data-store-render data-store-price="discounted||full"></span>');
      }

      let priceFull = '';
      if (type && type === 'slide') {
        priceFull = `
          <div class="priced">
            <span class='prod-newprice' data-store-render data-store-price="discounted||full"></span>
            <span class='prod-oldprice' data-store-render data-store-price="full" data-store-hide="${NO_DISCOUNT}"></span>
            <span class='prod-save greenTag d-inline' data-store-render data-store-discount="value" data-store-hide="${NO_DISCOUNT}" data-store-hide-type="visibility"></span>
          </div>`;
      } else {
        priceFull = `
          <div class="d-flex justify-content-center priced">
            <span class='prod-newprice' data-store-render data-store-price="discounted-monthly||full-monthly"></span><span class="per-month"> ${per ? `/${per}` : ''}</span>
          </div>`;
      }

      if (Constants.MONTHLY_PRODUCTS.includes(prodName)) {
        billed = billedMonthly?.replace('XX', '<span class=\'d-inline-flex\' data-store-render data-store-price="discounted||full"></span>');
        priceFull = `
        <div class="d-flex justify-content-center priced">
        <span class='prod-newprice' data-store-render data-store-price="discounted||full"></span><span class="per-month">  ${per ? `/${per}` : ''}</span>
        </div>`;
      }

      pricesBox.className = `${prodName}_box prices_box ${idx === 0 ? 'yearly' : 'monthly'} ${show} await-loader`;
      markStoreProduct(pricesBox, item, 'info');
      pricesBox.innerHTML = `<div>
        ${priceFull}
        ${billed ? `<div class="d-flex justify-content-center billed">${billed}</div>` : ''}
      </div>`;
      tablePrices.appendChild(pricesBox);

      // checkboxes options:
      let saveText = selectorBoxTexts[idx];
      if (saveText) {
        if (saveText.indexOf('<strong>')) selectorBox.classList.add('bigger');
        saveText = saveText.replace(/<strong>/g, `<span class="greenTag" data-store-hide="${NO_DISCOUNT}">`).replace(/<\/strong>/g, '</span>').replace(/0/g, '<b data-store-render data-store-discount="value"></b>');
      }

      if (selectorBoxTexts.length >= 2 && saveText.trim() !== '') {
        const hasStoreRender = saveText.includes('data-store-render');
        selectorBox.innerHTML += `
          <div class="d-flex ${idx === 0 ? 'active' : ''}">
            <input type="radio" id="pay_${selectorBoxOptions[idx]}_${counter}" class="selector-${selectorBoxOptions[idx]}" name="selectorBox${counter}" value="${selectorBoxOptions[idx]}" ${idx === checkedOption ? 'checked="check"' : ''}>
              <label for="pay_${selectorBoxOptions[idx]}_${counter}" ${hasStoreRender ? `${STORE_PRODUCT_ATTRIBUTE}="${item.trim()}"` : ''}>${saveText}</label>
          </div>
        `;
      }

      if (type && type === 'slide') {
        const parentElement = tablePrices.parentNode; // Get the parent of tablePrices
        parentElement.insertBefore(selectorBox, tablePrices);
      } else {
        tablePrices.appendChild(selectorBox);
      }

      // buylink
      const buyButton = document.createElement('div');
      buyButton.className = `buy_box buy_box_${prodName} ${idx === 0 ? 'yearly' : 'monthly'} ${show}`;
      buyButton.innerHTML = `<a href='#' title='Bitdefender ${onSelectorClass}' class='red-buy-button await-loader' data-store-render data-store-buy-link="${trialDuration}" referrerpolicy="no-referrer-when-downgrade">${buyButtonText}</a>`;
      markStoreProduct(buyButton, item);
      tableBuybtn.appendChild(buyButton);
    });
  } else {
    if (!product) return;

    block.classList.add('single-prod');

    const [prodName, prodUsers, prodYears] = product.split('/');
    const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;
    const { trialDuration } = parseStoreProduct(product);
    const pricesBox = document.createElement('div');

    // prices
    pricesBox.className = 'pricesBox await-loader';
    pricesBox.innerHTML = `<div class='prod-oldprice' data-store-render data-store-price="full" data-store-hide="${NO_DISCOUNT}"></div>`;
    pricesBox.innerHTML += '<div class=\'prod-newprice\' data-store-render data-store-price="discounted||full"></div>';
    tablePrices.appendChild(pricesBox);

    // buylink
    const buyButton = document.createElement('div');
    buyButton.innerHTML = `<a href='#' title='Bitdefender ${onSelectorClass}' class='red-buy-button await-loader' data-store-render data-store-buy-link="${trialDuration}" referrerpolicy="no-referrer-when-downgrade">${tableBuybtn.textContent}</a>`;
    tableBuybtn.appendChild(buyButton);
    tableBuybtn.style.display = 'none';

    // discount bulina:
    const percentCircle = boxEl?.querySelector('strong');
    if (percentCircle) {
      percentCircle.className = 'prod-percent green_bck_circle bigger await-loader';
      percentCircle.innerHTML = percentCircle.innerHTML.replace('0%', '<span class=\'prod-percent\' data-store-render data-store-discount="percentage"></span>');
      (percentCircle.closest('p') || percentCircle).setAttribute('data-store-hide', NO_DISCOUNT);
      (percentCircle.closest('p') || percentCircle).setAttribute('data-store-hide-type', 'visibility');
    }

    // prices, buy link and discount bulina are spread over the whole block
    markStoreProduct(block, product, 'info');
  }

  if (boxEl) {
    block.innerHTML = `
    <div class="customWrapper d-block d-md-flex d-md-flex d-xl-flex hasBox">
      <div class="boxSide col-xs-12 col-sm-12 col-md-4 col-xl-4">
        ${boxEl.innerHTML}
      </div>
      <div class="leftSide col-xs-12 col-sm-12 col-md-4 col-xl-4">
        ${contentEl.innerHTML}
      </div>
      <div class="rightSide col-xs-12 col-sm-12 col-md-4 col-xl-4">
        ${contentRightEl.innerHTML}
      </div>
    </div>
  `;
  } else {
    block.innerHTML = `
    <div class="customWrapper d-block d-md-flex d-md-flex d-xl-flex">
      <div class="leftSide col-xs-12 col-sm-12 col-md-5 col-xl-5">
        ${logo ? `<img src="${logo}" alt="Bitdefender" style="margin-bottom: -1em;">` : ''}
        ${contentEl.innerHTML}
      </div>
      <div class="rightSide col-xs-12 col-sm-12 col-md-5 col-xl-4">${contentRightEl.innerHTML}</div>
    </div>
  `;
  }

  const radioGroups = block.querySelectorAll('input[type="radio"]');
  if (radioGroups) {
    radioGroups.forEach((group) => {
      group.addEventListener('change', (event) => {
        block.querySelectorAll('.slideToggle > div').forEach((item) => item.classList.remove('active'));
        event.target.closest('div').classList.add('active');
        if (['.selector-yearly', '.selector-monthly'].some((selector) => event.target.matches(selector))) {
          ['yearly', 'monthly'].forEach((period) => {
            block.querySelector(`.prices_box.${period}`)?.classList.toggle('show');
            block.querySelector(`.buy_box.${period}`)?.classList.toggle('show');
          });
        }
      });
    });
  }

  wrapMarkedStoreProducts(block);
}
