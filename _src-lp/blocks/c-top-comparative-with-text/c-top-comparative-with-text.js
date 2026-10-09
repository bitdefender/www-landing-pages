/*
  Information:
  - displays 4 boxes positioned in flex mode:
    0. top text
    1. left text
    2. product 1
    3. product 2
    4. product 3

  MetaData:
  - background : ex: grey (background-color of full section)
  - products : ex: tsmd/5/1, is/3/1, av/3/1 (alias_name/nr_devices/nr_years)
  - top_text : ex: COMPARE SOLUTIONS
                   Compare Bitdefender Products
  - active_card: 1 / 2 / 3 / 4 ... etc ( the position of the active card )
  - active_card_color: 'red' / '#434332' / rgb(212,131,44) any color format; the border top color of the active card
  Samples:
  - https://www.bitdefender.com/media/html/consumer/new/2020/cl-offer-opt/ - http://localhost:3000/consumer/en/new/cl-offer-opt
*/

import { matchHeights, parseStoreProduct, wrapChildrenWithProduct } from '../../scripts/utils.js';

const productKey = ({ productId, devices, subscription }) => `${productId}/${devices}/${subscription}`;

/**
 * Products set on the other sections of the page (e.g. the product boxes this block compares).
 * @param {HTMLElement} block
 * @returns {Set<string>}
 */
function getProductsFromOtherSections(block) {
  const ownSection = block.closest('.section');
  const keys = new Set();
  document.querySelectorAll('main .section').forEach((section) => {
    if (section === ownSection) return;
    const { products, product } = section.dataset;
    [products, product].filter(Boolean).join(',').split(',').forEach((item) => {
      if (item.trim()) keys.add(productKey(parseStoreProduct(item)));
    });
  });
  return keys;
}

/**
 * The legacy price engine mirrored the product boxes' VPN checkbox (bundle) into this block.
 * When a bundle checkbox for the same product changes outside the block, a hidden copy of it
 * inside the matching card of this block is toggled, so both show the bundle prices and link.
 * @param {HTMLElement} block
 */
function mirrorBundleCheckboxes(block) {
  document.addEventListener('change', ({ target: source }) => {
    if (!source.matches?.('input[type="checkbox"][data-store-set-bundle]') || block.contains(source)) return;
    const sourceProduct = source.closest('bd-product');
    const sourceOption = source.closest('bd-option');
    if (!sourceProduct || !sourceOption) return;

    block.querySelectorAll('bd-option').forEach((option) => {
      const product = option.closest('bd-product');
      if (product.getAttribute('product-id') !== sourceProduct.getAttribute('product-id')
        || option.getAttribute('devices') !== sourceOption.getAttribute('devices')
        || option.getAttribute('subscription') !== sourceOption.getAttribute('subscription')) return;

      const mirror = [...option.querySelectorAll(':scope > input[data-store-set-bundle]')]
        .find((input) => ['id', 'devices', 'subscription']
          .every((key) => input.getAttribute(`data-store-set-${key}`) === source.getAttribute(`data-store-set-${key}`)));
      if (mirror) {
        if (mirror.checked !== source.checked) mirror.click();
        return;
      }

      // a checked checkbox toggles the bundle on when the store connects it
      if (!source.checked) return;
      const newMirror = source.cloneNode();
      newMirror.removeAttribute('id');
      newMirror.hidden = true;
      newMirror.checked = true;
      option.prepend(newMirror);
    });
  });
}

