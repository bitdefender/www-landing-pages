import { getBackgroundImageUrl, parseStoreProduct, wrapChildrenWithProduct } from '../../scripts/utils.js';

const NO_DISCOUNT = '!it.option.price.discounted';

/**
 * Update table element
 * @param {HTMLElement} tableElement
 * @param {number} currentdevices
 * @param {number} multiplier
 * @returns {void}
 */
function updateTableElement(tableElement, currentdevices, multiplier) {
  if (tableElement) tableElement.innerText = Math.ceil((currentdevices / 100) * multiplier);
}

/**
 * this function is used to update the current devices value based on the skipUnwantedSelectorsArray
 * @param {number[]} skipUnwantedSelectorsArray
 * @param {number} currentdevices
 * @param {number} incrementalCounterValue
 * @param {HTMLElement} devicesInput
 * @param {string} action
 */
function updateCurrentDevices(skipUnwantedSelectorsArray, currentdevices, incrementalCounterValue, devicesInput, action) {
  let updatedDevices = currentdevices;
  while (skipUnwantedSelectorsArray.includes(updatedDevices) && skipUnwantedSelectorsArray.length > 0) {
    if (action === '+') {
      updatedDevices += incrementalCounterValue;
      devicesInput.value = (updatedDevices).toString();
    } else if (action === '-') {
      updatedDevices -= incrementalCounterValue;
      devicesInput.value = (updatedDevices).toString();
    }
  }
  return updatedDevices;
}

