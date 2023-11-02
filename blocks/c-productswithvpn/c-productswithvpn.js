/*
  Information:
  - displays 3 boxes positioned in flex mode:
    1. product 1
    2. product 2
    3. product 3

  MetaData:
  - background : ex: grey (background-color of full section)
  - products : ex: tsmd/5/1, is/3/1, av/3/1 (alias_name/nr_devices/nr_years)
  - tag_text: ex: BEST BANG FOR YOUR BUCK!
  - tag_text2: ex: PREMIUM SECURITY AND PRIVACY PACK
  - tag_text3: ex: BEST BANG FOR YOUR BUCK!
  - bulina_text: ex: UP TO
                        0% OFF
                      SALE TODAY
  - border_color: ex: #f00
  - list_style: ex: checkmark_solid-circle

  Samples:
  - https://www.bitdefender.com/media/html/consumer/new/2020/cl-offer1-opt/last-offer.html - http://localhost:3000/consumer/en/new/last-offer
  - https://www.bitdefender.com/media/html/consumer/new/2020/cl-offer1-opt/ultimate-flv1.html - http://localhost:3000/consumer/en/new/ultimate-flv1
*/

import { productAliases } from '../../scripts/scripts.js';
import { updateProductsList } from '../../scripts/utils.js';

export default function decorate(block) {
  /// ///////////////////////////////////////////////////////////////////////
  // get data attributes set in metaData
  const parentSelector = block.closest('.section');
  const metaData = parentSelector.dataset;
  const {
    title,
    subtitle,
    titlePosition,
    marginTop,
    products,
    bulinaText,
    borderColor,
    listStyle,
    skipZuoraFor,
    noBorder,
  } = metaData;
  const productsAsList = products && products.split(',');

  if (!window.skipZuoraFor) {
    window.skipZuoraFor = skipZuoraFor.split(',');
  }

  if (productsAsList.length) {
    if (marginTop) {
      block.style.marginTop = marginTop;
    }

    /// ///////////////////////////////////////////////////////////////////////
    // set the title
    if (typeof title !== 'undefined') {
      const divTagTitle = document.createElement('div');
      divTagTitle.classList = `top_title ${typeof titlePosition !== 'undefined' ? `p_${titlePosition}` : ''}`;

      // adding title
      divTagTitle.innerHTML = document.querySelectorAll('h1').length === 0 ? `<h1>${title}</h1>` : `<h2>${title}</h2>`;

      // adding subtitle
      if (typeof subtitle !== 'undefined') {
        divTagTitle.innerHTML += `<h2>${subtitle}</h2>`;
      }

      block.parentNode.prepend(divTagTitle);
    }

    /// ///////////////////////////////////////////////////////////////////////
    // check and add products into the final array
    productsAsList.forEach((prod) => updateProductsList(prod));

    // add VPN
    updateProductsList('vpn/10/1');

    /// ///////////////////////////////////////////////////////////////////////
    // set top class with numbers of products
    parentSelector.classList.add(`has${productsAsList.length}boxes`);

    /// ///////////////////////////////////////////////////////////////////////
    // create procent - bulina
    if (typeof bulinaText !== 'undefined') {
      const bulinaSplitted = bulinaText.split(',');
      let divBulina = `<div class='prod-percent green_bck_circle bigger has${bulinaSplitted.length}txt'>`;
      bulinaSplitted.forEach((item, idx) => {
        let newItem = item;
        if (item.indexOf('0%') !== -1) {
          newItem = item.replace(/0%/g, '<b class=\'max-discount\'></b>');
        }
        divBulina += `<span class='bulina_text${idx + 1}'>${newItem}</span>`;
      });
      divBulina += '</div>';

      // add to the previous element
      if (block.parentNode.querySelector('.top_title')) {
        block.parentNode.querySelector('.top_title').innerHTML += divBulina;
      } else {
        block.parentNode.parentNode.previousElementSibling.innerHTML += divBulina;
      }
    }

    /// ///////////////////////////////////////////////////////////////////////
    // create prices sections
    productsAsList.forEach((item, idx) => {
      const [prodName, prodUsers, prodYears] = productsAsList[idx].split('/');
      const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;
      const percent = 0;

      const pricesDiv = document.createElement('div');
      pricesDiv.classList = `prices_box await-loader prodload prodload-${onSelectorClass}`;

      // if has harcoded prices
      const tablePriceBox = block.querySelector(`.c-productswithvpn > div:nth-child(${idx + 1}) table`);
      const tablePriceTexts = tablePriceBox.querySelectorAll('p');
      if (tablePriceTexts.length > 0) {
        tablePriceBox.className = 'prices_box';
        tablePriceTexts[0].className = 'prod-oldprice oldprice-custom';
        tablePriceTexts[1].className = 'prod-newprice newprice-custom';
      } else {
        pricesDiv.innerHTML += `<span class="prod-oldprice oldprice-${onSelectorClass}"></span>`;
        pricesDiv.innerHTML += `<span class="prod-newprice newprice-${onSelectorClass}"></span>`;
      }

      block.querySelector(`.c-productswithvpn > div:nth-child(${idx + 1}) table`).after(pricesDiv);

      /// ///////////////////////////////////////////////////////////////////////
      // adding top tag to each box
      let tagTextKey = `tagText${idx}`;
      if (idx === 0) {
        tagTextKey = 'tagText';
      }
      if (metaData[tagTextKey]) {
        const divTag = document.createElement('div');
        divTag.innerText = metaData[tagTextKey];
        divTag.className = 'tag';
        block.querySelector(`.c-productswithvpn > div:nth-child(${idx + 1}) p:nth-child(1)`).before(divTag);
      }

      /// ///////////////////////////////////////////////////////////////////////
      // add buybtn div & anchor
      const tableVpn = block.querySelector(`.c-productswithvpn > div:nth-child(${idx + 1}) table:nth-of-type(2)`);
      const tableBuybtn = block.querySelector(`.c-productswithvpn > div:nth-child(${idx + 1}) table:nth-of-type(3) td`);
      const tableBuybtnHref = tableBuybtn.querySelector('a');
      const aBuybtn = document.createElement('a');

      // if already has a link attached
      if (tableBuybtnHref) {
        aBuybtn.innerHTML = tableBuybtnHref.innerHTML.replace(/0%/g, `<span class="percent percent-${percent ? '' : onSelectorClass}">${percent}</span>`);
        aBuybtn.className = 'red-buy-button buylink-custom';
        aBuybtn.href = tableBuybtnHref.href;
      } else {
        aBuybtn.className = `red-buy-button buylink-${onSelectorClass} await-loader prodload prodload-${onSelectorClass}`;
        aBuybtn.innerHTML = tableBuybtn.innerHTML.replace(/0%/g, `<span class="percent percent-${percent ? '' : onSelectorClass}">${percent}</span>`);
      }

      aBuybtn.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      aBuybtn.setAttribute('title', 'Buy Now Bitdefender');

      const divBuybtn = document.createElement('div');
      divBuybtn.classList.add('buybtn_box', 'buy_box', `buy_box${idx + 1}`);

      tableVpn.after(divBuybtn);
      divBuybtn.appendChild(aBuybtn);

      // removing last table
      block.querySelector(`.c-productswithvpn > div:nth-child(${idx + 1}) table:last-of-type`).remove();

      /// ///////////////////////////////////////////////////////////////////////
      let hasVPN = false;
      if (tableVpn.innerText.indexOf('X') !== -1 && tableVpn.innerText.indexOf('Y') !== -1 && tableVpn.innerText.indexOf('Z') !== -1 && productsAsList.length !== 1) {
        hasVPN = true;
      }

      // adding input vpn
      if (hasVPN) { // has VPN
        // table_vpn.className = 'vpn_box'
        // replace in vpn box
        const replaceData = {
          X: '<span class="newprice-vpn-101"></span>',
          Y: '<span class="oldprice-vpn-101"></span>',
          Z: '<span class="percent-vpn-101"></span>',
        };

        let labelId = `checkboxVPN-${onSelectorClass}`;
        if (document.getElementById(labelId)) {
          labelId = `${labelId}-1`;
        }
        let vpnContent = `<input id="${labelId}" class="${labelId} checkboxVPN" type="checkbox" value="">`;
        vpnContent += `<label for="${labelId}">`;
        tableVpn.querySelectorAll('td').forEach((td) => {
          vpnContent += `<span>${td.innerHTML.replace(/[XYZ]/g, (m) => replaceData[m])}</span>`;
        });
        vpnContent += '</label>';

        const vpnBox = document.createElement('div');
        vpnBox.classList = `vpn_box await-loader prodload prodload-${onSelectorClass} ${tableBuybtnHref ? 'hide_vpn' : ''}`;
        vpnBox.innerHTML = `<div>${vpnContent}</div>`;

        tableVpn.before(vpnBox);
        tableVpn.remove();
      } else { // no VPN
        // if we don't have vpn we need to set a min-height for the text that comes in place of it
        parentSelector.classList.contains('table_fixed_h');
        if (!parentSelector.classList.contains('table_fixed_h') && productsAsList.length !== 1) {
          parentSelector.classList.add('table_fixed_h');
        } else {
          parentSelector.classList.add('no_vpn');
        }
      }

      // add prod class on block
      const priceBoxSelector = block.querySelector(`.c-productswithvpn > div:nth-child(${idx + 1})`);
      priceBoxSelector.classList.add(`${onSelectorClass}_box`, 'prod_box');
      priceBoxSelector.setAttribute('data-testid', 'prod_box');
    });

    // if there is no vpn on all prod-boxes
    if (!block.querySelector('.checkboxVPN')) {
      parentSelector.classList.add('no_vpn_table');
    }

    /// ///////////////////////////////////////////////////////////////////////
    // change the border color of the main box
    if (borderColor) {
      const primaryBox = block.querySelector('.c-productswithvpn > div:nth-child(1)');
      primaryBox.style.border = `9px solid ${borderColor}`;

      const tag = primaryBox.querySelector('.tag');
      tag.style.backgroundColor = borderColor;
    }

    /// ///////////////////////////////////////////////////////////////////////
    // change the svg of the list in all boxes
    if (listStyle) {
      const lists = block.querySelectorAll('.c-productswithvpn > div ul');
      lists.forEach((item) => {
        item.classList.add(listStyle);
      });
    }

    /// ///////////////////////////////////////////////////////////////////////
    // remove the border of the first box
    if (noBorder) {
      const primaryBox = block.querySelector('.c-productswithvpn > div:nth-child(1)');
      primaryBox.classList.add('no-border');
    }
  }
}
