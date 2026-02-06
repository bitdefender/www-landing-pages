import { sendAnalyticsPageLoadedEvent } from '../../scripts/adobeDataLayer.js';
import { productAliases } from '../../scripts/scripts.js';
import { updateProductsList, GLOBAL_EVENTS } from '../../scripts/utils.js';

export default function decorate(block) {
  const parentBlock = block.closest('.section');
  const parentBlockStyle = parentBlock.style;
  const blockStyle = block.style;
  const metaData = parentBlock.dataset;
  const {
    logo, config, imageAlign, paddingTop, paddingBottom, marginTop,
    marginBottom, contentSize, backgroundColor, innerBackgroundColor, backgroundHide, bannerHide, textColor,
    underlinedInclinedTextColor, textAlignVertical, imageCover, corners, product,
  } = metaData;
  const [contentEl, pictureEl, contentRightEl] = [...block.children];

  if (imageCover) parentBlock.classList.add(`bckimg-${imageCover}`);
  if (backgroundColor) parentBlockStyle.backgroundColor = backgroundColor;
  if (innerBackgroundColor) parentBlock.querySelector('div.banner-wrapper').style.backgroundColor = innerBackgroundColor;
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
  if (corners && corners === 'round') blockStyle.borderRadius = '20px';
  if (backgroundHide) parentBlock.classList.add(`hide-${backgroundHide}`);
  if (bannerHide) parentBlock.classList.add(`block-hide-${bannerHide}`);

  // adding logo
  if (logo) {
    const logoBox = document.createElement('img');
    logoBox.src = logo;
    logoBox.alt = 'Bitdefender';
    logoBox.className = 'form-logo';
    block.children[0].children[0].prepend(logoBox);
  }

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
    const [inputText, buttonText] = parentBlock.querySelectorAll('table td');
    if (inputText && buttonText) {
      let htmlForm = '';

      if (product) {
        const [prodName, prodUsers, prodYears] = product.split('/');
        const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;

        updateProductsList(product);

        htmlForm += `
          <div class="priceBox await-loader prodload prodload-${onSelectorClass}">
            <span class="prod-oldprice oldprice-${onSelectorClass}"></span>
            <span class="prod-newprice newprice-${onSelectorClass}"></span>
          </div>
        `;
      }

      htmlForm += `
        <form id="formBox" onsubmit="event.preventDefault();">
          <label for="formEmail">Email:</label>
          <p class="form_err"></p>
          <input class='input' id='formEmail' name='nfo[email]' placeholder='${inputText.innerText}' type='email'></input>
          <button class='green-buy-button'>${buttonText.innerText}</button>
          <div id="captchaBox"></div>
        </form>
      `;

      formBox.innerHTML = htmlForm;

      window.onRecaptchaLoadCallback = () => {
        window.clientId = grecaptcha.render('captchaBox', {
          sitekey: '6LcEH5onAAAAAH4800Uc6IYdUvmqPLHFGi_nOGeR',
          badge: 'inline',
          size: 'invisible',
        });
      };
    }

    parentBlock.querySelector('table').before(formBox);
    parentBlock.querySelector('table').remove();

    block.addEventListener('click', async (event) => {
      const { target } = event;
      const formSelector = block.querySelector('form#formBox');
      const formErr = formSelector.querySelector('.form_err');
      if (target.tagName === 'BUTTON' && target.closest('form')) {
        event.preventDefault();
        const captchaToken = await grecaptcha?.execute(window.clientId, { action: 'submit' });
        const email = document.getElementById('formEmail').value;
        const formBtn = formSelector.querySelector('button');
        const formErrData = { '001': 'Invalid page', '002': 'Invalid email address', '003': 'Invalid captcha' };
        if (email.includes(allowedEmail.split(':')[1].trim())) {
          formBtn.disabled = true;
          formSelector.classList.add('await-loader');
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
          formData.append('nfo[allowed_email]', allowedEmail.split(':')[1].trim());
          formData.append('nfo[allowed_countries]', allowedCountries.split(':')[1].trim());
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
              formSelector.classList.remove('await-loader');
            })
            .catch((error) => {
              console.error(error);
              formBtn.disabled = false;
              formSelector.classList.remove('await-loader');
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

  if (imageCover && imageCover.indexOf('small') !== -1) {
    blockStyle.background = `url(${pictureEl.querySelector('img').getAttribute('src').split('?')[0]}) no-repeat 0 0 / cover ${backgroundColor || '#000'}`;

    const imageCoverVar = imageCover.split('-')[1];
    blockStyle.background = `url(${pictureEl.querySelector('img').getAttribute('src').split('?')[0]}) no-repeat top ${imageCoverVar} / auto 100% ${backgroundColor || '#000'}`;

    block.innerHTML = `
    <div class="container-fluid">
        <div class="row d-none d-md-flex d-lg-flex position-relative">
          <div class="col-12 col-sm-6 col-md-6 col-lg-5 ps-4">${contentEl.innerHTML}</div>
        </div>
        <div class="row d-md-none d-lg-none justify-content-center">
          <div class="col-12 col-md-7 text-center">${contentEl.innerHTML}</div>
          <div class="col-12 p-0 text-center bck-img">
            ${pictureEl.innerHTML}
          </div>
        </div>
      </div>
    `;
  } else if (imageCover) {
    parentBlockStyle.background = `url(${pictureEl.querySelector('img').getAttribute('src').split('?')[0]}) no-repeat top center / 100% ${backgroundColor || '#000'}`;

    const imageCoverVar = imageCover.split('-')[1];
    parentBlockStyle.background = `url(${pictureEl.querySelector('img').getAttribute('src').split('?')[0]}) no-repeat top ${imageCoverVar} / auto 100% ${backgroundColor || '#000'}`;

    if (contentSize === 'fourth') {
      block.innerHTML = `
    <div class="container-fluid">
      <div class="row d-md-flex d-sm-block ${contentRightEl ? 'justify-content-lg-between justify-content-xxl-start' : ''}">
        <div class="col-12 col-md-6 col-lg-5 col-xxl-4">${contentEl.innerHTML}</div>
        ${contentRightEl ? `<div class="col-12 col-md-6 col-lg-4 custom-col-xl-4">${contentRightEl.innerHTML}</div>` : ''}
      </div>
      </div>
    `;
    } else {
      block.innerHTML = `
    <div class="container-fluid">
      <div class="row d-md-flex d-sm-block ${contentRightEl ? 'justify-content-center' : ''}">
        <div class="col-12 col-md-${contentSize === 'half' ? '6' : '7'}">${contentEl.innerHTML}</div>
        ${contentRightEl ? `<div class="col-12 col-md-${contentSize === 'half' ? '6' : '7'}">${contentRightEl.innerHTML}</div>` : ''}
      </div>
      </div>
    `;
    }
  } else {
    block.innerHTML = `
    <div class="container-fluid">
      <div class="row d-block d-lg-flex position-relative">
        <div class="col-12 d-block d-sm-none d-md-none d-lg-none p-0 text-center bck-img">
            ${pictureEl.innerHTML}
        </div>

        <div class="col-xs-12 col-sm-5 col-md-5 col-lg-5 ps-4">${contentEl.innerHTML}</div>

        <div class="col-7 d-none d-sm-block d-md-block d-lg-block img-right bck-img">
            ${pictureEl.innerHTML}
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
}
