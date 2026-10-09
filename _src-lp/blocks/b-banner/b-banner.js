/* eslint-disable no-template-curly-in-string */
/**
 * Information:
 * - hero banner - top LandingPage
 * - default value for discount: 10%
 *
 * MetaData:
 * - discount_style : default(circle) || pill
 * - product : ex: elite/10/1 (alias_name/nr_devices/nr_years)
 * - discount_text : ex: OFF special offer (comes after the percent discount)
 *   ((not necessary for default discount_style))
 * - button_type: external-link, go-to-section-link, buy-link
 * - background_color: ex: #f5f5f5, default is white.
 * - image_variation: ex: small, default is big for large hero banners.
 *
 * Samples:
 * - default(circle): https://www.bitdefender.com/media/html/business/cross-sell-flash-sale-pm-2023/existing.html
 * - pill: https://www.bitdefender.com/media/html/business/RansomwareTrial/new.html
 */

import { sendAnalyticsPageLoadedEvent } from '../../scripts/adobeDataLayer.js';
import { GLOBAL_EVENTS, parseStoreProduct, wrapChildrenWithStoreContext } from '../../scripts/utils.js';

// hide rule for elements that only make sense when the product has a discount
const NO_DISCOUNT = '!it.option.price.discounted';
const PERCENT_ATTRIBUTES = 'data-store-render data-store-discount="percentage"';
const HIDE_WITHOUT_DISCOUNT = `data-store-hide="${NO_DISCOUNT}" data-store-hide-type="visibility"`;

/**
 * @param {HTMLElement} element
 */
const hideWithoutDiscount = (element) => {
  element.setAttribute('data-store-hide', NO_DISCOUNT);
  element.setAttribute('data-store-hide-type', 'visibility');
};

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

