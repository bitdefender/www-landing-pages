/*
  Information:
  - displays 4 boxes positioned in flex mode:
    0. top text
    1. left text
    2. product 1
    3. product 2
    4. product 3

  MetaData:
  - background : ex: grey (background-color of full section)
  - products : ex: tsmd/5/1, is/3/1, av/3/1 (alias_name/nr_devices/nr_years)
  - top_text : ex: COMPARE SOLUTIONS
                   Compare Bitdefender Products
  - active_card: 1 / 2 / 3 / 4 ... etc ( the position of the active card )
  - active_card_color: 'red' / '#434332' / rgb(212,131,44) any color format; the border top color of the active card
  Samples:
  - https://www.bitdefender.com/media/html/consumer/new/2020/cl-offer-opt/ - http://localhost:3000/consumer/en/new/cl-offer-opt
*/

import { productAliases } from '../../scripts/scripts.js';
import { updateProductsList, GLOBAL_EVENTS } from '../../scripts/utils.js';

export default function decorate(block) {
  const defaultBorderTopColorForActiveCard = '#e60093';
  /// ///////////////////////////////////////////////////////////////////////
  // get data attributes set in metaData
  const parentSelector = block.closest('.section');
  const metaData = parentSelector.dataset;
  const {
    products, topText, bulinaText, activeCardColor, activeCard, userText,
  } = metaData;
  const productsAsList = products && products.split(',');

  /// ///////////////////////////////////////////////////////////////////////
  // adding top text
  if (typeof topText !== 'undefined') {
    const topTextSplitted = topText.split(',');
    const topHeader = document.createElement('div');
    topHeader.className = 'topHeader col-12';
    topHeader.innerHTML += `<h3 class="heading">${topTextSplitted[0]}</h3>`;
    topHeader.innerHTML += `<h2 class="subheading">${topTextSplitted[1]}</h2>`;
    block.parentNode.prepend(topHeader);
  }

  if (productsAsList.length) {
    // check and add products into the final array
    productsAsList.forEach((prod) => updateProductsList(prod));

    console.log(productsAsList);

    /// ///////////////////////////////////////////////////////////////////////
    // set top class with numbers of products
    parentSelector.classList.add(`has${productsAsList.length}boxes`);

    // set prices and buy buttons
    block.querySelectorAll(':scope > div').forEach((item, key, list) => {
      if (key !== 0) {
        const isActiveCard = key === Number(activeCard);
        const isLastCard = key === list.length - 1;

        if (isActiveCard || (!activeCard && isLastCard)) {
          item.style.borderTopColor = activeCardColor || defaultBorderTopColorForActiveCard;
          item.classList.add('active');
        }

        // eslint-disable-next-line prefer-const
        let [prodName, prodUsers, prodYears] = productsAsList[key - 1].split('/');
        prodName = prodName.trim();
        const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;

        const pricesSection = item.querySelector('table:first-of-type');
        let pricesDiv = `<div class="prices_box await-loader prodload prodload-${onSelectorClass}">`;
        pricesDiv += `<span class="prod-oldprice oldprice-${onSelectorClass}"></span>`;
        pricesDiv += `<span class="prod-newprice newprice-${onSelectorClass}"></span>`;
        pricesDiv += '<div>';
        if (bulinaText && (isActiveCard || isLastCard)) {
          const bulinaSplitted = bulinaText.split(',');
          pricesDiv += `<div class="prod-percent green_bck_circle medium bulina-${onSelectorClass}">
            <span class="bulina_text1"><b class="percent-${onSelectorClass}">${bulinaSplitted[0]}</b></span>
            <span class="bulina_text2">${bulinaSplitted[1]}</span>
          </div>`;
        }
        pricesSection.innerHTML = pricesDiv;

        // add buybtn div & anchor
        const tableBuybtn = item.querySelector('table:last-of-type td');
        tableBuybtn.innerHTML = `<div class="buy_box buy_box${key}"><a href="#" title="Bitdefender" class="red-buy-button buylink-${onSelectorClass} await-loader prodload prodload-${onSelectorClass}" referrerpolicy="no-referrer-when-downgrade">${tableBuybtn.innerText}</a></div>`;

        const priceBoxSelector = block.querySelector(`.c-top-comparative-with-text > div:nth-child(${key + 1})`);
        console.log(priceBoxSelector);
        priceBoxSelector.classList.add(`${onSelectorClass}_box_comp`);
        const prodDescription = block.querySelector(`.${onSelectorClass}_box_comp > div > p:nth-child(3)`);
        prodDescription.classList.add(`${prodName}_description_comp`);

        document.addEventListener(GLOBAL_EVENTS.PAGE_LOADED, () => {
          const users = StoreProducts.product[prodName].selected_users;
          // const years = StoreProducts.product[prodName].selected_years;
          const textUser = userText.split(',');
          let devicesText = '';
          if (users !== '1') {
            devicesText = `${textUser[1]}`;
          } else {
            devicesText = `${textUser[0]}`;
          }
          const devicesDesc = block.querySelector(`.${prodName}_description_comp`);
          devicesDesc.innerHTML = `${users} ${devicesText}`;
        });
      }
    });
  }
}
