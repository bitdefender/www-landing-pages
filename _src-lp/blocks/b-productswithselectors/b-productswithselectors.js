import { productAliases } from '../../scripts/scripts.js';
import { updateProductsList } from '../../scripts/utils.js';

export default function decorate(block) {
  /// ///////////////////////////////////////////////////////////////////////
  // get data attributes set in metaData
  const parentSelector = block.closest('.section');
  const metaData = parentSelector.dataset;
  const {
    products, selectorsName, taxesText, discountText, tagText, priceText1, priceText2, priceText3, buttonText3, buttonText2, buttonText,
    devicesLimits,
  } = metaData;

  const productsAsList = products && products.split(',');

  if (productsAsList.length) {
    block.classList.add(`has${productsAsList.length}prods`);
    /// ///////////////////////////////////////////////////////////////////////
    // check and add products into the final array
    productsAsList.forEach((prod) => updateProductsList(prod));

    /// ///////////////////////////////////////////////////////////////////////
    // devices
    let devicesMin = 3;
    let devicesSelected = 10;
    let devicesMax = 100;
    if (devicesLimits) {
      // create the 2 selectors
      const labelName = selectorsName.split(',');
      const devicesLimitsSplit = devicesLimits.split('-');
      devicesMin = devicesLimitsSplit[0];
      devicesSelected = devicesLimitsSplit[1];
      devicesMax = devicesLimitsSplit[2];

      // TODO: In the future, we should test with jest that the devicesMin, devicesSelected and devicesMax
      // are correctly set in the DOM
      const optionsDevices = Array.from({ length: devicesMax }).fill().map((_, d) => {
        const key = d + 1;
        if (key < devicesMin) return ''; // starts from 3
        let selected = '';
        if (key === devicesSelected) { // default value selected = 10
          selected = ' selected';
        }
        return `<option value="${key}" ${selected}>${key}</option>`;
      });
      block.querySelector('p:nth-child(3)').innerHTML += `<div class="selectorBox"><label for="select${labelName[0]}">${labelName[0]}</label><select id="select${labelName[0]}" data-trigger="users">${optionsDevices}</select></div>`;

      // years
      const optionsYears = Array(3).fill().map((_, y) => {
        const key = y + 1;
        if (key < 1) return ''; // starts from 1
        let selected = '';
        if (key === 1) { // default value selected = 1
          selected = ' selected';
        }
        return `<option value="${key}" ${selected}>${key}</option>`;
      });

      block.querySelector('p:nth-child(3)').innerHTML += `<div class="selectorBox"><label for="select${labelName[1].trim()}">${labelName[1].trim()}</label><select id="select${labelName[1].trim()}" data-trigger="years">${optionsYears}</select></div>`;

      /// ///////////////////////////////////////////////////////////////////////
      // add eventListener
      if (document.querySelectorAll('.selectorBox')) {
        document.querySelectorAll('.selectorBox').forEach((item) => {
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
                if (element) {
                  element.innerHTML = value;
                }
              });
            }

            productsAsList.forEach((prod) => {
              const prodSplit = prod.split('/');
              const prodName = productAliases(prodSplit[0]);
              const prodUsers = prodSplit[1];
              const prodYears = prodSplit[2];
              const onSelectorClass = `${prodName}-${prodUsers}${prodYears}`;

              if (document.querySelector(`.${triggerType}_${onSelectorClass}_fake`)) {
                const fakeSelector = document.querySelector(`.${triggerType}_${onSelectorClass}_fake`);
                fakeSelector.value = triggerValue;
                fakeSelector.dispatchEvent(new Event('change'));
              }
            });
          });
        });
      }
    }

    /// ///////////////////////////////////////////////////////////////////////
    // create red tag
    const tagDiv = document.createElement('div');
    if (tagText) {
      tagDiv.className = 'tag redTag';
      tagDiv.innerHTML = `<i>${tagText}<i>`;
    }

    /// ///////////////////////////////////////////////////////////////////////
    // create prices sections
    productsAsList.forEach((item, idx) => {
      const [prodName, prodUsers, prodYears] = productsAsList[idx].split('/');
      const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;
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
      pricesDiv.className = `prices_box await-loader prodload prodload-${onSelectorClass}`;
      pricesDiv.innerHTML = '';

      pricesDiv.innerHTML += `
        ${customPrice ? '<div class="custom_hide">' : ''}
        <span class="prod-percent green_txt">
          <b class="percent-${onSelectorClass}">0%</b>
          ${discountText}
        </span>
        ${customPrice ? '</div>' : ''}
      `;
      pricesDiv.innerHTML += `
        ${customPrice ? '<div class="custom_hide">' : ''}
        <span class="prod-oldprice oldprice-${onSelectorClass}"></span>
        ${customPrice ? '</div>' : ''}
      `;

      if (customPrice === 'old_price') {
        pricesDiv.innerHTML += `<span class="prod-newprice oldprice-${onSelectorClass}"></span>`;
      } else {
        pricesDiv.innerHTML += `<span class="prod-newprice newprice-${customPrice || onSelectorClass}">${customPrice || ''}</span>`;
      }

      pricesDiv.innerHTML += `<span class="prod-taxes">${taxesText}</span>`;

      if (idx === 1 && buttonText2) {
        // btn 2
        const [btn2txt, btn2link] = buttonText2.split(',');
        pricesDiv.innerHTML += `<div class="buy_box buy_box${idx + 1}">
        <a class="red-buy-button await-loader prodload prodload-${onSelectorClass} ${!btn2link ? `buylink-${onSelectorClass}` : ''}" ${btn2link ? `href="${btn2link}"` : ''} referrerpolicy="no-referrer-when-downgrade">${btn2txt}</a>
        </div>`;
      } else if (idx === 2 && buttonText3) {
        // btn 3
        const [btn3txt, btn3link] = buttonText3.split(',');
        pricesDiv.innerHTML += `<div class="buy_box buy_box${idx + 1}">
          <a class="red-buy-button await-loader prodload prodload-${onSelectorClass} ${!btn3link ? `buylink-${onSelectorClass}` : ''}" ${btn3link ? `href="${btn3link}"` : ''} referrerpolicy="no-referrer-when-downgrade">${btn3txt}</a>
        </div>`;
      } else if (buttonText) {
        // default
        const [btn1txt, btn1link] = buttonText.split(',');
        pricesDiv.innerHTML += `<div class="buy_box buy_box${idx + 1}">
          <a class="red-buy-button await-loader prodload prodload-${onSelectorClass} ${!btn1link ? `buylink-${onSelectorClass}` : ''}" ${btn1link ? `href="${btn1link}"` : ''} referrerpolicy="no-referrer-when-downgrade">${btn1txt}</a>
        </div>`;
      } else {
        pricesDiv.innerHTML += `<div class="buy_box buy_box${idx + 1}">
          <a class="red-buy-button await-loader prodload prodload-${onSelectorClass} buylink-${onSelectorClass}" referrerpolicy="no-referrer-when-downgrade">Buy Now</a>
        </div>`;
      }

      const renderedProductSection = block.children[idx + 1];
      renderedProductSection.setAttribute('data-testid', 'prod_box');
      renderedProductSection.querySelector('ul').after(pricesDiv);

      // add selected element
      const selectedProductSection = block.children[idx + 1].querySelector('p:first-of-type u');
      if (selectedProductSection) {
        selectedProductSection.parentNode.parentNode.parentNode.classList.add('selected');
        if (tagDiv) {
          selectedProductSection.parentNode.parentNode.before(tagDiv);
        }
      }
    });
  }


}
