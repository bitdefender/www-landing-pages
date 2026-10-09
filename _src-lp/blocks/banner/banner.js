import { decorateButtons, decorateIcons } from '../../scripts/lib-franklin.js';
import { detectModalButtons, isView, getParam } from '../../scripts/scripts.js';
import {
  getBackgroundImageUrl, parseStoreProduct, wrapChildrenWithStoreContext,
} from '../../scripts/utils.js';

// hide rule for elements that only make sense when the product has a discount
const NO_DISCOUNT = '!it.option.price.discounted';

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
 * Each product is reported to analytics once.
 * @param {HTMLElement} block
 */
const createStoreScopes = (block) => {
  const reportedProducts = new Set();
  block.querySelectorAll('[data-product-scope]').forEach((element) => {
    const { productId, devices, subscription } = parseStoreProduct(element.dataset.productScope);
    const productKey = `${productId}/${devices}/${subscription}`;
    const storeEvent = reportedProducts.has(productKey) ? '' : 'info';
    reportedProducts.add(productKey);

    element.removeAttribute('data-product-scope');
    wrapWithStoreContext(element, {
      productId, devices, subscription, ignoreEventsParent: true, storeEvent,
    });
  });
};

// Helper function to get image source safely
const getImageSrc = (pictureEl) => getBackgroundImageUrl(pictureEl?.querySelector('img')?.getAttribute('src'));

// Helper function to get content size CSS classes
const getContentSizeClasses = (size) => {
  const sizeMap = {
    full: 'col-sm-12 col-md-12 col-lg-12',
    larger: 'col-sm-12 col-md-7 col-lg-7',
    half: 'col-sm-12 col-md-6 col-lg-6',
    fourth: '', // Special case handled separately
    'they-wear-our-faces': 'col-sm-12 col-md-6 col-lg-6 col-xl-7',
  };
  return sizeMap[size] || 'col-sm-12 col-md-6 col-lg-6';
};

// Helper function to apply background styles
const applyBackgroundStyles = (target, imageSrc, position = 'top center', size = 'cover', options = {}) => {
  const {
    backgroundColorGradient,
    isDesktop,
    backgroundColor,
    innerBackgroundColor,
    blockStyle,
  } = options;

  if (backgroundColorGradient) {
    if (isDesktop) {
      target.background = `url(${imageSrc}), linear-gradient(to bottom, ${backgroundColorGradient.replace(' ', ',')})`;
      target.backgroundSize = size;
      target.backgroundPosition = position;
      target.backgroundRepeat = 'no-repeat';
      target.backgroundBlendMode = 'unset';
    } else {
      target.background = `linear-gradient(to bottom, ${backgroundColorGradient.replace(' ', ',')})${size === 'cover' ? '' : ' !important'}`;
    }
  } else {
    const bgColor = target === blockStyle ? (innerBackgroundColor || '#000') : (backgroundColor || '#000');
    target.background = `url(${imageSrc}) no-repeat ${position} / ${size} ${bgColor}`;
  }
};

