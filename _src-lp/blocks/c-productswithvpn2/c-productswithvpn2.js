/*
  Information:
  - displays 3 boxes positioned in flex mode:
    1. product 1
    2. product 2
    3. product 3

  MetaData:
  - background : ex: grey (background-color of full section)
  - products : ex: tsmd/5/1, is/3/1, av/3/1 (alias_name/nr_devices/nr_years)
  - bulina_text: ex: 0% OFF
                      discount

  Samples:
  - https://www.bitdefender.com/media/html/consumer/new/2020/cl-offer-opt/ - http://localhost:3000/consumer/en/new/cl-offer-opt
*/

import { productAliases } from '../../scripts/scripts.js';
import { updateProductsList, GLOBAL_EVENTS } from '../../scripts/utils.js';

export default function decorate(block) {
  /// ///////////////////////////////////////////////////////////////////////
  // get data attributes set in metaData
  const parentSelector = block.closest('.section');
  const metaData = parentSelector.dataset;
  const {
    products, bulinaText, upTo, userText, yearText,
  } = metaData;
  const productsAsList = products && products.split(',');

  if (productsAsList.length) {
    // check and add products into the final array
    productsAsList.forEach((prod) => updateProductsList(prod));

    // add VPN
    updateProductsList('vpn/10/1');

    /// ///////////////////////////////////////////////////////////////////////
    // set top class with numbers of products
    parentSelector.classList.add(`has${productsAsList.length}boxes`);

    /// ///////////////////////////////////////////////////////////////////////
    // ensure every product box starts with a <p> (image container)
    productsAsList.forEach((product, idx) => {
      const productDiv = block.querySelector(`.c-productswithvpn2 > div:nth-child(${idx + 1}) > div`);
      if (productDiv) {
        const firstP = productDiv.querySelector('p:first-child');

        // check if first <p> exists and has an <img>
        if (!firstP || !firstP.querySelector('picture')) {
          const emptyP = document.createElement('p');
          // optional: add a class for styling/debugging
          emptyP.className = 'empty-picture';
          // insert at the start of the product div
          productDiv.insertBefore(emptyP, productDiv.firstChild);
        }
      }
    });

    /// ///////////////////////////////////////////////////////////////////////
    // create prices sections
    productsAsList.forEach((product, idx) => {
      // eslint-disable-next-line prefer-const
      let [prodName, prodUsers, prodYears] = productsAsList[idx].split('/');
      prodName = prodName.trim();
      const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;

      // adding prices
      const pricesSections = block.querySelectorAll(`.c-productswithvpn2 > div:nth-child(${idx + 1}) table:first-of-type p`);
      block.querySelectorAll(`.c-productswithvpn2 > div:nth-child(${idx + 1}) table:first-of-type`).forEach((item) => {
        item.classList = `await-loader prodload prodload-${onSelectorClass}`;
      });
      // old price:
      pricesSections[0].innerHTML += `<span class='prod-oldprice oldprice-${onSelectorClass} newprod-hide'></span>`;
      // vpn:
      pricesSections[1].className = `show_vpn_box show_vpn-${onSelectorClass}`;
      pricesSections[1].style.display = 'none';
      pricesSections[1].innerHTML += '<i><span class="prod-oldprice oldprice-vpn-101"></span><span class="prod-newprice newprice-vpn-101"></span>';
      // new price:
      pricesSections[2].innerHTML += `<span class='prod-save save-${onSelectorClass} newprod-hide'></span>`;
      // total:
      pricesSections[3].innerHTML += `<span class='prod-newprice newprice-${onSelectorClass}'></span>`;

      // create procent - bulina
      if (typeof bulinaText !== 'undefined') {
        const bulinaSplitted = bulinaText.split(',');
        const divBulina = document.createElement('div');
        divBulina.className = `prod-percent green_bck_circle medium bulina-${onSelectorClass} bulina_visible has${bulinaSplitted.length}txt`;

        bulinaSplitted.forEach((item, key) => {
          const newItem = item;
          if (item.indexOf('0%') !== -1) {
            const span = document.createElement('span');
            span.className = `bulina_text${key + 1}`;

            // split text around 0% and insert a <b>
            const parts = item.split('0%');
            span.append(document.createTextNode(parts[0]));
            const bold = document.createElement('b');
            bold.className = `percent percent-${onSelectorClass}`;
            span.append(bold);
            if (parts[1]) span.append(document.createTextNode(parts[1]));

            divBulina.appendChild(span);
          } else {
            const span = document.createElement('span');
            span.className = `bulina_text${key + 1}`;
            span.textContent = newItem;
            divBulina.appendChild(span);
          }
        });

        const element = block.querySelector(`.c-productswithvpn2 > div:nth-child(${idx + 1}) p:nth-child(1)`);

        if (element) {
          element.appendChild(divBulina); // safer than innerHTML
        }
      }

      /// ///////////////////////////////////////////////////////////////////////
      // add buybtn div & anchor
      const tableBuybtn = block.querySelector(`.c-productswithvpn2 > div:nth-child(${idx + 1}) table:nth-of-type(2) td`);
      tableBuybtn.innerHTML = `<div class="buy_box buy_box${idx + 1}"><a href='#' title='Bitdefender ${onSelectorClass}' class='red-buy-button await-loader prodload prodload-${onSelectorClass} buylink-${onSelectorClass}' referrerpolicy="no-referrer-when-downgrade">${tableBuybtn.innerText}</a></div>`;

      /// ///////////////////////////////////////////////////////////////////////
      // adding vpn input checkbox
      const tableVpn = block.querySelector(`.c-productswithvpn2 > div:nth-child(${idx + 1}) table:nth-of-type(3)`);
      if (tableVpn.innerText.indexOf('0') !== -1) {
        const vpnPrices = '<b><span class="prod-oldprice oldprice-vpn-101">$0</span><span class="prod-newprice newprice-vpn-101">$0</span></b>';
        const vpnDiv = document.createElement('div');
        vpnDiv.classList = `vpn_box await-loader prodload prodload-${onSelectorClass}`;

        let labelId = `checkboxVPN-${onSelectorClass}`;
        if (document.getElementById(labelId)) {
          labelId = `${labelId}-1`;
        }

        let vpnContent = `<input id='${labelId}' class='${labelId} checkboxVPN' type='checkbox' value=''>`;
        vpnContent += `<label for='${labelId}'>${tableVpn.querySelector('td').innerHTML.replace(/0/g, vpnPrices)}</label>`;

        vpnDiv.innerHTML = vpnContent;

        tableVpn.before(vpnDiv);
      } else {
        tableVpn.before(document.createElement('hr'));
      }

      tableVpn.remove();

      // add prod class on block
      const priceBoxSelector = block.querySelector(`.c-productswithvpn2 > div:nth-child(${idx + 1})`);
      priceBoxSelector.classList.add(`${onSelectorClass}_box`, 'prod_box');
      priceBoxSelector.setAttribute('data-testid', 'prod_box');

      // const prodDescription = block.querySelector(`.${prodName}-${prodUsers}${prodYears}_box > div > p:nth-child(4)`);
      // prodDescription.classList.add(`${prodName}_description`);

      if (userText && yearText) {
        document.addEventListener(GLOBAL_EVENTS.PAGE_LOADED, () => {
          const users = StoreProducts.product[prodName].selected_users;
          const years = StoreProducts.product[prodName].selected_years;
          const textUser = userText.split(',');
          const textYear = yearText.split(',');
          let upText = '';
          let devicesText = '';
          let yearsText = '';
          if (users !== '1') {
            upText = `${upTo}`;
            devicesText = `${textUser[1]}`;
          } else {
            devicesText = `${textUser[0]}`;
          }
          if (years !== '1') {
            yearsText = `${textYear[1]}`;
          } else {
            yearsText = `${textYear[0]}`;
          }
          const devicesDesc = block.querySelector(`.${prodName}_description`);
          if (devicesDesc) devicesDesc.innerHTML = `${upText} ${users} ${devicesText} / ${years} ${yearsText}`;
        });
      }
    });
  }
}
