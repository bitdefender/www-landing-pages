import { detectModalButtons, productAliases, productAliasesNames } from '../../scripts/scripts.js';
import {
  getBackgroundImageUrl, parseStoreProduct, wrapChildrenWithStoreContext,
} from '../../scripts/utils.js';

// hide rule for elements that only make sense when the product has a discount
const NO_DISCOUNT = '!it.option.price.discounted';
const PERCENT_ATTRIBUTES = 'data-store-render data-store-discount="percentage"';
const HIDE_WITHOUT_DISCOUNT = `data-store-hide="${NO_DISCOUNT}" data-store-hide-type="visibility"`;

/**
 * Wraps the element itself (bd-context > bd-product > bd-option > element),
 * so the store rules on the element and on its children see the product.
 * @param {HTMLElement} element
 * @param {object} storeOptions options of wrapChildrenWithStoreContext
 */
const wrapWithStoreContext = (element, storeOptions) => {
  const { parentNode, nextSibling } = element;
  if (!parentNode) return;

  const holder = document.createElement('div');
  holder.appendChild(element);
  wrapChildrenWithStoreContext(holder, storeOptions);
  parentNode.insertBefore(holder.firstElementChild, nextSibling);
};

/**
 * The block markup is rebuilt from strings (and duplicated for mobile), so priced elements are
 * only marked with `data-product-scope` while decorating and get their store scope at the end.
 * Each product is reported to analytics once; products of the dropdown that are not
 * selected by default (`data-product-scope-alternate`) are not reported.
 * @param {HTMLElement} block
 */
const createStoreScopes = (block) => {
  const reportedProducts = new Set();
  block.querySelectorAll('[data-product-scope]').forEach((element) => {
    const { productScope, productScopeAlternate } = element.dataset;
    const { productId, devices, subscription } = parseStoreProduct(productScope);
    const productKey = `${productId}/${devices}/${subscription}`;
    const report = productScopeAlternate === undefined && !reportedProducts.has(productKey);
    if (report) reportedProducts.add(productKey);

    element.removeAttribute('data-product-scope');
    element.removeAttribute('data-product-scope-alternate');
    wrapWithStoreContext(element, {
      productId, devices, subscription, ignoreEventsParent: true, storeEvent: report ? 'info' : '',
    });
  });
};