export default function decorate(block) {
  const parentBlock = block.closest('.section');
  const parentBlockStyle = block.closest('.section').style;
  const blockStyle = block.style;
  const metaData = block.closest('.section').dataset;
  const {
    product, products, animatedText, contentSize, backgroundColor, backgroundColorGradient, innerBackgroundColor, backgroundHide, bannerHide, textColor,
    underlinedInclinedTextColor, textAlignVertical, imageAlign, paddingTop, paddingBottom, marginTop,
    marginBottom, imageCover, corners, textNextToPill, isCampaign, redirectCampaign, hardcodedLinks,
  } = metaData;
  const [contentEl, pictureEl, contentRightEl] = [...block.children];
  const hasContentEl = !!contentEl?.textContent?.trim();
  const isDesktop = isView('desktop');

  if (imageCover) parentBlock.classList.add(`bckimg-${imageCover}`);
  if (!hasContentEl) parentBlock.classList.add('full-width');

  // store attributes are only rendered when the block has a product to price
  const { trialDuration } = parseStoreProduct(product);
  const withStore = (attributes) => (product ? attributes : '');
  const scopeAttribute = withStore(`data-product-scope="${product}"`);
  const percentAttributes = withStore('data-store-render data-store-discount="percentage"');
  const hideWithoutDiscount = withStore(`data-store-hide="${NO_DISCOUNT}" data-store-hide-type="visibility"`);

  contentEl.innerHTML = contentEl.innerHTML.replace(/xx%/g, '<span class="max-discount"></span>');

  // authors write the lead + icon bullets as one paragraph with line breaks; split so each line can be styled
  if (parentBlock.classList.contains('installforfamily')) {
    contentEl.querySelectorAll('p').forEach((p) => {
      if (!p.querySelector('br + .icon')) return;
      p.outerHTML = p.innerHTML.split(/<br\s*\/?>/i).map((line) => `<p>${line}</p>`).join('');
    });
  }

  // table from left content
  [...contentEl.querySelectorAll('table')].forEach((table) => {
    const aliasTr = table.querySelector('tr'); // 1st tr should have an identifier alias

    // NORMAL DISPLAY
    if (aliasTr && aliasTr.textContent.trim() === 'display') {
      table.style.display = 'block';
    }

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

    // BUTTONS_BOX
    if (aliasTr && (aliasTr.textContent.trim() === 'buttons_box' || aliasTr.textContent.trim() === 'Buttons_table')) {
      const [, buttonsRow] = [...table.querySelectorAll('tr')];
      const buttonsCells = buttonsRow.querySelectorAll('td');

      if (buttonsCells.length >= 3) {
        const [leftButton, orText, rightButton] = buttonsCells;

        const buttonsBox = document.createElement('div');
        buttonsBox.className = 'buttons-box';

        // Extract left button content
        const leftLink = leftButton.querySelector('a');
        const leftButtonText = leftLink ? leftLink.textContent.trim() : '';
        const leftButtonHref = leftLink ? leftLink.getAttribute('href') : '#';
        const leftButtonTitle = leftLink ? leftLink.getAttribute('title') : leftButtonText;

        // Extract additional text after the link (like "Basic protection, Windows only")
        const leftAdditionalText = leftButton.textContent.replace(leftButtonText, '').trim();

        // Extract right button content
        const rightLink = rightButton.querySelector('a');
        const rightButtonText = rightLink ? rightLink.textContent.trim() : '';
        const rightButtonHref = rightLink ? rightLink.getAttribute('href') : '#';
        const rightButtonTitle = rightLink ? rightLink.getAttribute('title') : rightButtonText;

        // Extract additional text after the right button and replace [discounted_price]
        const rightAdditionalTexts = rightButton.querySelectorAll('p:not(.button-container)');
        let rightAdditionalText = rightAdditionalTexts.length > 0 ? rightAdditionalTexts[0].innerHTML : '';

        // Replace [discounted_price] with dynamic price span
        const rightTextHasPrice = rightAdditionalText.includes('[discounted_price]') && product;
        if (rightTextHasPrice) {
          rightAdditionalText = rightAdditionalText.replace(
            '[discounted_price]',
            '<span data-store-render data-store-price="discounted||full"></span>',
          );
        }

        buttonsBox.innerHTML = `
          <div class="row align-items-center g-3">
            <div class="col-12 col-xl-5">
              <a href="${leftButtonHref}" title="${leftButtonTitle}" class="button primary w-100 mb-2">${leftButtonText}</a>
              ${leftAdditionalText ? `<p class="text-muted d-block text-center">${leftAdditionalText}</p>` : ''}
            </div>
            
            <div class="col-12 col-xl-1 text-center d-flex align-items-center justify-content-center">
              <span class="fw-medium">${orText.textContent.trim()}</span>
            </div>
            
            <div class="col-12 col-xl-6">
              <a href="${rightButtonHref}" title="${rightButtonTitle}" class="btn btn-outline-primary w-100 mb-2">${rightButtonText}</a>
              ${rightAdditionalText ? `<p class="text-muted d-block text-center" ${rightTextHasPrice ? scopeAttribute : ''}>${rightAdditionalText}</p>` : ''}
            </div>
          </div>`;

        table.innerHTML = '';
        table.appendChild(buttonsBox);
      }
    }

    if (aliasTr && aliasTr.textContent.trim() === 'price_box') {
      // eslint-disable-next-line no-unused-vars
      const [alias, save, prices, terms, buybtn] = [...table.querySelectorAll('tr')];
      const pricesBox = document.createElement('div');

      if (isCampaign === 'jamestowntribe') {
        pricesBox.id = 'pricesBox';
        pricesBox.className = 'prices_box';
        pricesBox.innerHTML += `<div class="d-flex">
          <p>
          <div>
            <div class="d-flex">
              <span class="prod-oldprice mr-2">$89.99</span>
            </div>
            </p>
            <div class="d-flex">
              <span class="prod-newprice">$26.99</span>
              <p class="variation">1 year /<br>3 Devices</p>
            </div>
        </div>`;

        pricesBox.innerHTML += `<div class="terms">${terms.querySelector('td').innerHTML}</div>`;
        pricesBox.innerHTML += `<div class="buy_box">
          <a class="red-buy-button" href="#c-productsboxes" referrerpolicy="no-referrer-when-downgrade">Get it now <span class="save">| Save 70%</span></a>
        </div>`;
      } else {
        let buyTextHasPercent = false;
        if (buybtn && (buybtn.textContent.indexOf('0%') !== -1 || buybtn.innerHTML.indexOf('0 %') !== -1)) {
          buybtn.innerHTML = buybtn.textContent.replace(/0\s*%/g, `<span ${percentAttributes}></span>`);
          buyTextHasPercent = true;
        }

        // without a discount the old price is removed, the save pill and a "save 0%" button are hidden
        const buyLinkAttributes = hardcodedLinks ? '' : withStore(`data-store-render data-store-buy-link="${trialDuration}"`);
        pricesBox.id = 'pricesBox';
        pricesBox.className = 'prices_box await-loader';
        if (product) pricesBox.dataset.productScope = product;
        pricesBox.innerHTML += `<div class="d-flex">
          <p>
          <div>
            <div class="d-flex">
              <span class="prod-oldprice mr-2" ${withStore(`data-store-render data-store-price="full" data-store-hide="${NO_DISCOUNT}"`)}></span>
              <span class="prod-save d-flex justify-content-center align-items-center save-class" ${hideWithoutDiscount}>${save.textContent} <span ${withStore('data-store-render data-store-discount="value"')}> </span></span>
            </div>
            </p>
            <div class="d-flex">
              <span class="prod-newprice" ${withStore('data-store-render data-store-price="discounted||full"')}></span>
              <p class="variation">${prices.innerHTML}</p>
            </div>
        </div>`;

        pricesBox.innerHTML += `<div class="terms">${terms.querySelector('td').innerHTML}</div>`;
        pricesBox.innerHTML += `<div class="buy_box">
          <a class="red-buy-button ${hardcodedLinks ? '' : 'await-loader'}" ${buyLinkAttributes} ${buyTextHasPercent && !hardcodedLinks ? hideWithoutDiscount : ''}
            href="${hardcodedLinks ? buybtn.querySelector('a')?.href : '#'}" referrerpolicy="no-referrer-when-downgrade">${(hardcodedLinks ? buybtn.innerText : buybtn.innerHTML) ?? 'Get it now'}
          </a>
        </div>`;
      }

      table.innerHTML = '';
      table.appendChild(pricesBox);
    }

    // GREEN_PILL_BOX
    if (aliasTr && aliasTr.textContent.trim() === 'green_pill') {
      const [, text] = [...table.querySelectorAll('tr')];
      const greenPillBox = document.createElement('div');

      if (text.innerText.indexOf('0%') !== -1 || text.innerText.indexOf('0 %') !== -1) {
        const link = text.querySelector('a');
        if (text.innerText.includes('-')) greenPillBox.classList.add('d-flex');
        (link || text).innerHTML = text.innerHTML.replace(
          /0\s*%/g,
          '<span class="max-discount"></span>',
        );
      }

      greenPillBox.id = 'greenPillBox';
      greenPillBox.innerHTML += `<span>${text.innerHTML}</span>`;

      // replace the table with greenPillBox in the exact same position
      const parentElement = table.parentElement;
      parentElement.replaceChild(greenPillBox, table);
    }

    if (aliasTr && aliasTr.textContent.trim() === 'transparent_blue_pill') {
      const [, text] = [...table.querySelectorAll('tr')];
      const bluePillBox = document.createElement('div');

      if (text.innerText.indexOf('0%') !== -1 || text.innerText.indexOf('0 %') !== -1) {
        const link = text.querySelector('a');
        if (text.innerText.includes('-')) bluePillBox.classList.add('d-flex');
        (link || text).innerHTML = text.innerHTML.replace(
          /0\s*%/g,
          '<span class="max-discount"></span>',
        );
      }

      bluePillBox.id = 'transparentBluePillBox';
      bluePillBox.innerHTML += `<span>${text.innerHTML}</span>`;

      // replace the table with greenPillBox in the exact same position
      const parentElement = table.parentElement;
      parentElement.replaceChild(bluePillBox, table);
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

      if (buybtn && buybtn.innerText && buybtn.innerText !== '' && (buybtn.innerText.indexOf('0%') !== -1 || buybtn.innerText.indexOf('0 %') !== -1)) {
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

  if (products) {
    const targetElement = Array.from(block.querySelectorAll('*')).find((el) => el.textContent.includes('0%'));
    if (targetElement) {
      targetElement.innerHTML = targetElement.innerHTML.replace('0%', '<span class="max-discount"></span>');
    }
  }

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
          // const img = button.querySelector('img')?.getAttribute('src').split('?')[0];
          const text = anchor ? anchor.innerHTML : button.innerText.trim();
          const buttonProduct = productsAsList[index];

          // authored links stay as they are, the others become the buy link of the matching product
          const storeAttributes = !anchor && buttonProduct
            ? `data-product-scope="${buttonProduct}" data-store-render data-store-buy-link="${parseStoreProduct(buttonProduct).trialDuration}"`
            : '';
          lidlBox.innerHTML += `<a href="${link}" title="Bitdefender" class="red-buy-button d-flex" ${storeAttributes}>${text}</a>`;
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

  if (backgroundColorGradient) {
    parentBlock.classList.add('has-gradient');
    parentBlockStyle.background = `linear-gradient(to bottom, ${backgroundColorGradient.replace(' ', ',')})`;
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

  if (imageCover && imageCover.indexOf('small') !== -1) {
    const imageSrc = getImageSrc(pictureEl);
    const imageCoverVar = imageCover.split('-')[1];

    const styleOptions = {
      backgroundColorGradient,
      isDesktop,
      backgroundColor,
      innerBackgroundColor,
      blockStyle,
    };

    // Apply background styles for small image cover
    if (imageCoverVar && imageCoverVar !== 'cover') {
      applyBackgroundStyles(blockStyle, imageSrc, `top ${imageCoverVar}`, 'auto 100%', styleOptions);
    } else {
      applyBackgroundStyles(blockStyle, imageSrc, '0 0', 'cover', styleOptions);
    }

    const defaultSize = getContentSizeClasses(contentSize);
    block.innerHTML = `
    <div class="container-fluid">
        <div class="row d-none d-md-flex d-lg-flex position-relative">
          ${hasContentEl ? `<div class="col-12 ${defaultSize} ps-4">${contentEl.innerHTML}</div>` : ''}
          ${contentRightEl && contentRightEl.innerText.trim() ? `<div class="col-12 ${hasContentEl && defaultSize} ps-4">${contentRightEl.innerHTML}</div>` : ''}
        </div>
        <div class="row d-md-none d-lg-none justify-content-center">
           ${hasContentEl ? `<div class="col-12 ${defaultSize} text-center">${contentEl.innerHTML}</div>` : ''}
          ${contentRightEl && contentRightEl.innerText.trim() ? `<div class="col-12 ${hasContentEl && defaultSize} ps-4">${contentRightEl.innerHTML}</div>` : `<div class="col-12 p-0 text-center bck-img">${pictureEl.innerHTML}</div>`}
        </div>
      </div>
    `;
  } else if (imageCover) {
    const imageSrc = getImageSrc(pictureEl);
    const imageCoverVar = imageCover.split('-')[1];

    const styleOptions = {
      backgroundColorGradient,
      isDesktop,
      backgroundColor,
      innerBackgroundColor,
      blockStyle,
    };

    // Apply background styles for regular image cover
    if (imageCoverVar && imageCoverVar !== 'cover') {
      applyBackgroundStyles(parentBlockStyle, imageSrc, `top ${imageCoverVar}`, 'auto 100%', styleOptions);
    } else {
      applyBackgroundStyles(parentBlockStyle, imageSrc, 'top right', 'cover', styleOptions);
    }

    // Generate HTML based on content size
    if (contentSize === 'fourth') {
      block.innerHTML = `
    <div class="container-fluid">
      <div class="row d-md-flex d-sm-block ${contentRightEl ? 'justify-content-lg-between justify-content-xxl-start' : ''}">
        ${hasContentEl ? `<div class="col-12 col-md-6 col-lg-5 col-xxl-4">${contentEl.innerHTML}</div>` : ''}
        ${contentRightEl ? `<div class="col-12 col-md-6 col-lg-4 custom-col-xl-4">${contentRightEl.innerHTML}</div>` : ''}
      </div>
      </div>
    `;
    } else {
      const colSize = contentSize === 'half' ? '6' : '7';
      block.innerHTML = `
    <div class="container-fluid">
      <div class="row d-md-flex d-sm-block ${contentRightEl ? 'justify-content-center' : ''}">
        ${hasContentEl ? `<div class="col-12 col-md-${colSize}">${contentEl.innerHTML}</div>` : ''}
        ${contentRightEl ? `<div class="col-12 col-md-${colSize}">${contentRightEl.innerHTML}</div>` : ''}
      </div>
      </div>
    `;
    }
  } else {
    const defaultSize = getContentSizeClasses(contentSize);
    let imageComponent = `
        <div class="${defaultSize ? 'col-5' : 'col-7'} d-none d-sm-none d-md-block d-lg-block img-right bck-img">
            ${pictureEl.innerHTML}
        </div>`;

    if (contentSize === 'they-wear-our-faces') {
      block.querySelector('.icon.icon-play-button')?.closest('a')?.classList.add('button', 'button--modal');
      imageComponent = `
        <div class="col-6 col-xl-5 d-none d-sm-none d-md-flex d-lg-block img-right bck-img">
            ${pictureEl.innerHTML}
        </div>`;
    }
    block.innerHTML = `
    <div class="container-fluid">
      <div class="row d-block d-sm-flex d-md-flex d-lg-flex position-relative">
        <div class="col-12 d-block d-sm-block d-md-none d-lg-none p-0 text-center bck-img position-relative">
            ${pictureEl.innerHTML}
        </div>

        <div class="col-xs-12 ${defaultSize} ps-4 content-column">${contentEl.innerHTML}</div>

        ${imageComponent}
      </div>
    </div>`;
    decorateButtons(block);
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

  if (redirectCampaign) {
    const campaign = getParam('vcampaign');
    if (campaign) localStorage.setItem('campaign', campaign);
    const locale = getParam('locale');
    if (locale) localStorage.setItem('locale', locale);

    const buttons = block.querySelectorAll('a');
    buttons.forEach((button) => {
      const url = new URL(button.href);
      const cachedCampaign = localStorage.getItem('campaign');
      const cachedLocale = localStorage.getItem('locale');
      if (cachedLocale) url.searchParams.set('locale', cachedLocale);
      if (url.searchParams.has('vcampaign') && cachedCampaign) url.searchParams.set('vcampaign', cachedCampaign);

      button.href = url.toString();
    });
  }

  createStoreScopes(block);
  detectModalButtons(block);
  decorateIcons(block);
}
