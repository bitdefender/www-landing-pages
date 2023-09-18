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

import { productAliases } from '../../scripts/scripts.js';
import { updateProductsList } from '../../scripts/utils.js';

export default function decorate(block) {
  // get data attributes set in metaData
  const parentSelector = block.closest('.section');
  const metaData = parentSelector.dataset;

  // config new elements
  const {
    product, discountStyle, discountText, textColor, backgroundColor, bottom, imageVariation, bannerDiscount,
    headerTextColor, imageInContainer, blueBorder, logo, config, biggerBanner,
  } = metaData;

  // move picture below
  const bannerImage = block.children[1].querySelector('picture');
  bannerImage.classList.add('banner-image');

  if (!imageInContainer) {
    parentSelector.append(bannerImage);
  } else {
    bannerImage.classList.remove('banner-image');
    bannerImage.classList.add('banner-image--in-container');
  }

  // update background color if set, if not set default: #000
  const block1 = document.querySelector('.b-banner-container');
  if (backgroundColor) {
    block1.style.backgroundColor = backgroundColor;
  } else {
    block1.style.backgroundColor = '#000';
  }

  if (textColor) {
    block.style.color = textColor;
    block.children[2].style.color = textColor;
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

  /// //////////////////////////////////////////////////////////////////////
  // create form section
  if (config) {
    const [hash, beginDate, endDate, prod, noDays, noUsers, keys, allowedEmail, allowedCountries] = config.split(',');
    block.classList.add('form-banner');

    // adding reCaptcha script
    const recaptchaScript = document.createElement('script');
    recaptchaScript.src = 'https://www.google.com/recaptcha/api.js';
    recaptchaScript.async = true;
    recaptchaScript.defer = true;
    document.body.appendChild(recaptchaScript);

    // Create the form element
    const formBox = document.createElement('form');
    const [inputText, buttonText] = parentSelector.querySelectorAll('table td');
    formBox.id = 'formBox';
    formBox.action = '?';
    formBox.method = 'POST';

    if (inputText) {
      formBox.innerHTML = '<label for="fromEmail">Email:</label>';
      formBox.innerHTML += '<p class="form_err"></p>';
      formBox.innerHTML += `<input class='input' id='fromEmail' name='nfo[email]' placeholder='${inputText.innerText}' type='email'></input>`;
      formBox.innerHTML += `<input class='input' name='nfo[hash_page]' placeholder='${inputText.innerText}' value='${hash.split(':')[1].trim()}' type='hidden'></input>`;
    }

    if (buttonText) {
      formBox.innerHTML += '<div class="g-recaptcha" data-sitekey="6LcEH5onAAAAAH4800Uc6IYdUvmqPLHFGi_nOGeR" data-size="invisible" data-callback="onSubmit"></div>';
      formBox.innerHTML += `<button class='green-buy-button'>${buttonText.innerText}</button>`;
    }

    parentSelector.querySelector('table').before(formBox);

    formBox.addEventListener('submit', (event) => {
      event.preventDefault();
      // grecaptcha.execute();

      const email = document.getElementById('fromEmail').value;
      const formErr = formBox.querySelector('.form_err');
      const formBtn = formBox.querySelector('button');
      const formErrData = { '001': 'Invalid page', '002': 'Invalid email address', '003': 'Invalid captcha' };

      if (email.includes('@energizer.com')) {
        formBtn.disabled = true;
        formBox.classList.add('await-loader');
        formErr.style.display = 'none';

        const formData = new FormData(document.getElementById('formBox'));
        formData.append('nfo[hash]', hash.split(':')[1].trim());
        formData.append('nfo[prod]', prod.split(':')[1].trim());
        formData.append('nfo[max_keys]', keys.split(':')[1].trim());
        formData.append('nfo[begin_date]', beginDate.split(':')[1].trim());
        formData.append('nfo[end_date]', endDate.split(':')[1].trim());
        formData.append('nfo[no_days]', noDays.split(':')[1].trim());
        formData.append('nfo[no_users]', noUsers.split(':')[1].trim());
        formData.append('nfo[allowed_email]', allowedEmail.split(':')[1].trim());
        formData.append('nfo[allowed_countries]', allowedCountries.split(':')[1].trim());

        fetch('https://ltiseanu.bitdefender.com/site/Promotions/spreadPromotionsPages', {
        // fetch('https://ltiseanu.bitdefender.com/site/Promotions/spreadPromotions2020', {
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
    });
  }

  // has award in banner
  if (block.children.length === 3) {
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

  if (imageVariation) {
    if (imageVariation === 'small') {
      const block2 = document.querySelector('.b-banner-container');
      block2.classList.add('d-flex');

      const block3 = document.querySelector('picture');
      block3.style.marginLeft = 'auto';
    }
  }

  if (typeof product !== 'undefined' && product !== '') {
    const [prodName, prodUsers, prodYears] = product.split('/');
    const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;

    updateProductsList(product);

    const finalDiscountStyle = typeof discountStyle !== 'undefined' && discountStyle !== 'default' ? discountStyle : 'circle';
    let finalDiscountText = typeof discountText !== 'undefined' && discountText !== 'default' ? discountText : '';

    if (finalDiscountText.indexOf('0') !== -1) {
      finalDiscountText = finalDiscountText.replace(/0/g, `<span class="percent-${onSelectorClass}">10%</span>`);
    } else {
      finalDiscountText = `<span class="percent-${onSelectorClass}">10%</span> ${finalDiscountText}`;
    }

    if (finalDiscountStyle !== 'none') {
      let percentRadius;
      if (block.querySelector('.button-container')) {
        percentRadius = block.querySelector('.button-container');
      } else {
        percentRadius = document.createElement('div');
      }

      percentRadius.innerHTML += ` <span style="visibility: hidden" class="prod-percent strong green_bck_${finalDiscountStyle} mx-2">${finalDiscountText}</span>`;
      block.appendChild(percentRadius);
    }

    if (bannerDiscount) {
      const discountDiv = document.createElement('div');
      parentSelector.querySelector('picture').classList.add('hasDiscount');
      discountDiv.innerHTML = `<span class="percent-${onSelectorClass}"></span><span>${bannerDiscount.split(',')[1]}</span>`;
      parentSelector.querySelector('picture').appendChild(discountDiv);
    }

    const allElements = block.getElementsByTagName('*');
    // Loop through each element and check if its innerText contains "{$oldprice} or {$newprice}"
    for (let i = 0; i < allElements.length; i += 1) {
      const element = allElements[i];
      let foundOldprice = 0;
      let foundNewPrice = 0;
      if (element.innerText === '${oldprice}') {
        element.classList.add('oldprice', `oldprice-${onSelectorClass}`);
        foundOldprice = 1;
      }
      if (element.innerText === '${newprice}') {
        element.classList.add('newprice', `newprice-${onSelectorClass}`);
        foundNewPrice = 1;
      }
      // no need to continue if both are found
      if (foundNewPrice === 1 && foundOldprice === 1) {
        break;
      }
    }

    // check if there is an element with the href of #buylink
    const buyLink = block.querySelector('a[href="#buylink"]');
    if (buyLink) {
      buyLink.classList.add('button', 'primary', `buylink-${onSelectorClass}`);
      buyLink.innerHTML = buyLink.innerHTML.replace(/0%/g, `<span class="percent-${onSelectorClass}">10%</span>`);
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

  // TODO: Add logic betwen the card and banner component.
}