export default function decorate(block) {
  /// ///////////////////////////////////////////////////////////////////////
  // get data attributes set in metaData
  const parentSelector = block.closest('.section');
  const parentSelectorStyle = parentSelector.style;
  const [parent1ndDiv, parent2ndDiv] = block.children;

  const metaData = parentSelector.dataset;
  const {
    products, yearsText, bulinaText, devicesLimits, yearsSelector, monthlyText, incrementalCounter, titleTag,
    skipUnwantedSelectors, secondTemplate, reverseMonthlyTextWithPrice, backgroundColor, backgroundImage, backgroundRepeat, campaignImage,
  } = metaData;
  const productsAsList = products && products.split(',');
  const subscribeTexts = parent2ndDiv.querySelector('p').innerText;
  const yearText = parent2ndDiv.querySelector('p:nth-child(2)').innerText;
  const oldpriceText = parent2ndDiv.querySelector('p:nth-child(3)').innerText;
  const savingText = parent2ndDiv.querySelector('p:nth-child(4)').innerText;
  const buylinkText = parent2ndDiv.querySelector('p:nth-child(5)').innerText;
  const taxesText = parent2ndDiv.querySelector('p:nth-child(6)').innerText;

  if (backgroundImage) {
    parentSelectorStyle.backgroundSize = 'cover';
    parentSelectorStyle.backgroundImage = `url(${getBackgroundImageUrl(backgroundImage)})`;
    parentSelectorStyle.backgroundPosition = '0 0';
    parentSelectorStyle.backgroundBlendMode = 'unset';

    if (backgroundColor) {
      parentSelectorStyle.backgroundSize = '100% auto';
      parentSelectorStyle.backgroundColor = backgroundColor;
    }

    parentSelectorStyle.backgroundRepeat = 'no-repeat';
    if (backgroundRepeat) parentSelectorStyle.backgroundRepeat = 'repeat';
  }

  if (campaignImage) {
    const campaignLogo = document.createElement('div');
    campaignLogo.id = 'campaign-logo';
    campaignLogo.innerHTML = `<img src="${campaignImage}" alt="Bitdefender">`;
    parentSelector.insertBefore(campaignLogo, parentSelector.firstChild);
    block.classList.add('has-campaign-logo');
  }

  let devicesMin = 1;
  let devicesSelected = 5;
  let devicesMax = 100;
  if (devicesLimits) {
    const devicesLimitsSplit = devicesLimits.split('-');
    devicesMin = devicesLimitsSplit[0];
    devicesSelected = devicesLimitsSplit[1];
    devicesMax = devicesLimitsSplit[2];
  }

  let incrementalCounterValue = 1;
  if (incrementalCounter) {
    incrementalCounterValue = parseInt(incrementalCounter, 10);
  }

  const skipUnwantedSelectorsArray = skipUnwantedSelectors?.split(',') || [];
  // transform to numbered array
  skipUnwantedSelectorsArray.forEach((item, idx) => {
    skipUnwantedSelectorsArray[idx] = parseInt(item, 10);
  });

  const blockH3 = block.querySelector('h3');
  if (blockH3 && titleTag) {
    const spanTag = document.createElement('span');
    spanTag.className = 'greenTag';
    spanTag.innerText = titleTag;
    blockH3.appendChild(spanTag);
  }

  if (bulinaText) {
    const divBulina = document.createElement('div');
    divBulina.className = 'prod-percent green_bck_circle bigger has2txt';
    divBulina.innerHTML = `${bulinaText.replace(/0,/g, '<b class=\'max-discount\'></b>')}`;
    block.before(divBulina);
  }

  if (productsAsList?.length) {
    /// ///////////////////////////////////////////////////////////////////////
    // adding input devices
    // the input is a store action: on change it sets the devices of every product in the block
    const inputFieldset = document.createElement('fieldset');
    inputFieldset.classList = 'd-flex';
    inputFieldset.innerHTML += '<button>-</button>';
    inputFieldset.innerHTML += '<label for="devicesInput" style="display: none;">Number of Devices</label>';
    inputFieldset.innerHTML += `<input type="text" name="devicesInput" min="${devicesMin}" max="${devicesMax}" value="${devicesSelected}" id="devicesInput"
      data-store-action data-store-set-type="devices" data-store-set-delta="0" data-store-set-min="${devicesMin}" data-store-set-max="${devicesMax}">`;
    inputFieldset.innerHTML += '<button>+</button>';
    // add fieldset
    const tableEl = parent1ndDiv.querySelector('table');
    tableEl?.before(inputFieldset);

    const devicesInput = block.querySelector('#devicesInput');

    const emElements = tableEl?.querySelectorAll('em');
    const deviceValues = [30, 150, 150];
    let tableElServers;
    let tableElMailboxes;
    let tableElMailboxes2;

    if (emElements) {
      tableElServers = emElements[0];
      tableElMailboxes = emElements[1];
      tableElMailboxes2 = emElements[2];

      // Update the elements
      updateTableElement(tableElServers, devicesSelected, deviceValues[0]);
      updateTableElement(tableElMailboxes, devicesSelected, deviceValues[1]);
      updateTableElement(tableElMailboxes2, devicesSelected, deviceValues[2]);
    }

    // click on buttons
    block.querySelectorAll('fieldset button').forEach((item) => {
      item.addEventListener('click', () => {
        const action = item.textContent;
        let currentdevices = Number(devicesInput.value);
        if (action === '-' && currentdevices > devicesMin) {
          currentdevices -= incrementalCounterValue;
          devicesInput.value = (currentdevices).toString();

          currentdevices = updateCurrentDevices(skipUnwantedSelectorsArray, currentdevices, incrementalCounterValue, devicesInput, action);
        }
        if (action === '+' && currentdevices < devicesMax) {
          currentdevices += incrementalCounterValue;
          devicesInput.value = (currentdevices).toString();

          currentdevices = updateCurrentDevices(skipUnwantedSelectorsArray, currentdevices, incrementalCounterValue, devicesInput, action);
        }

        // let the store action of the input pick up the new value
        devicesInput.dispatchEvent(new Event('change'));

        updateTableElement(tableElServers, currentdevices, 30);
        updateTableElement(tableElMailboxes, currentdevices, 150);
      });
    });

    // change directly input number: update the prices while typing, not only on blur
    devicesInput?.addEventListener('input', () => {
      devicesInput.dispatchEvent(new Event('change'));
    });

    /// ///////////////////////////////////////////////////////////////////////
    // create prices sections
    productsAsList.forEach((item, idx) => {
      const {
        productId, devices, subscription: prodYears, trialDuration,
      } = parseStoreProduct(item);

      const pricesDiv = document.createElement('div');

      pricesDiv.classList = 'prices_box await-loader';
      pricesDiv.setAttribute('data-testid', 'prod_box');
      if (bulinaText) {
        pricesDiv.innerHTML += `<div class="prod-percent green_bck_circle small has${bulinaText.split(',').length}txt" data-store-hide="${NO_DISCOUNT}" data-store-hide-type="visibility"><b class="percent" data-store-render data-store-discount="percentage"></b><p>${bulinaText.split(',')[1]}</p></div>`;
      }

      if (monthlyText) {
        const [monthlyText1, monthlyText2] = monthlyText.split(',');
        const monthlytext2updated = monthlyText1.replace('0', '<span data-store-render data-store-price="discounted-monthly||full-monthly"></span>');
        if (reverseMonthlyTextWithPrice) {
          pricesDiv.innerHTML += `<div class="blue-monthly-tag">
                                    <span style="color: white; font-size: 24px" class="prod-newprice" data-store-render data-store-price="discounted||full"></span>
                                    <p style="color: white;" class="prod-oldprice" data-store-hide="${NO_DISCOUNT}">${oldpriceText}
                                      <span data-store-render data-store-price="full"></span>
                                    </p>
                                    <p class="prod-save" data-store-hide="${NO_DISCOUNT}" data-store-hide-type="visibility">${savingText} <span data-store-render data-store-discount="value"></span></p>
                                  </div>`;
        } else {
          pricesDiv.innerHTML += `<div class="blue-monthly-tag"><strong>${monthlytext2updated}</strong> ${monthlyText2}</div>`;
        }
      }

      if (secondTemplate) {
        const selectorBox = document.createElement('div');
        selectorBox.classList.add('selector-box');

        if (yearsSelector && yearsSelector === 'fix') {
          const selectElement = document.createElement('p');
          selectElement.innerHTML = `${subscribeTexts} <i style="font-weight: bold; font-style: normal">${prodYears} ${prodYears > 1 ? yearsText : yearText}</i>`;
          selectorBox.appendChild(selectElement);
        } else {
          // store action: sets the subscription of this box's product
          const selectElement = document.createElement('select');
          selectElement.setAttribute('data-store-action', '');
          selectElement.innerHTML = `
            <option value="1" data-store-set-subscription="1">${subscribeTexts} <i style="font-weight: bold; font-style: normal">1 ${yearText}</i></option>
            <option value="2" data-store-set-subscription="2">${subscribeTexts} <i style="font-weight: bold; font-style: normal">2 ${yearsText}</i></option>
            <option value="3" data-store-set-subscription="3">${subscribeTexts} <i style="font-weight: bold; font-style: normal">3 ${yearsText}</i></option>
          `;
          selectElement.id = 'selectYears';
          selectorBox.appendChild(selectElement);
        }

        pricesDiv.appendChild(selectorBox);
      } else {
        pricesDiv.innerHTML += `<p class="border-bottom subscribe4">${subscribeTexts} <b class="${monthlyText ? 'd-inline' : ''}">${prodYears} ${prodYears > 1 ? yearsText : yearText}</b></p>`;
      }
      if (monthlyText && reverseMonthlyTextWithPrice) {
        const [monthlyText1, monthlyText2] = monthlyText.split(',');
        const monthlytext2updated = monthlyText1.replace('0', '<strong data-store-render data-store-price="discounted-monthly||full-monthly"></strong>');
        pricesDiv.innerHTML += `<div style="font-size: 20px;"><strong>${monthlytext2updated}</strong> ${monthlyText2}</div>`;
      } else {
        pricesDiv.innerHTML += '<span class="prod-newprice" data-store-render data-store-price="discounted||full"></span>';
        pricesDiv.innerHTML += `<p class="prod-oldprice" data-store-hide="${NO_DISCOUNT}">${oldpriceText} <span data-store-render data-store-price="full"></span></p>`;
        pricesDiv.innerHTML += `<p class="prod-save" data-store-hide="${NO_DISCOUNT}" data-store-hide-type="visibility">${savingText} <span data-store-render data-store-discount="value"></span></p>`;
      }

      pricesDiv.innerHTML += `<div class="buy_box buy_box${idx + 1}"><a class="red-buy-button await-loader" data-store-render data-store-buy-link="${trialDuration}" referrerpolicy="no-referrer-when-downgrade">${buylinkText}</a></div>`;
      pricesDiv.innerHTML += `<span class="prod-taxes">${taxesText}</span>`;

      parent2ndDiv.appendChild(pricesDiv);
      wrapChildrenWithProduct(pricesDiv, {
        productId, devices, subscription: prodYears, storeEvent: 'info',
      });

      /// ///////////////////////////////////////////////////////////////////////
      if (secondTemplate) {
        const rowDiv = block.querySelector('.b-productswithinputdevices > div:nth-child(1) > div');
        rowDiv.classList.add('row');
        const paragraphs = rowDiv.querySelectorAll('p');
        const table = rowDiv.querySelector('table');
        const columnDiv = document.createElement('div');
        columnDiv.classList.add('col-6');
        columnDiv.appendChild(paragraphs[0]);
        columnDiv.appendChild(paragraphs[1]);
        rowDiv.insertBefore(columnDiv, rowDiv.firstChild);
        const defaultContentWrapper = parentSelector.querySelector('.default-content-wrapper');
        parentSelector.removeChild(defaultContentWrapper);

        const breakDiv = document.createElement('b');
        table.before(breakDiv);
      }
    });

    // the devices input (first row) and the price boxes (second row) need a common store scope,
    // and the block's own children can't be wrapped without breaking its `> div` styles
    const storeContext = document.createElement('bd-context');
    block.before(storeContext);
    storeContext.append(block);
  }
}
