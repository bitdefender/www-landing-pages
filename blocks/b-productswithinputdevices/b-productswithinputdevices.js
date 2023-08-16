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

export default function decorate(block) {
  /// ///////////////////////////////////////////////////////////////////////
  // get data attributes set in metaData
  const parentSelector = block.closest('.section');
  const parent2ndDiv = block.querySelector('.b-productswithinputdevices > div:nth-child(2)');

  const metaData = parentSelector.dataset;
  const {
    products, yearsText, bulinaText, titleTag,
  } = metaData;
  const productsAsList = products && products.split(',');

  const subscribeTexts = parent2ndDiv.querySelector('div p').innerText;
  const yearText = parent2ndDiv.querySelector('div p:nth-child(2)').innerText;
  const oldpriceText = parent2ndDiv.querySelector('div p:nth-child(3)').innerText;
  const savingText = parent2ndDiv.querySelector('div p:nth-child(4)').innerText;
  const buylinkText = parent2ndDiv.querySelector('div p:nth-child(5)').innerText;
  const taxesText = parent2ndDiv.querySelector('div p:nth-child(6)').innerText;

  const blockH3 = block.querySelector('h3');
  if (blockH3 && titleTag) {
    const spanTag = document.createElement('span');
    spanTag.className = 'greenTag';
    spanTag.innerText = titleTag;
    blockH3.appendChild(spanTag);
  }

  console.log(bulinaText)
  if (bulinaText) {
    const bulinaSplitted = bulinaText.split(',');
    const divBulina = document.createElement('div');
    divBulina.className = 'prod-percent green_bck_circle bigger has2txt';
    divBulina.innerHTML = `${bulinaSplitted[0].replace(/0/g, '<b class=\'max-discount\'></b>')} ${bulinaSplitted[1]}`;

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
    inputFieldset.innerHTML += '<input type="number" name="devicesInput" min=5" max="100" value="10" id="devicesInput">';
    inputFieldset.innerHTML += '<button>+</button>';
    // add fieldset
    const tableEl = block.querySelector('.b-productswithinputdevices > div:nth-child(1) table');
    tableEl.before(inputFieldset);

    // add event listeners
    const devicesInput = document.getElementById('devicesInput');
    const prodiId = productAliases(productsAsList[0].split('/')[0]);

    block.querySelectorAll('fieldset button').forEach((item) => {
      item.addEventListener('click', () => {
        const action = item.innerText;
        let currentdevices = Number(devicesInput.value);
        if (action === '-' && currentdevices > 5) {
          currentdevices -= 1;
          devicesInput.value = (currentdevices).toString();
        }
        if (action === '+' && currentdevices < 100) {
          currentdevices += 1;
          devicesInput.value = (currentdevices).toString();
        }

        // trigger selectior
        const devicesSelector = document.querySelectorAll(`.users_${prodiId}`);
        if (devicesSelector) {
          devicesSelector.forEach((selector) => {
            selector.value = devicesInput.value;
            selector.dispatchEvent(new Event('change'));
          });
        }

        const tableElServers = tableEl.querySelector('strong:nth-child(1) em');
        if (tableElServers) {
          tableElServers.innerText = Math.ceil((currentdevices / 100) * 35);
        }
        const tableElMailboxes = tableEl.querySelector('strong:nth-child(3) em');
        if (tableElMailboxes) {
          tableElMailboxes.innerText = Math.ceil((currentdevices / 100) * 150);
        }
      });
    });

    if (devicesInput.addEventListener('change', () => {
      const devicesSelector = document.querySelectorAll(`.users_${prodiId}`);
      if (devicesSelector) {
        devicesSelector.forEach((item) => {
          item.value = devicesInput.value;
          item.dispatchEvent(new Event('change'));
        });
      }
    }));

    /// ///////////////////////////////////////////////////////////////////////
    // create prices sections
    productsAsList.forEach((item, idx) => {
      const [prodName, prodUsers, prodYears] = productsAsList[idx].split('/');
      const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;

      const pricesDiv = document.createElement('div');

      pricesDiv.classList = 'prices_box awaitLoader prodLoad';
      pricesDiv.setAttribute('data-testid', 'prod_box');
      pricesDiv.innerHTML += `<p class="">${subscribeTexts}</p>`;
      pricesDiv.innerHTML += `<b class="">${prodYears} ${prodYears > 1 ? yearsText : yearText}</b>`;
      pricesDiv.innerHTML += `<span class="prod-newprice newprice-${onSelectorClass}"></span>`;
      pricesDiv.innerHTML += `<p class="prod-oldprice d-flex justify-content-center align-items-center">${oldpriceText} <span class="oldprice-${onSelectorClass}"></span></p>`;
      pricesDiv.innerHTML += `<p class="prod-save d-flex justify-content-center align-items-center">${savingText} <span class="save-${onSelectorClass}"></span></p>`;
      pricesDiv.innerHTML += `<p class="percent percent-${onSelectorClass}" style="display: none;"></p>`;
      pricesDiv.innerHTML += `<a class="red-buy-button buylink-${onSelectorClass}">${buylinkText}</a>`;
      pricesDiv.innerHTML += `<span class="prod-taxes">${taxesText}</span>`;

      parent2ndDiv.appendChild(pricesDiv);
    });
  }
}
