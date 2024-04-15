/*
  Information:
  - displays:
  - top text
  - input for devices with - + controllers
  and
  - 3 boxes positioned in flex mode:
    1. product 1
    2. product 2
    3. product 3

  MetaData:
  - products : ex: tsmd/5/1, is/3/1, av/3/1 (alias_name/nr_devices/nr_years)

  Samples:
  - https://www.bitdefender.com/media/html/business/cross-sell-2023-mobile-launch/existing.html?pid=cross-sell-30off - http://localhost:3000/business/en/cross-sell-2023-mobile-launch
*/

import { productAliases } from '../../scripts/scripts.js';
import { updateProductsList } from '../../scripts/utils.js';

/**
 * Update table element
 * @param {HTMLElement} tableElement
 * @param {number} currentdevices
 * @param {number} multiplier
 * @returns {void}
 */
function updateTableElement(tableElement, currentdevices, multiplier) {
  if (tableElement) {
    tableElement.innerText = Math.ceil((currentdevices / 100) * multiplier);
  }
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
  // const parent2ndDiv = block.querySelector('.b-productswithinputdevices > div:nth-child(2)');
  const parent1ndDiv = block.children[0];
  const parent2ndDiv = block.children[1];

  const metaData = parentSelector.dataset;
  const {
    products, yearsText, bulinaText, devicesLimits, yearsSelector, incrementalCounter, titleTag,
    skipUnwantedSelectors, secondTemplate,
  } = metaData;
  const productsAsList = products && products.split(',');

  const subscribeTexts = parent2ndDiv.querySelector('p').innerText;
  const yearText = parent2ndDiv.querySelector('p:nth-child(2)').innerText;
  const oldpriceText = parent2ndDiv.querySelector('p:nth-child(3)').innerText;
  const savingText = parent2ndDiv.querySelector('p:nth-child(4)').innerText;
  const buylinkText = parent2ndDiv.querySelector('p:nth-child(5)').innerText;
  const taxesText = parent2ndDiv.querySelector('p:nth-child(6)').innerText;

  let devicesMin = 5;
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

  if (productsAsList.length) {
    /// ///////////////////////////////////////////////////////////////////////
    // check and add products into the final array
    productsAsList.forEach((prod) => updateProductsList(prod));

    /// ///////////////////////////////////////////////////////////////////////
    // adding input devices
    const inputFieldset = document.createElement('fieldset');
    inputFieldset.classList = 'd-flex';
    inputFieldset.innerHTML += '<button>-</button>';
    inputFieldset.innerHTML += '<label for="devicesInput" style="display: none;">Number of Devices</label>';
    inputFieldset.innerHTML += `<input type="text" readonly name="devicesInput" min=${devicesMin}" max="${devicesMax}" value="${devicesSelected}" id="devicesInput">`;
    inputFieldset.innerHTML += '<button>+</button>';
    // add fieldset
    const tableEl = parent1ndDiv.querySelector('table');
    tableEl.before(inputFieldset);

    // add event listeners
    const devicesInput = document.getElementById('devicesInput');
    const prodiId = productAliases(productsAsList[0].split('/')[0]);

    const tableElServers = tableEl.querySelector('strong:nth-child(1) em');
    updateTableElement(tableElServers, devicesSelected, 30);

    const tableElMailboxes = tableEl.querySelector('strong:nth-child(2) em');
    updateTableElement(tableElMailboxes, devicesSelected, 150);

    const tableElMailboxes2 = tableEl.querySelector('strong:nth-child(3) em');
    updateTableElement(tableElMailboxes2, devicesSelected, 150);

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

        // trigger selector
        const devicesSelector = document.querySelectorAll(`.users_${prodiId}`);
        if (devicesSelector) {
          devicesSelector.forEach((selector) => {
            selector.value = devicesInput.value;
            selector.dispatchEvent(new Event('change'));
          });
        }

        updateTableElement(tableElServers, currentdevices, 30);
        updateTableElement(tableElMailboxes, currentdevices, 150);
      });
    });

    /// ///////////////////////////////////////////////////////////////////////
    // create prices sections
    productsAsList.forEach((item, idx) => {
      const [prodName, prodUsers, prodYears] = productsAsList[idx].split('/');
      const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;

      const pricesDiv = document.createElement('div');

      pricesDiv.classList = `prices_box await-loader prodload prodload-${onSelectorClass}`;
      pricesDiv.setAttribute('data-testid', 'prod_box');
      if (bulinaText) {
        pricesDiv.innerHTML += `<div class="prod-percent green_bck_circle small has${bulinaText.split(',').length}txt"><b class="percent percent-${onSelectorClass}">10%</b><p>${bulinaText.split(',')[1]}</p></div>`;
      }

      if (secondTemplate) {
        const selectorBox = document.createElement('div');
        selectorBox.classList.add('selector-box');

        if (yearsSelector && yearsSelector === 'fix') {
          const selectElement = document.createElement('p');
          selectElement.innerHTML = `${subscribeTexts} <i style="font-weight: bold; font-style: normal">${prodYears} ${prodYears > 1 ? yearsText : yearText}</i>`;
          selectorBox.appendChild(selectElement);
        } else {
          const selectElement = document.createElement('select');
          selectElement.innerHTML = `
            <option value="1">${subscribeTexts} <i style="font-weight: bold; font-style: normal">1 ${yearText}</i></option>
            <option value="2">${subscribeTexts} <i style="font-weight: bold; font-style: normal">2 ${yearsText}</i></option>
            <option value="3">${subscribeTexts} <i style="font-weight: bold; font-style: normal">3 ${yearsText}</i></option>
          `;
          selectElement.id = 'selectYears';
          selectorBox.appendChild(selectElement);

          // Add an event listener for the 'change' event
          selectElement.addEventListener('change', (event) => {
            const triggerValue = event.target.value;
            if (document.querySelector(`.years_${onSelectorClass}_fake`)) {
              const fakeSelector = document.querySelector(`.years_${onSelectorClass}_fake`);
              fakeSelector.value = triggerValue;
              fakeSelector.dispatchEvent(new Event('change'));
            }
          });
        }

        pricesDiv.appendChild(selectorBox);
      } else {
        pricesDiv.innerHTML += `<p class="">${subscribeTexts}</p>`;
        pricesDiv.innerHTML += `<b class="">${prodYears} ${prodYears > 1 ? yearsText : yearText}</b>`;
      }
      pricesDiv.innerHTML += `<span class="prod-newprice newprice-${onSelectorClass}"></span>`;
      pricesDiv.innerHTML += `<p class="prod-oldprice d-flex justify-content-center align-items-center">${oldpriceText} <span class="oldprice-${onSelectorClass}"></span></p>`;
      pricesDiv.innerHTML += `<p class="prod-save d-flex justify-content-center align-items-center">${savingText} <span class="save-${onSelectorClass}"></span></p>`;
      pricesDiv.innerHTML += `<p class="percent percent-${onSelectorClass}" style="display: none;"></p>`;
      pricesDiv.innerHTML += `<div class="buy_box buy_box${idx + 1}"><a class="red-buy-button buylink-${onSelectorClass} await-loader prodload prodload-${onSelectorClass}" referrerpolicy="no-referrer-when-downgrade">${buylinkText}</a></div>`;
      pricesDiv.innerHTML += `<span class="prod-taxes">${taxesText}</span>`;

      parent2ndDiv.appendChild(pricesDiv);

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

        const selectElement = block.querySelector('#selectYears');
        selectElement.addEventListener('change', (event) => {
          const triggerValue = event.target.value;
          if (document.querySelector(`.years_${onSelectorClass}_fake`)) {
            const fakeSelector = document.querySelector(`.years_${onSelectorClass}_fake`);
            fakeSelector.value = triggerValue;
            fakeSelector.dispatchEvent(new Event('change'));
          }
        });
      }
    });
  }
}
