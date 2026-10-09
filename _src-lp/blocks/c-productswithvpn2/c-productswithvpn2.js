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

import { matchHeights, parseStoreProduct, wrapChildrenWithStoreContext } from '../../scripts/utils.js';

// the VPN that can be added as a bundle to each product box
const VPN_BUNDLE = { productId: 'vpn', devices: '10', subscription: '1' };

export default function decorate(block) {
  /// ///////////////////////////////////////////////////////////////////////
  // get data attributes set in metaData
  const parentSelector = block.closest('.section');
  const metaData = parentSelector.dataset;
  const { products, bulinaText } = metaData;
  const productsAsList = products && products.split(',');

  if (productsAsList.length) {
    /// ///////////////////////////////////////////////////////////////////////
    // set top class with numbers of products
    parentSelector.classList.add(`has${productsAsList.length}boxes`);

    /// ///////////////////////////////////////////////////////////////////////
    // create prices sections
    productsAsList.forEach((product, idx) => {
      const storeProduct = parseStoreProduct(productsAsList[idx]);
      const {
        productId, devices, subscription, trialDuration,
      } = storeProduct;
      const onSelectorClass = `${productId}-${devices}${subscription}`;
      // the column holding the box content, the store scope of this product box
      const boxContent = block.querySelector(`.c-productswithvpn2 > div:nth-child(${idx + 1}) > div`);

      // adding prices
      const pricesSections = block.querySelectorAll(`.c-productswithvpn2 > div:nth-child(${idx + 1}) table:first-of-type p`);
      block.querySelectorAll(`.c-productswithvpn2 > div:nth-child(${idx + 1}) table:first-of-type`).forEach((item) => {
        item.classList = 'await-loader prices_table';
      });
      // old price:
      pricesSections[0].innerHTML += "<span class='prod-oldprice' data-store-render data-store-price='full'></span>";
      pricesSections[0].setAttribute('data-store-render', '');
      pricesSections[0].setAttribute('data-store-hide', '!it.option.price.discounted');
      // vpn, shown while the VPN bundle is checked:
      const showVpnBox = pricesSections[1];
      showVpnBox.className = 'show_vpn_box';
      showVpnBox.style.display = 'none';
      showVpnBox.innerHTML += '<i><span class="prod-oldprice" data-store-render data-store-price="full" data-store-hide="!it.option.price.discounted"></span><span class="prod-newprice" data-store-render data-store-price="discounted||full"></span>';
      wrapChildrenWithStoreContext(showVpnBox.querySelector('i'), { ...VPN_BUNDLE, storeEvent: '' });
      // new price:
      pricesSections[2].innerHTML += "<span class='prod-save' data-store-render data-store-discount='value'></span>";
      pricesSections[2].setAttribute('data-store-render', '');
      pricesSections[2].setAttribute('data-store-hide', '!it.option.price.discounted');
      // total:
      pricesSections[3].innerHTML += "<span class='prod-newprice' data-store-render data-store-price='discounted||full'></span>";

      // create procent - bulina
      if (typeof bulinaText !== 'undefined') {
        const bulinaSplitted = bulinaText.split(',');
        // hidden until the store shows it, only when the product has a discount
        let divBulina = `<div class="prod-percent green_bck_circle medium has${bulinaSplitted.length}txt" style="visibility: hidden" data-store-render data-store-hide="!it.option.price.discounted" data-store-hide-type="visibility">`;
        bulinaSplitted.forEach((item, key) => {
          let newItem = item;
          if (item.indexOf('0%') !== -1) {
            newItem = item.replace(/0%/g, "<b class='percent' data-store-render data-store-discount='percentage'></b>");
          }
          divBulina += `<span class="bulina_text${key + 1}">${newItem}</span>`;
        });
        divBulina += '</div>';

        // add to the previous element
        block.querySelector(`.c-productswithvpn2 > div:nth-child(${idx + 1}) p:nth-child(1)`).innerHTML += divBulina;
      }

      /// ///////////////////////////////////////////////////////////////////////
      // add buybtn div & anchor
      const tableBuybtn = block.querySelector(`.c-productswithvpn2 > div:nth-child(${idx + 1}) table:nth-of-type(2) td`);
      tableBuybtn.innerHTML = `<div class="buy_box buy_box${idx + 1}"><a href='#' title='Bitdefender ${onSelectorClass}' class='red-buy-button await-loader' data-store-render data-store-buy-link='${trialDuration}' referrerpolicy="no-referrer-when-downgrade">${tableBuybtn.innerText}</a></div>`;

      /// ///////////////////////////////////////////////////////////////////////
      // adding vpn input checkbox
      const tableVpn = block.querySelector(`.c-productswithvpn2 > div:nth-child(${idx + 1}) table:nth-of-type(3)`);
      if (tableVpn.innerText.indexOf('0') !== -1) {
        const vpnPrices = '<b><span class="prod-oldprice" data-store-render data-store-price="full" data-store-hide="!it.option.price.discounted"></span><span class="prod-newprice" data-store-render data-store-price="discounted||full"></span></b>';
        const vpnDiv = document.createElement('div');
        vpnDiv.classList = 'vpn_box await-loader';

        let labelId = `checkboxVPN-${onSelectorClass}`;
        if (document.getElementById(labelId)) {
          labelId = `${labelId}-1`;
        }

        if (tableVpn.querySelector('td')?.innerText) {
          // checking it adds the VPN as a bundle to this box: prices and buy link become the bundle's
          let vpnContent = `<input id='${labelId}' type='checkbox' value='' data-store-action data-store-set-bundle data-store-set-id='${VPN_BUNDLE.productId}' data-store-set-devices='${VPN_BUNDLE.devices}' data-store-set-subscription='${VPN_BUNDLE.subscription}'>`;
          vpnContent += `<label for='${labelId}'>${tableVpn.querySelector('td').innerHTML.replace(/0/g, vpnPrices)}</label>`;

          vpnDiv.innerHTML = vpnContent;
          // the label shows the prices of the VPN alone
          wrapChildrenWithStoreContext(vpnDiv.querySelector('label'), { ...VPN_BUNDLE, storeEvent: '' });
          vpnDiv.querySelector('input').addEventListener('change', (e) => {
            showVpnBox.style.display = e.target.checked ? 'block' : 'none';
          });

          tableVpn.before(vpnDiv);
        }
      } else {
        tableVpn.before(document.createElement('hr'));
      }

      tableVpn.remove();

      // add prod class on block
      const priceBoxSelector = block.querySelector(`.c-productswithvpn2 > div:nth-child(${idx + 1})`);
      priceBoxSelector.classList.add(`${onSelectorClass}_box`, 'prod_box');
      priceBoxSelector.setAttribute('data-testid', 'prod_box');

      // each product box gets its own store scope (prices, buy link and VPN bundle)
      if (productId) {
        wrapChildrenWithStoreContext(boxContent, {
          productId, devices, subscription, storeEvent: 'info',
        });
      }
    });
  }

  matchHeights(block, 'table.prices_table tbody');
}
