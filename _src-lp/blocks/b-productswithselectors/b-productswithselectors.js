import {
  matchHeights, getBackgroundImageUrl, parseStoreProduct, wrapChildrenWithProduct,
} from '../../scripts/utils.js';

const NO_DISCOUNT = '!it.option.price.discounted';

export default function decorate(block) {
  /// ///////////////////////////////////////////////////////////////////////
  // get data attributes set in metaData
  const parentSelector = block.closest('.section');
  const parentSelectorStyle = parentSelector.style;
  const metaData = parentSelector.dataset;
  const {
    products, selectorsName, taxesText, discountText, tagText, priceText1, priceText2, priceText3, buttonText3, buttonText2, buttonText,
    devicesLimits, backgroundColor, backgroundImage, campaignImage,
  } = metaData;

  if (backgroundImage) {
    parentSelectorStyle.backgroundImage = `url(${getBackgroundImageUrl(backgroundImage)})`;
    if (backgroundColor) {
      parentSelectorStyle.backgroundSize = '100% auto';
      parentSelectorStyle.backgroundColor = backgroundColor;
    } else {
      parentSelectorStyle.backgroundSize = 'cover';
    }
    parentSelectorStyle.backgroundPosition = '0 0';
    parentSelectorStyle.backgroundRepeat = 'no-repeat';
    parentSelectorStyle.backgroundBlendMode = 'unset';
  }

  if (campaignImage) {
    const campaignLogo = document.createElement('div');
    campaignLogo.id = 'campaign-logo';
    campaignLogo.innerHTML = `<img src="${campaignImage}" alt="Bitdefender">`;
    block.closest('div.b-productswithselectors-wrapper').insertBefore(campaignLogo, block.closest('div.b-productswithselectors-wrapper').firstChild);
    block.classList.add('has-campaign-logo');
  }

  const productsAsList = products && products.split(',');
  if (productsAsList?.length) {
    block.classList.add(`has${productsAsList.length}prods`);

    /// ///////////////////////////////////////////////////////////////////////
    // devices
    let devicesMin = 3;
    let devicesSelected = 10;
    let devicesMax = 100;
    if (selectorsName) {
      // create the 2 selectors
      const labelName = selectorsName.split(',');
      if (devicesLimits) {
        const devicesLimitsSplit = devicesLimits.split('-');
        devicesMin = devicesLimitsSplit[0];
        devicesSelected = devicesLimitsSplit[1];
        devicesMax = devicesLimitsSplit[2];
      }

      // TODO: In the future, we should test with vitest that the devicesMin, devicesSelected and devicesMax
      // are correctly set in the DOM
      const optionsDevices = Array.from({ length: devicesMax }).fill().map((_, d) => {
        const key = d + 1;
        if (key < devicesMin) return ''; // starts from 3
        let selected = '';
        if (key === devicesSelected) { // default value selected = 10
          selected = ' selected';
        }
        return `<option value="${key}" data-store-set-devices="${key}" ${selected}>${key}</option>`;
      });
      // the selectors are store actions: they set the devices / years of every product in the block
      block.querySelector('p:nth-child(3)').innerHTML += `<div class="selectorBox">
        <label for="select${labelName[0]}">${labelName[0]}</label>
        <select id="select${labelName[0]}" data-trigger="users" data-store-action>${optionsDevices}</select>
      </div>`;

      // years
      const optionsYears = Array(3).fill().map((_, y) => {
        const key = y + 1;
        if (key < 1) return ''; // starts from 1
        let selected = '';
        if (key === 1) { // default value selected = 1
          selected = ' selected';
        }
        return `<option value="${key}" data-store-set-subscription="${key}" ${selected}>${key}</option>`;
      });

      block.querySelector('p:nth-child(3)').innerHTML += `<div class="selectorBox">
        <label for="select${labelName[1].trim()}">${labelName[1].trim()}</label>
        <select id="select${labelName[1].trim()}" data-trigger="years" data-store-action>${optionsYears}</select>
      </div>`;

      /// ///////////////////////////////////////////////////////////////////////
      // add eventListener: update the features lists (the prices are updated by the store)
      if (block.querySelectorAll('.selectorBox')) {
        block.querySelectorAll('.selectorBox').forEach((item) => {
          item.addEventListener('change', (e) => {
            const triggerType = item.children[1].getAttribute('data-trigger');
            const triggerValue = e.target.value;

            if (triggerType === 'users') {
              const fileServers1stProd = Math.ceil((Number(triggerValue)) * 0.3);
              const fileServers2ndProd = Math.ceil((Number(triggerValue)) * 0.3);
              const mailboxes = Math.ceil((Number(triggerValue) / 100) * 150);

              const selectors = [
                { index: 2, type: 1, value: triggerValue },
                { index: 3, type: 1, value: triggerValue },
                { index: 4, type: 1, value: triggerValue },
                { index: 2, type: 2, value: fileServers1stProd },
                { index: 3, type: 2, value: fileServers2ndProd },
                { index: 4, type: 2, value: fileServers2ndProd },
                { index: 4, type: 3, value: mailboxes },
              ];

              selectors.forEach((selector) => {
                const { index, type, value } = selector;
                const query = `.b-productswithselectors > div:nth-child(${index}) ul:last-of-type li:nth-child(${type}) strong`;
                const element = block.querySelector(query);
                if (element) element.innerHTML = value;
              });
            }
          });
        });
      }
    }

    /// ///////////////////////////////////////////////////////////////////////
    // create red tag
    const tagDiv = document.createElement('div');
    if (tagText) {
      tagDiv.className = 'tag redTag';
      tagDiv.innerHTML = `<i>${tagText.replace(' ', '<br>')}<i>`;
    }

    /// ///////////////////////////////////////////////////////////////////////
    // create prices sections
    productsAsList.forEach((item, idx) => {
      const {
        productId, devices, subscription, trialDuration,
      } = parseStoreProduct(item);
      const buyLinkAttributes = `data-store-render data-store-buy-link="${trialDuration}"`;
      const pricesDiv = document.createElement('div');
      let customPrice = 0;

      if (priceText1 && idx === 0) {
        customPrice = priceText1;
      }
      if (priceText2 && idx === 1) {
        customPrice = priceText2;
      }
      if (priceText3 && idx === 2) {
        customPrice = priceText3;
      }

      pricesDiv.id = 'pricesBox';
      pricesDiv.className = 'prices_box await-loader';
      pricesDiv.innerHTML = `<span class="prod-percent prod-percent-tag" data-store-hide="${NO_DISCOUNT}" data-store-hide-type="visibility">
          <span data-store-render data-store-discount="percentage"></span>
          ${discountText ?? ''}
        </span>`;

      pricesDiv.innerHTML += `
        ${customPrice ? '<div class="custom_hide">' : ''}
        <span class="prod-percent green_txt" data-store-hide="${NO_DISCOUNT}" data-store-hide-type="visibility">
          <b data-store-render data-store-discount="percentage"></b>
          ${discountText ?? ''}
        </span>
        ${customPrice ? '</div>' : ''}
      `;
      pricesDiv.innerHTML += `
        ${customPrice ? '<div class="custom_hide">' : ''}
        <span class="prod-oldprice" data-store-render data-store-price="full" data-store-hide="${NO_DISCOUNT}"></span>
        ${customPrice ? '</div>' : ''}
      `;

      if (customPrice === 'old_price') {
        pricesDiv.innerHTML += '<span class="prod-newprice" data-store-render data-store-price="full"></span>';
      } else if (customPrice) {
        pricesDiv.innerHTML += `<span class="prod-newprice">${customPrice}</span>`;
      } else {
        pricesDiv.innerHTML += '<span class="prod-newprice" data-store-render data-store-price="discounted||full"></span>';
      }

      pricesDiv.innerHTML += `<span class="prod-taxes">${taxesText}</span>`;

      if (idx === 1 && buttonText2) {
        // btn 2
        const [btn2txt, btn2link] = buttonText2.split(',');
        pricesDiv.innerHTML += `<div class="buy_box buy_box${idx + 1}">
        <a class="red-buy-button await-loader" ${btn2link ? `href="${btn2link}"` : buyLinkAttributes} referrerpolicy="no-referrer-when-downgrade">${btn2txt}</a>
        </div>`;
      } else if (idx === 2 && buttonText3) {
        // btn 3
        const [btn3txt, btn3link] = buttonText3.split(',');
        pricesDiv.innerHTML += `<div class="buy_box buy_box${idx + 1}">
          <a class="red-buy-button await-loader" ${btn3link ? `href="${btn3link}"` : buyLinkAttributes} referrerpolicy="no-referrer-when-downgrade">${btn3txt}</a>
        </div>`;
      } else if (buttonText) {
        // default
        const [btn1txt, btn1link] = buttonText.split(',');
        pricesDiv.innerHTML += `<div class="buy_box buy_box${idx + 1}">
          <a class="red-buy-button await-loader" ${btn1link ? `href="${btn1link}"` : buyLinkAttributes} referrerpolicy="no-referrer-when-downgrade">${btn1txt}</a>
        </div>`;
      } else {
        pricesDiv.innerHTML += `<div class="buy_box buy_box${idx + 1}">
          <a class="red-buy-button await-loader" ${buyLinkAttributes} referrerpolicy="no-referrer-when-downgrade">Buy Now</a>
        </div>`;
      }

      const renderedProductSection = block.children[idx + 1];
      renderedProductSection.setAttribute('data-testid', 'prod_box');
      const list = renderedProductSection.querySelector('ul');
      list.className = 'featsList';

      if (list) {
        list.after(pricesDiv);
      } else {
        renderedProductSection.appendChild(pricesDiv);
      }
      wrapChildrenWithProduct(pricesDiv, {
        productId, devices, subscription, storeEvent: 'info',
      });

      // add selected element
      const selectedProductSection = block.children[idx + 1].querySelector('p:first-of-type u');
      if (selectedProductSection) {
        selectedProductSection.parentNode.parentNode.parentNode.classList.add('selected');
        if (tagDiv) {
          selectedProductSection.parentNode.parentNode.before(tagDiv);
        }
      }
    });

    // the selectors (first column) and the prices boxes (next columns) need a common store scope,
    // and the block's own children can't be wrapped without breaking its `> div` styles
    const storeContext = document.createElement('bd-context');
    block.before(storeContext);
    storeContext.append(block);
  }

  matchHeights(block, 'ul.featsList', true);
  matchHeights(block, '.prod-newprice');
}
