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
  const parent2ndDiv = block.querySelector(".b-productswithinputdevices > div:nth-child(2)");
  
  const metaData = parentSelector.dataset;
  const { products, yearsText } = metaData;
  const productsAsList = products && products.split(',');

  const subscribeTexts = parent2ndDiv.querySelector('div p').innerText;
  const yearText = parent2ndDiv.querySelector('div p:nth-child(2)').innerText;
  const oldpriceText = parent2ndDiv.querySelector('div p:nth-child(3)').innerText;
  const savingText = parent2ndDiv.querySelector('div p:nth-child(4)').innerText;
  const buylinkText = parent2ndDiv.querySelector('div p:nth-child(5)').innerText;
  const taxesText = parent2ndDiv.querySelector('div p:nth-child(6)').innerText;

  if (productsAsList.length) {
    /// ///////////////////////////////////////////////////////////////////////
    // check and add products into the final array
    productsAsList.forEach((prod) => updateProductsList(prod));

    /// ///////////////////////////////////////////////////////////////////////
    // adding input devices
    const inputFieldset = document.createElement('fieldset');
    inputFieldset.classList = 'd-flex';
    inputFieldset.innerHTML += `<button>-</button>`;
    inputFieldset.innerHTML += `<input type='number' name='devicesInput' min='5' max='100' value='10' id='devicesInput'>`;
    inputFieldset.innerHTML += `<button>+</button>`;
    // add fieldset
    block.querySelector(".b-productswithinputdevices > div:nth-child(1) > div").after(inputFieldset);

    // add event listeners
    const devicesInput = document.getElementById('devicesInput');
    const prodiId = productsAsList[0].split('/')[0];
    
    block.querySelectorAll("fieldset button").forEach((item) => {
      item.addEventListener('click', () => {
        const action = item.innerText;
        let currentdevices = Number(devicesInput.value);
        if (action === '-' && currentdevices > 5) {
          devicesInput.value = (--currentdevices).toString();
        }
        if (action === '+' && currentdevices < 100) {
          devicesInput.value = (++currentdevices).toString();
        }

        const devicesSelector = document.querySelectorAll(`.users_${prodiId}`);
        if (devicesSelector) {
          devicesSelector.forEach((selector) => {
            selector.value = devicesInput.value;
            selector.dispatchEvent(new Event('change'));
          })
        }
      });
    });

    if (devicesInput.addEventListener('change', () => {
      const devicesSelector = document.querySelectorAll(`.users_${prodiId}`);
      if (devicesSelector) {
        devicesSelector.forEach((item) => {
          item.value = devicesInput.value;
          item.dispatchEvent(new Event('change'));
        })
      }
    }));

    //document.querySelector(`.users_bsm`).selectedIndex = '14';
    //document.querySelector(`.users_bsm`).dispatchEvent(new Event('change'));


    /// ///////////////////////////////////////////////////////////////////////
    // create prices sections
    productsAsList.forEach((item, idx) => {
      const prodSplit = productsAsList[idx].split('/');
      const [prodName, prodUsers, prodYears] = [productAliases(prodSplit[0]), prodSplit[1], prodSplit[2]];
      const onSelectorClass = `${prodName}-${prodUsers}${prodYears}`;
      const pricesDiv = document.createElement('div');

      pricesDiv.classList = 'prices_box awaitLoader prodLoad';
      pricesDiv.innerHTML += `<p class="">${subscribeTexts}</p>`;
      pricesDiv.innerHTML += `<b class="">${prodYears} ${prodYears > 1 ? yearsText : yearText}</b>`;
      pricesDiv.innerHTML += `<span class="prod-newprice newprice-${onSelectorClass}"></span>`;
      pricesDiv.innerHTML += `<p class="prod-oldprice d-flex justify-content-center align-items-center">${oldpriceText} <span class="oldprice-${onSelectorClass}"></span></p>`;
      pricesDiv.innerHTML += `<p class="prod-save d-flex justify-content-center align-items-center">${savingText} <span class="save-${onSelectorClass}"></span></p>`;
      pricesDiv.innerHTML += `<a class="red-buy-button buylink-${onSelectorClass}">${buylinkText}</a>`;
      pricesDiv.innerHTML += `<span class="prod-taxes">${taxesText}</span>`;

      parent2ndDiv.appendChild(pricesDiv);
    });
  }
}