export default function decorate(block) {
  // get data attributes set in metaData
  const parentSelector = block.closest('.section');
  const metaData = parentSelector.dataset;

  // config new elements
  const {
    product, discountStyle, discountText, textColor, backgroundColor, bottom, imageVariation, bannerDiscount,
    headerTextColor, blueBorder, logo, config, productBox, biggerBanner,
  } = metaData;

  // move picture below
  const bannerImage = block.children[1].querySelector('picture');
  if (bannerImage) {
    bannerImage.classList.add('banner-image');
  }

  parentSelector.append(bannerImage);

  // update background color if set, if not set default: #000
  if (backgroundColor) {
    parentSelector.style.backgroundColor = backgroundColor;
  } else {
    parentSelector.style.backgroundColor = '#000';
  }

  if (textColor) {
    block.style.color = textColor;
  }

  if (headerTextColor) {
    block.querySelector('h1').style.color = headerTextColor;
  }

  if (blueBorder) {
    parentSelector.classList.add('blue-border');
  }

  if (biggerBanner) {
    parentSelector.classList.add('bigger-banner');
  }

  if (bottom) {
    parentSelector.classList.add(bottom);
  }

  /// ///////////////////////////////////////////////////////////////////////
  // adding logo
  if (logo) {
    const logoBox = document.createElement('img');
    logoBox.src = logo;
    logoBox.alt = 'Bitdefender';
    logoBox.className = 'form-logo';
    block.children[0].children[0].prepend(logoBox);
  }

  // has award in banner
  if (block.children.length === 3 && !productBox) {
    block.children[2].id = 'bannerAward';
    const targetElement = block.children[2].children[0];
    const paragraphs = targetElement.querySelectorAll('p:last-of-type');
    paragraphs.forEach((text) => {
      if (textColor) {
        text.style.color = textColor;
      } else {
        text.style.color = '#000';
      }
    });
  }

  block.innerHTML = block.innerHTML.replace(/\[bluetag:\s*([^\]]+)\]/g, '<span class="bluetag">$1</span>');

  if (imageVariation) {
    if (imageVariation === 'small') {
      const block2 = document.querySelector('.b-banner-container');
      block2.classList.add('d-flex');

      const block3 = document.querySelector('picture');
      block3.style.marginLeft = 'auto';
    }
  }

  if (product) {
    const {
      productId, devices, subscription, trialDuration,
    } = parseStoreProduct(product);
    const percentHtml = `<span ${PERCENT_ATTRIBUTES}>10%</span>`;

    const finalDiscountStyle = typeof discountStyle !== 'undefined' && discountStyle !== 'default' ? discountStyle : 'circle';
    let finalDiscountText = typeof discountText !== 'undefined' && discountText !== 'default' ? discountText : '';

    if (finalDiscountText.indexOf('0') !== -1) {
      finalDiscountText = finalDiscountText.replace(/0/g, percentHtml);
    } else {
      finalDiscountText = `${percentHtml} ${finalDiscountText}`;
    }

    if (finalDiscountStyle !== 'none') {
      let percentRadius;
      if (block.querySelector('.button-container')) {
        percentRadius = block.querySelector('.button-container');
        // the pill is added to the button paragraph, which was hidden as well when there is no discount
        if (percentRadius.tagName === 'P') hideWithoutDiscount(percentRadius);
      } else {
        percentRadius = document.createElement('div');
      }

      // the pill stays hidden until the store shows a discount
      percentRadius.innerHTML += ` <span style="visibility: hidden" class="prod-percent strong green_bck_${finalDiscountStyle} mx-2" ${HIDE_WITHOUT_DISCOUNT}>${finalDiscountText}</span>`;
      block.appendChild(percentRadius);
    }

    if (bannerDiscount) {
      const discountDiv = document.createElement('div');
      parentSelector.querySelector('picture').classList.add('hasDiscount');
      hideWithoutDiscount(discountDiv);
      discountDiv.innerHTML = `<span ${PERCENT_ATTRIBUTES}></span><span>${bannerDiscount.split(',')[1]}</span>`;
      parentSelector.querySelector('picture').appendChild(discountDiv);
      // the picture is outside the block, so the bubble gets its own scope
      wrapWithStoreContext(discountDiv, {
        productId, devices, subscription, ignoreEventsParent: true,
      });
    }

    const priceTable = block.querySelector('table');
    if (priceTable) {
      const oldPrice = priceTable.querySelector('tr:nth-of-type(1) td:nth-of-type(1)');
      oldPrice.classList.add('oldprice');
      oldPrice.setAttribute('data-store-render', '');
      oldPrice.setAttribute('data-store-price', 'full');
      oldPrice.setAttribute('data-store-hide', NO_DISCOUNT);

      const newPrice = priceTable.querySelector('tr:nth-of-type(2) td:nth-of-type(1)');
      newPrice.classList.add('newprice');
      newPrice.setAttribute('data-store-render', '');
      newPrice.setAttribute('data-store-price', 'discounted||full');
    }

    // check if there is an element with the href of #buylink
    const buyLink = block.querySelector('a[href="#buylink"]');
    if (buyLink) {
      buyLink.classList.add('button', 'primary');
      buyLink.setAttribute('data-store-render', '');
      buyLink.setAttribute('data-store-buy-link', trialDuration);
      const buyLinkHtml = buyLink.innerHTML;
      buyLink.innerHTML = buyLink.innerHTML.replace(/0%/g, percentHtml);
      buyLink.innerHTML = buyLink.innerHTML.replace(/0 %/g, percentHtml);
      if (buyLink.innerHTML !== buyLinkHtml) hideWithoutDiscount(buyLink.closest('p') || buyLink);
    }

    // add class to table if it contains oldprice or newprice
    const tableElements = block.getElementsByTagName('table');
    for (let i = 0; i < tableElements.length; i += 1) {
      const tableElement = tableElements[i];
      if (tableElement.innerHTML.includes('${oldprice}') || tableElement.innerHTML.includes('${newprice}')) {
        tableElement.classList.add('price-table');
      }
    }
  }

  /// //////////////////////////////////////////////////////////////////////
  // create product box section
  let productBoxDiv;
  let greenBubble;
  if (productBox) {
    block.closest('.b-banner-wrapper').classList.add('flex-prod');
    const { trialDuration } = parseStoreProduct(productBox);

    productBoxDiv = block.children[2];
    productBoxDiv.id = 'productBoxDiv';

    if (block.querySelector('table:nth-of-type(2)')) {
      block.querySelector('table:nth-of-type(2)').innerHTML = `<div class="prices_box await-loader">
        <span class="prod-oldprice" data-store-render data-store-price="full" data-store-hide="${NO_DISCOUNT}"></span>
        <span class="prod-newprice" data-store-render data-store-price="discounted||full"></span>
      </div>`;
    }

    const buyTable = block.querySelector('table:last-of-type');
    if (buyTable) {
      buyTable.innerHTML = `<div class="buybtn_box buy_box buy_box1">
        <a class="red-buy-button await-loader" data-store-render data-store-buy-link="${trialDuration}" referrerpolicy="no-referrer-when-downgrade" title="${buyTable.innerText.trim()} Bitdefender" href="#">
          <strong>${buyTable.innerText}</strong>
        </a>
      </div>`;
    }

    if (block.classList.contains('product-picture')) {
      const lastChild = block.children[block.children.length - 1];
      lastChild.style.position = 'relative';
      block.prepend(block.children[block.children.length - 1]);

      greenBubble = document.createElement('div');
      greenBubble.classList.add('green-bubble');
      hideWithoutDiscount(greenBubble);
      greenBubble.innerHTML = `<span class="discount-percentage await-loader" ${PERCENT_ATTRIBUTES}>10%</span> \n${discountText}`;
      lastChild.appendChild(greenBubble);

      const bannerWrapper = block.parentElement;
      bannerWrapper.style.position = 'relative';
    }
  }

  // adding height if content is bigger than default banner:
  const bannerHeight = block.closest('.b-banner-container').offsetHeight;
  const contentHeight = block.offsetHeight;
  if (contentHeight > bannerHeight) {
    block.closest('.b-banner-container').style.height = `${contentHeight + 20}px`;
  }

  // add greenTag for specific text: [NEW]
  const getLists = block.querySelectorAll('ul li');
  getLists.forEach((item) => {
    item.innerHTML = item.innerHTML.replace('[', '<span class="greenTag">');
    item.innerHTML = item.innerHTML.replace(']', '</span>');
  });

  /// //////////////////////////////////////////////////////////////////////
  // create form section
  if (config) {
    const [hash, beginDate, endDate, prod, noDays, noUsers, keys, allowedEmail, allowedCountries] = config.split(',');
    block.classList.add('form-banner');

    // adding reCaptcha script
    const recaptchaScript = document.createElement('script');
    recaptchaScript.src = 'https://www.google.com/recaptcha/api.js?render=explicit&onload=onRecaptchaLoadCallback';
    recaptchaScript.defer = true;
    document.body.appendChild(recaptchaScript);
    /* global grecaptcha */

    // Create the form element
    const formBox = document.createElement('div');
    const [inputText, buttonText] = parentSelector.querySelectorAll('table td');
    if (inputText && buttonText) {
      formBox.innerHTML = `<form id="formBox" onsubmit="event.preventDefault();">
        <label for="formEmail">Email:</label>
        <p class="form_err"></p>
        <input class='input' id='formEmail' name='nfo[email]' placeholder='${inputText.innerText}' type='email'></input>
        <button class='green-buy-button'>${buttonText.innerText}</button>
        <div id="captchaBox"></div>
      </form>`;
      window.onRecaptchaLoadCallback = () => {
        window.clientId = grecaptcha.render('captchaBox', {
          sitekey: '6LcEH5onAAAAAH4800Uc6IYdUvmqPLHFGi_nOGeR',
          badge: 'inline',
          size: 'invisible',
        });
      };
    }

    parentSelector.querySelector('table').before(formBox);

    block.addEventListener('click', async (event) => {
      const { target } = event;
      if (target.tagName === 'BUTTON' && target.closest('form')) {
        event.preventDefault();
        const captchaToken = await grecaptcha?.execute(window.clientId, { action: 'submit' });
        const email = document.getElementById('formEmail').value;
        const formErr = formBox.querySelector('.form_err');
        const formBtn = formBox.querySelector('button');
        const formErrData = { '001': 'Invalid page', '002': 'Invalid email address', '003': 'Invalid captcha' };
        const allowedDomains = allowedEmail.split(';').map((domain) => domain.trim());
        if (allowedDomains.some((domain) => email.endsWith(domain))) {
          formBtn.disabled = true;
          formBox.classList.add('await-loader');
          formErr.style.display = 'none';
          const formData = new FormData(document.getElementById('formBox'));
          formData.append('nfo[hash_page]', hash.split(':')[1].trim());
          formData.append('nfo[generator_ref]', hash.split(':')[1].trim());
          formData.append('nfo[promotion_url]', window.location.href);
          formData.append('nfo[prod]', prod.split(':')[1].trim());
          formData.append('nfo[max_keys]', keys.split(':')[1].trim());
          formData.append('nfo[begin_date]', beginDate.split(':')[1].trim());
          formData.append('nfo[end_date]', endDate.split(':')[1].trim());
          formData.append('nfo[no_days]', noDays.split(':')[1].trim());
          formData.append('nfo[no_users]', noUsers.split(':')[1].trim());
          formData.append('nfo[allowed_email]', allowedEmail);
          formData.append('nfo[allowed_countries]', allowedCountries);
          formData.append('nfo[captcha_token]', captchaToken);
          fetch('https://www.bitdefender.com/site/Promotions/spreadPromotionsPages', {
            method: 'POST',
            body: formData,
          }).then((response) => response.json())
            .then((jsonObj) => {
              if (jsonObj.error) {
                formErr.style.display = 'block';
                formErr.innerText = formErrData[jsonObj.error] || 'Please try again later';
              } else if (jsonObj.success) {
                window.location.replace(jsonObj.redirect);
              }
              formBtn.disabled = false;
              formBox.classList.remove('await-loader');
            })
            .catch((error) => {
              console.error(error);
              formBtn.disabled = false;
              formBox.classList.remove('await-loader');
            });
        } else {
          formErr.style.display = 'block';
          formErr.innerText = 'Invalid email address';
        }
      }
    });

    if (window.ADOBE_MC_EVENT_LOADED) {
      sendAnalyticsPageLoadedEvent(true);
    } else {
      document.addEventListener(GLOBAL_EVENTS.ADOBE_MC_LOADED, () => {
        sendAnalyticsPageLoadedEvent(true);
      });
    }
  }

  // store scopes: the product box has its own product, nested in the banner's product
  if (productBox) {
    const { productId, devices, subscription } = parseStoreProduct(productBox);
    const storeOptions = {
      productId, devices, subscription, ignoreEventsParent: true,
    };
    wrapChildrenWithStoreContext(productBoxDiv, {
      ...storeOptions,
      storeEvent: productBox.trim() !== product?.trim() ? 'info' : '',
    });
    if (greenBubble && !productBoxDiv.contains(greenBubble)) wrapWithStoreContext(greenBubble, storeOptions);
  }

  if (product) {
    const { productId, devices, subscription } = parseStoreProduct(product);
    wrapChildrenWithStoreContext(block, {
      productId, devices, subscription, ignoreEventsParent: true, storeEvent: 'info',
    });
  }

  // TODO: Add logic betwen the card and banner component.
}
