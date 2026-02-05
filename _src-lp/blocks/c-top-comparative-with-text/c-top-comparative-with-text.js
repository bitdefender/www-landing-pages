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
import { updateProductsList, GLOBAL_EVENTS, matchHeights } from '../../scripts/utils.js';

export default function decorate(block) {
  const defaultBorderTopColorForActiveCard = '#e60093';
  /// ///////////////////////////////////////////////////////////////////////
  // get data attributes set in metaData
  const parentSelector = block.closest('.section');
  const metaData = parentSelector.dataset;
  const {
    products, topText, bulinaText, activeCardColor, activeCard, userText, discount,
  } = metaData;
  const productsAsList = products && products.split(',');

  /// ///////////////////////////////////////////////////////////////////////
  // adding top text
  if (typeof topText !== 'undefined') {
    const topTextSplitted = topText.split(',');
    const topHeader = document.createElement('div');
    topHeader.className = 'topHeader col-12';
    if (topTextSplitted[0]) {
      topHeader.innerHTML += `<h3 class="heading">${topTextSplitted[0]}</h3>`;
    }
    if (topTextSplitted[1]) {
      topHeader.innerHTML += `<h2 class="subheading">${topTextSplitted[1]}</h2>`;
    }
    block.parentNode.prepend(topHeader);
  }

  if (productsAsList.length) {
    /// ///////////////////////////////////////////////////////////////////////
    // check and add products into the final array (skip empty products)
    productsAsList.forEach((prod) => {
      if (prod && prod.trim() !== '') {
        updateProductsList(prod);
      }
    });

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

        const currentProduct = productsAsList[key - 1];
        const isEmptyProduct = !currentProduct || currentProduct.trim() === '';

        // DETECT hardcoded link RIGHT NOW for this card
        let hasHardcodedLink = false;
        let hardcodedLinkData = null;

        const tableBuybtn = item.querySelector('table:last-of-type td');
        console.log(`\n🎴 Card ${key} - Checking for hardcoded link...`);
        if (tableBuybtn) {
          const existingLink = tableBuybtn.querySelector('a');
          console.log('   Existing link found:', existingLink);
          if (existingLink) {
            console.log('   href:', existingLink.href);
            console.log('   text:', existingLink.innerText.trim());

            if (existingLink.href && existingLink.href !== '' && existingLink.href !== '#') {
              const href = existingLink.href;

              if (!href.endsWith('#') && href.indexOf('#') !== href.length - 1) {
                hasHardcodedLink = true;
                hardcodedLinkData = {
                  href,
                  text: existingLink.innerText.trim() || 'BUY NOW',
                };
                console.log('   ✅ HARDCODED LINK DETECTED:', hardcodedLinkData);
              }
            }
          }
        }

        console.log(`\n🎴 Processing Card ${key}:`);
        console.log(`   Product: ${currentProduct}`);
        console.log(`   hasHardcodedLink: ${hasHardcodedLink}`);

        // Process product
        let prodName = '';
        let prodUsers = '';
        let prodYears = '';
        let onSelectorClass = 'custom';

        if (!isEmptyProduct) {
          // eslint-disable-next-line prefer-const
          [prodName, prodUsers, prodYears] = currentProduct.split('/');
          prodName = prodName.trim();
          onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;
        }

        const pricesSection = item.querySelector('table:first-of-type');

        // If has hardcoded link, don't create price elements at all. Otherwise show them with API loader
        let pricesDiv = '';
        if (hasHardcodedLink) {
          // Empty div, no prices at all for hardcoded links
          pricesDiv = '<div class="prices_box"></div>';
          console.log('   👻 No prices (hardcoded link)');
        } else {
          // Show prices with loader for API products
          const loaderClasses = !isEmptyProduct ? `await-loader prodload prodload-${onSelectorClass}` : '';
          pricesDiv = `<div class="prices_box ${loaderClasses}">`;
          pricesDiv += `<span class="prod-oldprice oldprice-${onSelectorClass}"></span>`;
          if (discount && !isEmptyProduct) pricesDiv += `<span class="percent"><span class="percent percent-${onSelectorClass}""></span> OFF</span>`;
          pricesDiv += `<span class="prod-newprice newprice-${onSelectorClass}"></span>`;
          pricesDiv += '</div>';
          console.log('   💰 Showing prices with API loader');
          if (bulinaText && (isActiveCard || isLastCard) && !isEmptyProduct) {
            const bulinaSplitted = bulinaText.split(',');
            pricesDiv += `<div class="prod-percent green_bck_circle medium bulina-${onSelectorClass}">
              <span class="bulina_text1"><b class="percent-${onSelectorClass}">${bulinaSplitted[0]}</b></span>
              <span class="bulina_text2">${bulinaSplitted[1]}</span>
            </div>`;
          }
        }
        pricesSection.innerHTML = pricesDiv;

        // add buybtn div & anchor
        const tableBuybtnForButton = item.querySelector('table:last-of-type td');
        if (tableBuybtnForButton) {
          let buttonHTML = '';
          if (hasHardcodedLink && hardcodedLinkData) {
            // Use hardcoded link, no API loader
            buttonHTML = `<div class="buy_box buy_box${key}"><a href="${hardcodedLinkData.href}" title="Bitdefender" class="red-buy-button" referrerpolicy="no-referrer-when-downgrade">${hardcodedLinkData.text}</a></div>`;
            console.log(`   ✅ Creating HARDCODED button with href: ${hardcodedLinkData.href}`);
          } else {
            // Use API link with loader
            const buttonText = tableBuybtnForButton.innerText.trim() || 'BUY NOW';
            const loaderClasses = !isEmptyProduct ? ` await-loader prodload prodload-${onSelectorClass}` : '';
            buttonHTML = `<div class="buy_box buy_box${key}"><a href="#" title="Bitdefender" class="red-buy-button buylink-${onSelectorClass}${loaderClasses}" referrerpolicy="no-referrer-when-downgrade">${buttonText}</a></div>`;
            console.log('   🔗 Creating API button with href: #');
          }
          tableBuybtnForButton.innerHTML = buttonHTML;
        }

        const priceBoxSelector = block.querySelector(`.c-top-comparative-with-text > div:nth-child(${key + 1})`);
        priceBoxSelector.classList.add(`${onSelectorClass}_box_comp`);

        if (!isEmptyProduct) {
          const prodDescription = !block.classList.contains('reveresed') ? block.querySelector(`.${onSelectorClass}_box_comp > div > p:nth-child(3)`) : '';
          prodDescription?.classList.add(`${prodName}_description_comp`);

          if (userText) {
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
        }
      }
    });
  }
  const targetNode = document.querySelector('.c-top-comparative-with-text');
  matchHeights(targetNode, 'h4');
  matchHeights(block, '.prices_box');
}