export default function decorate(block) {
  const defaultBorderTopColorForActiveCard = '#e60093';
  /// ///////////////////////////////////////////////////////////////////////
  // get data attributes set in metaData
  const parentSelector = block.closest('.section');
  const metaData = parentSelector.dataset;
  const {
    products, topText, bulinaText, activeCardColor, activeCard, userText, discount,
  } = metaData;
  const productsAsList = products && products.split(',');

  /// ///////////////////////////////////////////////////////////////////////
  // adding top text
  if (typeof topText !== 'undefined') {
    const topTextSplitted = topText.split(',');
    const topHeader = document.createElement('div');
    topHeader.className = 'topHeader col-12';
    if (topTextSplitted[0]) {
      topHeader.innerHTML += `<h3 class="heading">${topTextSplitted[0]}</h3>`;
    }
    if (topTextSplitted[1]) {
      topHeader.innerHTML += `<h2 class="subheading">${topTextSplitted[1]}</h2>`;
    }
    block.parentNode.prepend(topHeader);
  }

  if (productsAsList.length) {
    // products already shown on the page are not counted again in analytics
    const productsFromOtherSections = getProductsFromOtherSections(block);

    /// ///////////////////////////////////////////////////////////////////////
    // set top class with numbers of products
    parentSelector.classList.add(`has${productsAsList.length}boxes`);

    // set prices and buy buttons
    block.querySelectorAll(':scope > div').forEach((item, key, list) => {
      if (key !== 0) {
        const isActiveCard = key === Number(activeCard);
        const isLastCard = key === list.length - 1;

        if (isActiveCard || (!activeCard && isLastCard)) {
          item.style.borderTopColor = activeCardColor || defaultBorderTopColorForActiveCard;
          item.classList.add('active');
        }

        const currentProduct = productsAsList[key - 1];
        const isEmptyProduct = !currentProduct || currentProduct.trim() === '';

        // DETECT hardcoded link RIGHT NOW for this card
        let hasHardcodedLink = false;
        let hardcodedLinkData = null;

        const tableBuybtn = item.querySelector('table:last-of-type td');
        if (tableBuybtn) {
          const existingLink = tableBuybtn.querySelector('a');
          if (existingLink) {
            if (existingLink.href && existingLink.href !== '' && existingLink.href !== '#') {
              const href = existingLink.href;

              if (!href.endsWith('#') && href.indexOf('#') !== href.length - 1) {
                hasHardcodedLink = true;
                hardcodedLinkData = {
                  href,
                  text: existingLink.innerText.trim() || 'BUY NOW',
                };
              }
            }
          }
        }

        // Process product
        let prodName = '';
        let onSelectorClass = 'custom';
        const storeProduct = parseStoreProduct(currentProduct);

        if (!isEmptyProduct) {
          prodName = currentProduct.split('/')[0].trim();
          onSelectorClass = `${storeProduct.productId}-${storeProduct.devices}${storeProduct.subscription}`;
        }

        const pricesSection = item.querySelector('table:first-of-type');

        // If has hardcoded link, don't create price elements at all. Otherwise show them with API loader
        let pricesDiv = '';
        if (hasHardcodedLink) {
          // Empty div, no prices at all for hardcoded links
          pricesDiv = '<div class="prices_box"></div>';
        } else {
          // Show prices with loader for API products
          const loaderClasses = !isEmptyProduct ? 'await-loader' : '';
          const storeRender = (attributes) => (!isEmptyProduct ? `data-store-render ${attributes}` : '');
          pricesDiv = `<div class="prices_box ${loaderClasses}">`;
          pricesDiv += `<span class="prod-oldprice" ${storeRender('data-store-price="full" data-store-hide="!it.option.price.discounted"')}></span>`;
          if (discount && !isEmptyProduct) pricesDiv += `<span class="percent" ${storeRender('data-store-hide="!it.option.price.discounted" data-store-hide-type="visibility"')}><span class="percent" ${storeRender('data-store-discount="percentage"')}></span> OFF</span>`;
          pricesDiv += `<span class="prod-newprice" ${storeRender('data-store-price="discounted||full"')}></span>`;
          pricesDiv += '</div>';
          if (bulinaText && (isActiveCard || isLastCard) && !isEmptyProduct) {
            const bulinaSplitted = bulinaText.split(',');
            // hidden until the store shows it, only when the product has a discount
            pricesDiv += `<div class="prod-percent green_bck_circle medium" style="visibility: hidden" ${storeRender('data-store-hide="!it.option.price.discounted" data-store-hide-type="visibility"')}>
              <span class="bulina_text1"><b ${storeRender('data-store-discount="percentage"')}></b></span>
              <span class="bulina_text2">${bulinaSplitted[1]}</span>
            </div>`;
          }
        }
        pricesSection.innerHTML = pricesDiv;

        // add buybtn div & anchor
        const tableBuybtnForButton = item.querySelector('table:last-of-type td');
        if (tableBuybtnForButton) {
          let buttonHTML = '';
          if (hasHardcodedLink && hardcodedLinkData) {
            // Use hardcoded link, no API loader
            buttonHTML = `<div class="buy_box buy_box${key}"><a href="${hardcodedLinkData.href}" title="Bitdefender" class="red-buy-button" referrerpolicy="no-referrer-when-downgrade">${hardcodedLinkData.text}</a></div>`;
          } else {
            // Use API link with loader
            const buttonText = tableBuybtnForButton.innerText.trim() || 'BUY NOW';
            const loaderClass = !isEmptyProduct ? ' await-loader' : '';
            const buyLinkAttributes = !isEmptyProduct ? ` data-store-render data-store-buy-link="${storeProduct.trialDuration}"` : '';
            buttonHTML = `<div class="buy_box buy_box${key}"><a href="#" title="Bitdefender" class="red-buy-button${loaderClass}"${buyLinkAttributes} referrerpolicy="no-referrer-when-downgrade">${buttonText}</a></div>`;
          }
          tableBuybtnForButton.innerHTML = buttonHTML;
        }

        const priceBoxSelector = block.querySelector(`.c-top-comparative-with-text > div:nth-child(${key + 1})`);
        priceBoxSelector.classList.add(`${onSelectorClass}_box_comp`);

        if (!isEmptyProduct) {
          const prodDescription = !block.classList.contains('reveresed') ? block.querySelector(`.${onSelectorClass}_box_comp > div > p:nth-child(3)`) : '';
          prodDescription?.classList.add(`${prodName}_description_comp`);

          if (userText) {
            const users = storeProduct.devices;
            const textUser = userText.split(',');
            let devicesText = '';
            if (users !== '1') {
              devicesText = `${textUser[1]}`;
            } else {
              devicesText = `${textUser[0]}`;
            }
            const devicesDesc = block.querySelector(`.${prodName}_description_comp`);
            if (devicesDesc) devicesDesc.innerHTML = `${users} ${devicesText}`;
          }

          // the same product as in the product boxes, rendered in its own store scope
          wrapChildrenWithProduct(item.querySelector(':scope > div'), {
            productId: storeProduct.productId,
            devices: storeProduct.devices,
            subscription: storeProduct.subscription,
            storeEvent: productsFromOtherSections.has(productKey(storeProduct)) ? '' : 'info',
          });
        }
      }
    });

    mirrorBundleCheckboxes(block);
  }
  const targetNode = document.querySelector('.c-top-comparative-with-text');
  matchHeights(targetNode, 'h4');
  matchHeights(block, '.prices_box');
}
