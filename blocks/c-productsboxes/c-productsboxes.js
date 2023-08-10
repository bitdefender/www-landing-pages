/*
  Information:
  - displays max 3 boxes positioned in flex mode:
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

  Samples:
  - http://localhost:3000/consumer/fr/new/dip-premiumsecurity-opt
*/

import { productAliases } from '../../scripts/scripts.js';
import { updateProductsList } from '../../scripts/utils.js';

export default function decorate(block) {
  /// ///////////////////////////////////////////////////////////////////////
  // get data attributes set in metaData
  const parentSelector = block.parentNode.parentNode;
  const metaData = parentSelector.dataset;
  const {
    title, subtitle, titlePosition, products, bulinaText,
  } = metaData;
  const productsAsList = products && products.split(',');

  if (productsAsList.length) {
    /// ///////////////////////////////////////////////////////////////////////
    // set the title
    if (title) {
      const divTagTitle = document.createElement('div');
      divTagTitle.classList = `top_title ${typeof titlePosition !== 'undefined' ? `p_${titlePosition}` : ''}`;

      // adding title
      divTagTitle.innerHTML = document.querySelectorAll('h1').length === 0 ? `<h1>${title}</h1>` : `<h2>${title}</h2>`;

      // adding subtitle
      if (subtitle) {
        divTagTitle.innerHTML += `<h2>${subtitle}</h2>`;
      }

      block.parentNode.prepend(divTagTitle);
    }

    /// ///////////////////////////////////////////////////////////////////////
    // check and add products into the final array
    productsAsList.forEach((prod) => updateProductsList(prod));

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
      const prodBox = block.children[idx];
      const [prodName, prodUsers, prodYears] = productsAsList[idx].split('/');
      const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;
      const pricesDiv = document.createElement('div');

      pricesDiv.classList = 'prices_box awaitLoader prodLoad';
      pricesDiv.innerHTML += `<span class="prod-oldprice oldprice-${onSelectorClass}"></span>`;
      pricesDiv.innerHTML += `<span class="prod-newprice newprice-${onSelectorClass}"></span>`;

      block.children[idx].querySelector('table').after(pricesDiv);

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
        // prodBox.parentNode.querySelector(`p:nth-child(1)`).before(divTag);
        prodBox.querySelector('div').before(divTag);
      }

      /// ///////////////////////////////////////////////////////////////////////
      // add buybtn div & anchor
      const tableBuybtn = prodBox.querySelector('table:last-of-type td');

      const aBuybtn = document.createElement('a');
      aBuybtn.innerHTML = tableBuybtn.innerHTML.replace(/0%/g, `<span class="percent percent-${onSelectorClass}"></span>`);
      aBuybtn.className = `red-buy-button buylink-${onSelectorClass} awaitLoader prodLoad`;
      aBuybtn.setAttribute('title', 'Buy Now Bitdefender');

      const divBuybtn = document.createElement('div');
      divBuybtn.className = 'buybtn_box';
      divBuybtn.appendChild(aBuybtn);
      tableBuybtn.before(divBuybtn);

      /// ///////////////////////////////////////////////////////////////////////
      // removing last table
      tableBuybtn.remove();

      // add prod class on block
      prodBox.classList.add(`${onSelectorClass}_box`, 'prod_box');
      prodBox.setAttribute('data-testid', 'prod_box');
    });
  }
}