export default function decorate(block) {
  const parentBlock = block.closest('.section');
  const parentBlockStyle = block.closest('.section').style;
  const blockStyle = block.style;
  const metaData = block.closest('.section').dataset;
  const {
    product, products, animatedText, contentSize, backgroundColor, innerBackgroundColor, backgroundHide, bannerHide, textColor, underlinedInclinedTextColor, textAlignVertical, imageAlign, paddingTop, paddingBottom, marginTop, marginBottom, imageCover, corners, textNextToPill, type, trial, bestValue,
  } = metaData;
  const [contentEl, pictureEl, contentRightEl] = [...block.children];

  // store attributes are only rendered when the block has a product to price
  const { trialDuration } = parseStoreProduct(product);
  const withStore = (attributes) => (product ? attributes : '');
  const percentAttributes = withStore(PERCENT_ATTRIBUTES);
  const hideWithoutDiscount = withStore(HIDE_WITHOUT_DISCOUNT);

  if (imageCover) {
    parentBlock.classList.add(`bckimg-${imageCover}`);
  }

  // table from left content
  let defaultFeaturesIndex = 0; // Counter for default features tables
  [...contentEl.querySelectorAll('table')].forEach((table) => {
    const aliasTr = table.querySelector('tr'); // 1st tr should have an identifier alias

    // BLUE-BOX
    if (aliasTr && aliasTr.textContent.trim() === 'blue-box') {
      table.classList.add('blue-box');
    }

    // TITLE_WITH_PRICES
    if (aliasTr && aliasTr.textContent.trim() === 'title_with_prices') {
      // eslint-disable-next-line no-unused-vars
      const [alias, titlePrices] = [...table.querySelectorAll('tr')];

      const titleBox = document.createElement('div');
      if (titlePrices) {
        const replacements = {
          XX: withStore('data-store-render data-store-price="discounted||full"'),
          YY: withStore(`data-store-render data-store-discount="value" data-store-hide="${NO_DISCOUNT}"`),
          ZZ: withStore(`data-store-render data-store-price="full" data-store-hide="${NO_DISCOUNT}"`),
        };

        Object.keys(replacements).forEach((key) => {
          const value = replacements[key];
          if (titlePrices.textContent.indexOf(key) !== -1) {
            const regex = new RegExp(key, 'g');
            titlePrices.innerHTML = titlePrices.innerHTML.replace(regex, `<span ${value}></span>`);
          }
        });

        titleBox.innerHTML = titlePrices.innerHTML;
        if (product) titleBox.dataset.productScope = product;
      }

      table.innerHTML = '';
      table.appendChild(titleBox);
    }

    // FEATURES_BOX - mark tables for product association
    if (aliasTr && aliasTr.textContent.trim().startsWith('features_box')) {
      // Format: features_box or features_box_productname
      const parts = aliasTr.textContent.trim().split('_');
      if (parts.length > 2) {
        const productName = parts.slice(2).join('_'); // Get product name after 'features_box_'
        table.setAttribute('data-product', productName);
      } else if (products) {
        // Auto-assign to products in order if products exist
        const productsAsList = products.split(',');
        if (defaultFeaturesIndex < productsAsList.length) {
          const [productName] = productsAsList[defaultFeaturesIndex].split('/');
          const productKey = productName.trim().toLowerCase().replace(/\s+/g, '-');
          table.setAttribute('data-product', productKey);
          defaultFeaturesIndex += 1;
        } else {
          table.setAttribute('data-product', 'default');
        }
      } else {
        table.setAttribute('data-product', 'default');
      }
      table.style.display = 'none'; // Hide original table
    }

    // PRICE_BOX
    if (aliasTr && aliasTr.textContent.trim() === 'price_box') {
      // eslint-disable-next-line no-unused-vars
      const [alias, save, prices, terms, buybtn, prodstext, afterTrial] = [...table.querySelectorAll('tr')];

      if (products) {
        const productsAsList = products.split(',');

        const containerDiv = document.createElement('div');
        containerDiv.id = 'prodSel';

        if (bestValue) {
          const productSelectorBestValue = document.createElement('label');
          productSelectorBestValue.className = 'bestValue';
          productSelectorBestValue.setAttribute('for', 'productSelector');
          productSelectorBestValue.innerHTML = `${bestValue}`;
          // Append the label to the container div
          containerDiv.appendChild(productSelectorBestValue);
        }

        const productSelector = type && type === 'radio-buttons' ? document.createElement('div') : document.createElement('select');
        productSelector.id = 'productSelector';
        productSelector.className = 'productSelector';

        // Append the select to the container div
        containerDiv.appendChild(productSelector);

        table.innerHTML = '';
        table.appendChild(containerDiv);

        // "0%" in the buttons becomes the discount of the product of each price box
        const buybtnCells = buybtn ? [...buybtn.querySelectorAll('td')] : [];
        const buybtnCellsWithPercent = buybtnCells.map((cell) => {
          if (cell && (cell.textContent.indexOf('0%') !== -1 || cell.innerHTML.indexOf('0 %') !== -1)) {
            cell.innerHTML = cell.textContent.replace(/0\s*%/g, `<span ${PERCENT_ATTRIBUTES}></span>`);
            return true;
          }
          return false;
        });

        productsAsList.forEach((prod, i) => {
          /* eslint-disable no-shadow */
          const [prodName, prodUsers, prodYears] = prod.split('/');
          const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;

          // Create features box for this product
          const featuresBox = document.createElement('div');
          featuresBox.className = `featuresBox features_box prod-${prodName.trim().toLowerCase().replace(/\s+/g, '-')}`;
          featuresBox.style.display = 'none'; // Hidden by default, will be shown by JS

          // Look for a features_box table for this specific product or default
          const productKey = prodName.trim().toLowerCase().replace(/\s+/g, '-');
          let productFeaturesTable = contentEl.querySelector(`table[data-product="${productKey}"]`);

          // If no specific product table found, use the default one for first product
          if (!productFeaturesTable && i === 0) {
            productFeaturesTable = contentEl.querySelector('table[data-product="default"]');
          }

          if (productFeaturesTable) {
            const allRows = [...productFeaturesTable.querySelectorAll('tr')];

            // Get the title from the second row (first row after alias)
            let featureTitle = '';
            if (allRows.length > 1) {
              const titleRow = allRows[1];
              const titleCell = titleRow.querySelector('td');
              if (titleCell) {
                featureTitle = titleCell.innerHTML.trim();
              }
            }

            // Get feature rows starting from the third row (skip alias and title)
            const featureRows = allRows.slice(2);
            if (featureRows.length > 0) {
              const featuresList = document.createElement('div');
              featuresList.className = 'features-list';

              // Add title as div if it exists
              if (featureTitle) {
                const titleElement = document.createElement('div');
                titleElement.className = 'features-title';
                titleElement.innerHTML = featureTitle;
                featuresBox.appendChild(titleElement);
              }

              featureRows.forEach((row) => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 2) {
                  const featureItem = document.createElement('div');
                  featureItem.className = 'feature-row';

                  const featureName = cells[0].innerHTML.trim();
                  const featureValue = cells[1].innerHTML.trim();

                  // Skip completely empty rows
                  if (!featureName && !featureValue) {
                    return;
                  }

                  // Create feature name element
                  const nameDiv = document.createElement('div');
                  if (!featureName || featureName === '') {
                    // Empty cell - hide it completely
                    nameDiv.className = 'feature-name';
                    nameDiv.style.display = 'none';
                  } else if (featureName.toLowerCase().startsWith('-x-')) {
                    // Not supported feature - show X
                    nameDiv.className = 'feature-name nocheck';
                    nameDiv.innerHTML = featureName.substring(3).trim();
                  } else {
                    // Normal feature - show check mark
                    nameDiv.className = 'feature-name';
                    nameDiv.innerHTML = featureName;
                  }

                  // Create feature value element
                  const valueDiv = document.createElement('div');

                  if (!featureValue || featureValue === '') {
                    // Empty cell - hide it completely
                    valueDiv.className = 'feature-value';
                    valueDiv.style.display = 'none';
                  } else if (featureValue.toLowerCase().startsWith('-x-')) {
                    // Not supported feature - show X
                    valueDiv.className = 'feature-value nocheck';
                    valueDiv.innerHTML = featureValue.substring(3).trim();
                  } else {
                    // Normal feature - show check mark
                    valueDiv.className = 'feature-value';
                    valueDiv.innerHTML = featureValue;
                  }

                  featureItem.appendChild(nameDiv);
                  featureItem.appendChild(valueDiv);
                  featuresList.appendChild(featureItem);
                }
              });

              featuresBox.appendChild(featuresList);
            }
          }

          const pricesBox = document.createElement('div');

          if (type === 'radio-buttons') {
            productSelector.setAttribute('value', onSelectorClass);
            containerDiv.classList.add('prodsel-radio');
            const optionsText = prodstext.querySelectorAll('li');
            productSelector.innerHTML += `
              <label class="prodsel-radio-label" value="${onSelectorClass}">
                <input type="radio" name="productSelector" value="${onSelectorClass}" ${i === 0 ? 'checked' : ''}>
                <span>${optionsText[i].innerHTML}</span>
              </label>
            `;
          } else {
            productSelector.innerHTML += `<option value="${onSelectorClass}">${productAliasesNames(prodName)}</option>`;
          }

          pricesBox.className = `pricesBox prices_box prod-${prodName.trim().toLowerCase().replace(/\s+/g, '-')} await-loader`;
          // the selected product's boxes are shown by the selector below
          pricesBox.dataset.productValue = onSelectorClass;
          pricesBox.dataset.productScope = prod.trim();
          if (i > 0) pricesBox.dataset.productScopeAlternate = '';
          // without a discount the old price is removed and the save pill is hidden
          pricesBox.innerHTML += `<div class="d-flex">
            <div>
              <div class="d-flex">
                <span class="prod-oldprice mr-2" data-store-render data-store-price="full" data-store-hide="${NO_DISCOUNT}"></span>
                <span class="prod-save d-flex justify-content-center align-items-center save-class" ${HIDE_WITHOUT_DISCOUNT}>${save.textContent} <span data-store-render data-store-discount="value"> </span></span>
              </div>
              <div class="d-flex">
                ${trial ? '<span class="prod-newprice">{{= it.option.price.zero }}</span>' : '<span class="prod-newprice" data-store-render data-store-price="discounted||full"></span>'}
                <p class="variation">${prices.innerHTML}</p>
              </div>
            </div>
          </div>`;

          pricesBox.innerHTML += `<div class="terms">${terms.querySelector('td').innerHTML}</div>`;

          // Extract text and href for first button
          const firstBtnCell = buybtnCells[0];
          let firstBtnText = 'Get it now';
          let firstBtnHref = '#';

          if (firstBtnCell) {
            const firstBtnLink = firstBtnCell.querySelector('a');
            if (firstBtnLink) {
              firstBtnText = firstBtnLink.innerHTML;
              firstBtnHref = firstBtnLink.getAttribute('href') || '#';
            } else {
              firstBtnText = firstBtnCell.innerHTML;
            }
          }

          // Extract text and href for second button
          const secondBtnCell = buybtnCells[1];
          let secondBtnText = null;
          let secondBtnHref = '#';

          if (secondBtnCell && secondBtnCell.innerHTML.trim()) {
            const secondBtnLink = secondBtnCell.querySelector('a');
            if (secondBtnLink) {
              secondBtnText = secondBtnLink.innerHTML;
              secondBtnHref = secondBtnLink.getAttribute('href') || '#';
            } else {
              secondBtnText = secondBtnCell.innerHTML;
            }
          }

          // Create buy_box content
          // the first button is always the product's buy link, the second one keeps the authored link;
          // a button showing the discount is hidden when there is none
          const { trialDuration: prodTrialDuration } = parseStoreProduct(prod);
          let buyBoxContent = `<a class="red-buy-button await-loader" data-store-render data-store-buy-link="${prodTrialDuration}" ${buybtnCellsWithPercent[0] ? HIDE_WITHOUT_DISCOUNT : ''} href="${firstBtnHref}" referrerpolicy="no-referrer-when-downgrade">${firstBtnText}</a>`;

          // Add second button if second column exists and has content
          if (secondBtnText && secondBtnText.trim()) {
            buyBoxContent += `<a class="await-loader" ${buybtnCellsWithPercent[1] ? HIDE_WITHOUT_DISCOUNT : ''} href="${secondBtnHref}" referrerpolicy="no-referrer-when-downgrade">${secondBtnText}</a>`;
          }

          pricesBox.innerHTML += `<div class="buy_box">${buyBoxContent}</div>`;

          if (afterTrial) {
            pricesBox.innerHTML += `<div class="pay_after_trial">
              ${afterTrial.innerHTML.replace('0', '<span class="prod-newprice" data-store-render data-store-price="discounted||full"></span>')}
            </div>`;
          }

          // Add features box first (will appear between dropdown and prices)
          table.appendChild(featuresBox);
          table.appendChild(pricesBox);
        });
      }
    }

    // GREEN_PILL_BOX
    if (aliasTr && aliasTr.textContent.trim() === 'green_pill') {
      const [, text] = [...table.querySelectorAll('tr')];
      const greenPillBox = document.createElement('div');
      let textHasPercent = false;

      if (text.innerText.indexOf('0%') !== -1 || text.innerText.indexOf('0 %') !== -1) {
        text.innerHTML = text.innerText.replace(/0\s*%/g, `<strong ${percentAttributes}></strong>`);
        textHasPercent = true;
      }

      greenPillBox.id = 'greenPillBox';
      greenPillBox.className = 'green_pill_box await-loader';
      if (product) greenPillBox.dataset.productScope = product;
      greenPillBox.innerHTML += `<span ${textHasPercent ? hideWithoutDiscount : ''}>${text.innerHTML}</span>`;

      // replace the table with greenPillBox in the exact same position
      const parentElement = table.parentElement;
      parentElement.replaceChild(greenPillBox, table);
    }

    // RED_PILL_BOX
    if (aliasTr && aliasTr.textContent.trim() === 'red_pill') {
      const [, text] = [...table.querySelectorAll('tr')];
      const redPillBox = document.createElement('div');
      let textHasPercent = false;

      if (text.innerText.indexOf('0%') !== -1 || text.innerText.indexOf('0 %') !== -1) {
        text.innerHTML = text.innerText.replace(/0\s*%/g, `<strong ${percentAttributes}></strong>`);
        textHasPercent = true;
      }

      redPillBox.id = 'redPillBox';
      redPillBox.className = 'red_pill_box await-loader';
      if (product) redPillBox.dataset.productScope = product;
      redPillBox.innerHTML += `<span ${textHasPercent ? hideWithoutDiscount : ''}>${text.innerHTML}</span>`;

      // replace the table with redPillBox in the exact same position
      const parentElement = table.parentElement;
      parentElement.replaceChild(redPillBox, table);

      if (textNextToPill) {
        redPillBox.nextElementSibling.style.display = 'inline-block';
        redPillBox.nextElementSibling.style.margin = '0';
      }
    }

    // BUYBTN_AND_GREEN_CIRCLE_BOX
    if (aliasTr && aliasTr.textContent.trim() === 'buybtn_and_green_circle') {
      // eslint-disable-next-line no-unused-vars
      const [alias, buybtnText] = [...table.querySelectorAll('tr')];
      const [buybtn, text] = [...buybtnText.querySelectorAll('tr td')];
      const greenCircleBox = document.createElement('div');
      let textHasPercent = false;
      let buyTextHasPercent = false;

      if (text && text.innerText !== '' && (text.innerText.indexOf('0%') !== -1 || text.innerText.indexOf('0 %') !== -1)) {
        text.innerHTML = text.innerText.replace(/0\s*%/g, `<strong ${percentAttributes}></strong>`);
        textHasPercent = true;
      }

      if (buybtn && buybtn.innerText !== '' && (buybtn.innerText.indexOf('0%') !== -1 || buybtn.innerText.indexOf('0 %') !== -1)) {
        buybtn.innerHTML = buybtn.innerText.replace(/0\s*%/g, `<span ${percentAttributes}></span>`);
        buyTextHasPercent = true;
      }

      greenCircleBox.id = 'buyBtnGreenCircleBox';
      greenCircleBox.className = 'd-flex buybtn_green_circle_box await-loader';
      if (product) greenCircleBox.dataset.productScope = product;
      if (buybtn) {
        if (buybtn.innerHTML.includes('<a')) {
          buybtn.querySelector('a').className = 'button primary';
          greenCircleBox.innerHTML += buybtn.innerHTML;
        } else {
          greenCircleBox.innerHTML += `<a class="button primary" ${withStore(`data-store-render data-store-buy-link="${trialDuration}"`)} referrerpolicy="no-referrer-when-downgrade" title="${buybtn.innerText.trim()} Bitdefender" href="#">
            <strong ${buyTextHasPercent ? hideWithoutDiscount : ''}>${buybtn.innerHTML}</strong>
          </a>`;
        }
      }

      if (text && text.innerHTML !== '') {
        greenCircleBox.innerHTML += `<span class="green_circle_box" ${textHasPercent ? hideWithoutDiscount : ''}>${text.innerHTML}</span>`;
      }

      table.innerHTML = '';
      table.appendChild(greenCircleBox);
    }
  });

  // tables from right content
  if (contentRightEl && contentRightEl.querySelectorAll('table').length) {
    [...contentRightEl.querySelectorAll('table')].forEach((table) => {
      const aliasTr = table.querySelector('tr'); // 1st tr should have an identifier alias
      if (aliasTr && aliasTr.innerText.trim() === 'right_content_lidl') {
        // eslint-disable-next-line no-unused-vars
        const [alias, title, btn1, btn2] = table.querySelectorAll('tr');
        const productsAsList = products ? products.split(',').map((prod) => prod.trim()) : [];

        const lidlBox = document.createElement('div');
        lidlBox.id = 'lidlBox';
        lidlBox.innerHTML = `${title.innerHTML}<hr />`;

        const createBuyLink = (button, index) => {
          const anchor = button.querySelector('a');
          const link = anchor ? anchor.getAttribute('href') : '#';
          const img = button.querySelector('img')?.getAttribute('src').split('?')[0];
          const text = button.textContent;
          const buttonProduct = productsAsList[index];

          // authored links stay as they are, the others become the buy link of the matching product
          const storeAttributes = !anchor && buttonProduct
            ? `data-product-scope="${buttonProduct}" data-store-render data-store-buy-link="${parseStoreProduct(buttonProduct).trialDuration}"`
            : '';
          lidlBox.innerHTML += `<a href="${link}" title="Bitdefender" class="red-buy-button d-flex" ${storeAttributes}>${img ? `<img src="${img}" alt="Bitdefender">` : ''} ${text}</a>`;
        };

        createBuyLink(btn1, 0);
        createBuyLink(btn2, 1);

        table.innerHTML = '';
        table.appendChild(lidlBox);
      }

      if (aliasTr && aliasTr.innerText.trim() === 'right_content_input') {
        const awesomeBox = document.querySelector('.b-productswithinputdevices').parentElement.parentElement;
        awesomeBox.style.display = 'block';
        contentRightEl.innerHTML = '';
        contentRightEl.appendChild(awesomeBox);

        const h1 = block.querySelector('h1');
        h1.style.textAlign = 'left';

        parentBlock.classList.add('hide-tablet');
      }
    });
  }

  if (backgroundColor) parentBlockStyle.backgroundColor = backgroundColor;
  if (innerBackgroundColor) blockStyle.backgroundColor = innerBackgroundColor;
  if (textColor) blockStyle.color = textColor;
  if (underlinedInclinedTextColor) {
    block.querySelectorAll('em u').forEach((element) => {
      element.style.color = underlinedInclinedTextColor;
      element.style.fontStyle = 'normal';
      element.style.textDecoration = 'none';
    });
  }
  if (paddingTop) blockStyle.paddingTop = `${paddingTop}rem`;
  if (paddingBottom) blockStyle.paddingBottom = `${paddingBottom}rem`;
  if (marginTop) blockStyle.marginTop = `${marginTop}rem`;
  if (marginBottom) blockStyle.marginBottom = `${marginBottom}rem`;

  if (corners && corners === 'round') {
    blockStyle.borderRadius = '20px';
  }

  if (backgroundHide) parentBlock.classList.add(`hide-${backgroundHide}`);
  if (bannerHide) parentBlock.classList.add(`block-hide-${bannerHide}`);

  // Process feature icons in original tables before generating templates
  const processFeatureIcons = (container) => {
    const featureTables = container.querySelectorAll('table[style*="display: none"]');
    featureTables.forEach((table) => {
      const aliasTr = table.querySelector('tr');
      if (aliasTr && aliasTr.textContent.trim().startsWith('features_box')) {
        const featureRows = [...table.querySelectorAll('tr')].slice(1); // Skip alias row
        featureRows.forEach((row) => {
          const cells = row.querySelectorAll('td');
          cells.forEach((featureCell) => {
            const featureName = featureCell.textContent.trim();

            // Only process if not already processed and has content
            if (!featureCell.classList.contains('processed') && featureName) {
              // Check if feature name starts with -x- (not supported feature)
              if (featureName.toLowerCase().startsWith('-x-')) {
                featureCell.classList.add('nocheck');
                featureCell.innerHTML = featureName.substring(3).trim(); // Remove -x- prefix
              }
              featureCell.classList.add('processed'); // Mark as processed
            }
          });
        });
      }
    });
  };

  // Process icons in contentEl before it's used in templates
  processFeatureIcons(contentEl);

  if (imageCover && imageCover.indexOf('small') !== -1) {
    blockStyle.background = `url(${getBackgroundImageUrl(pictureEl.querySelector('img')?.getAttribute('src'))}) no-repeat 0 0 / cover ${innerBackgroundColor || '#000'}`;

    const imageCoverVar = imageCover.split('-')[1];
    if (imageCoverVar) {
      blockStyle.background = `url(${getBackgroundImageUrl(pictureEl.querySelector('img')?.getAttribute('src'))}) no-repeat top ${imageCoverVar} / auto 100% ${innerBackgroundColor || '#000'}`;
    }

    let defaultSize = 'col-sm-10 col-md-10 col-lg-5';
    if (contentSize === 'full') {
      defaultSize = 'col-sm-12 col-md-12 col-lg-12';
    } else if (contentSize === 'larger') {
      defaultSize = 'col-sm-10 col-md-10 col-lg-7';
    } else if (contentSize === 'half') {
      defaultSize = 'col-sm-10 col-md-8 col-lg-6';
    }

    block.innerHTML = `
    <div class="container-fluid">
        <div class="row d-none d-md-flex d-lg-flex position-relative">
          <div class="col-12 ${defaultSize} ps-4">${contentEl.innerHTML}</div>
        </div>
        <div class="row d-md-none d-lg-none justify-content-center">
          <div class="col-12 ${defaultSize} text-center">${contentEl.innerHTML}</div>
          <div class="col-12 p-0 text-center bck-img">
            ${pictureEl.innerHTML}
          </div>
        </div>
      </div>
    `;
  } else if (imageCover) {
    parentBlockStyle.background = `url(${getBackgroundImageUrl(pictureEl.querySelector('img')?.getAttribute('src'))}) no-repeat top center / 100% ${backgroundColor || '#000'}`;

    const imageCoverVar = imageCover.split('-')[1];
    if (imageCoverVar) {
      parentBlockStyle.background = `url(${getBackgroundImageUrl(pictureEl.querySelector('img')?.getAttribute('src'))}) no-repeat top ${imageCoverVar} / auto 100% ${backgroundColor || '#000'}`;
    }

    if (contentSize === 'fourth') {
      block.innerHTML = `
    <div class="container-fluid">
      <div class="row d-md-flex d-sm-block ${contentRightEl ? 'justify-content-lg-between justify-content-xxl-start' : ''}">
        <div class="col-12 col-md-8 col-lg-5 col-xxl-4">${contentEl.innerHTML}</div>
        ${contentRightEl ? `<div class="col-12 col-md-4 col-lg-4 custom-col-xl-4">${contentRightEl.innerHTML}</div>` : ''}
      </div>
      </div>
    `;
    } else {
      block.innerHTML = `
    <div class="container-fluid">
      <div class="row d-md-flex d-sm-block ${contentRightEl ? 'justify-content-center' : ''}">
        <div class="col-12 col-md-${contentSize === 'half' ? '6' : '8'}">${contentEl.innerHTML}</div>
        ${contentRightEl ? `<div class="col-12 col-md-${contentSize === 'half' ? '6' : '4'}">${contentRightEl.innerHTML}</div>` : ''}
      </div>
      </div>
    `;
    }
  } else {
    let defaultSize = 'col-sm-10 col-md-8 col-lg-5';
    blockStyle.background = `url(${getBackgroundImageUrl(pictureEl.querySelector('img')?.getAttribute('src'))}) no-repeat top right / auto 100% ${backgroundColor || '#000'}`;
    if (contentSize === 'larger') {
      defaultSize = 'col-sm-10 col-md-10 col-lg-7';
    } else if (contentSize === 'half') {
      defaultSize = 'col-sm-10 col-md-8 col-lg-6';
    }

    block.innerHTML = `
    <div class="container-fluid">
      <div class="row d-block d-sm-flex d-md-flex d-lg-flex position-relative">
        <div class="col-12 d-block d-sm-block d-md-none d-lg-none p-0 text-center bck-img">

        </div>

        <div class="col-xs-12 ${defaultSize} ps-4">${contentEl.innerHTML}</div>

        <div class="${defaultSize ? 'col-5' : 'col-7'} d-none d-sm-none d-md-block d-lg-block img-right bck-img">

        </div>
      </div>
    </div>`;
  }

  if (textAlignVertical) {
    block.querySelector('.row').classList.add(`align-items-${textAlignVertical}`);
  }

  if (imageAlign && block.querySelector('.img-right') && block.querySelector('.img-right').style.textAlign) {
    block.querySelector('.img-right').style.textAlign = imageAlign;
  }

  if (animatedText) {
    block.classList.add('animated_box');
    if (block.innerText.includes('[animated_text]')) {
      block.innerHTML = block.innerHTML.replace('[animated_text]', `<div class="animated_text">
        ${animatedText.split('|').map((item, key) => `<span class="${key === 0 ? 'd-show' : ''}">${item}</span>`).join('')}
      </div>`);
    } else {
      block.innerHTML += `<div class="animated_text">
        ${animatedText.split('|').map((item, key) => `<span class="${key === 0 ? 'd-show' : ''}">${item}</span>`).join('')}
      </div>`;
    }

    // Get all rotating text elements
    // const rotatingTexts = document.querySelectorAll('.rotating-text');
    setInterval(() => {
      const show = block.querySelector('.animated_text span.d-show');
      const next = show.nextElementSibling || block.querySelector('.animated_text span:first-child');
      const up = block.querySelector('.animated_text span.d-up');
      if (up) {
        up.classList.remove('d-up');
      }
      show.classList.remove('d-show');
      show.classList.add('d-up');
      next.classList.add('d-show');
    }, 2000);
  }

  if (block.querySelector('.container-fluid h1 a')) {
    block.querySelector('.container-fluid h1 a').target = '_blank';
  }

  if (block.querySelector('.divider .container-fluid ul li a')) {
    block.querySelectorAll('.divider .container-fluid ul li a').forEach((link) => {
      link.target = '_blank';
    });
  }

  const productSelector = block.querySelector('.productSelector');
  if (productSelector) {
    const showProduct = (value) => {
      // Hide all price boxes
      block.querySelectorAll('.pricesBox').forEach((box) => {
        box.style.display = 'none';
        box.classList.toggle('active');
      });
      // Hide all features boxes
      block.querySelectorAll('.featuresBox').forEach((box) => {
        box.style.display = 'none';
      });

      // Show selected price boxes (all instances)
      const productBoxes = block.querySelectorAll(`.pricesBox[data-product-value="${value}"]`);
      productBoxes.forEach((box) => {
        box.style.display = 'block';
      });

      // Show selected features boxes (all instances)
      const productAlias = value.split('-')[0];
      const featuresBoxes = block.querySelectorAll(`.featuresBox.prod-${productAlias}`);
      featuresBoxes.forEach((box) => {
        box.style.display = 'block';
      });
    };

    // Add event listeners to ALL productSelector instances
    const allProductSelectors = block.querySelectorAll('.productSelector');
    allProductSelectors.forEach((selector) => {
      if (selector.querySelector('label.prodsel-radio-label')) {
        const firstInput = selector.querySelector('input[type="radio"]');
        if (firstInput) {
          firstInput.checked = true;
          firstInput.dispatchEvent(new Event('change', { bubbles: true }));
          firstInput.closest('label').classList.add('selected');
        }

        selector.querySelectorAll('label.prodsel-radio-label').forEach((label) => {
          label.addEventListener('click', () => {
            const selectedValue = label.getAttribute('value');

            // Sync all other radio selectors
            allProductSelectors.forEach((otherSelector) => {
              if (otherSelector !== selector && otherSelector.querySelector('label.prodsel-radio-label')) {
                const otherRadio = otherSelector.querySelector(`input[value="${selectedValue}"]`);
                if (otherRadio) otherRadio.checked = true;
              }
            });

            showProduct(selectedValue);
          });
        });
      } else {
        selector.addEventListener('change', () => {
          const selectedValue = selector.value || selector.getAttribute('value');

          // Sync all other select dropdowns
          allProductSelectors.forEach((otherSelector) => {
            if (otherSelector !== selector && otherSelector.tagName === 'SELECT') {
              otherSelector.value = selectedValue;
            }
          });

          showProduct(selectedValue);
        });
      }
    });

    block.addEventListener('click', (el) => {
      if (el.target.nodeName === 'INPUT') {
        const productSelector = el.target.closest('#productSelector');
        productSelector.querySelectorAll('label.prodsel-radio-label').forEach((label) => label.classList.remove('selected'));

        el.target.closest('label').classList.add('selected');
      }
    });
  }

  // Show first product boxes by default
  if (productSelector) {
    // Get the first option value from select dropdown or first radio button
    let firstValue = null;

    if (productSelector.tagName === 'SELECT') {
      const firstOption = productSelector.options[0];
      if (firstOption) firstValue = firstOption.value;
    } else {
      const firstRadio = productSelector.querySelector('input[type="radio"]');
      if (firstRadio) firstValue = firstRadio.value;
    }

    if (firstValue) {
      // Show boxes for first product (all instances)
      const firstPricesBoxes = block.querySelectorAll(`.pricesBox[data-product-value="${firstValue}"]`);
      firstPricesBoxes.forEach((box) => {
        box.style.display = 'block';
      });

      // Extract product name from onSelectorClass for features boxes
      const productAlias = firstValue.split('-')[0];
      const firstFeaturesBoxes = block.querySelectorAll(`.featuresBox.prod-${productAlias}`);
      firstFeaturesBoxes.forEach((box) => {
        box.style.display = 'block';
      });
    }
  } else {
    // Fallback: show first boxes if no selector (all instances)
    const firstPricesBoxes = block.querySelectorAll('.pricesBox');
    firstPricesBoxes.forEach((box) => {
      box.style.display = 'block';
    });

    const firstFeaturesBoxes = block.querySelectorAll('.featuresBox');
    firstFeaturesBoxes.forEach((box) => {
      box.style.display = 'block';
    });
  }

  createStoreScopes(block);
  detectModalButtons(block);
}
