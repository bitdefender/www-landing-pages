import { productAliases } from '../../scripts/scripts.js';
import { updateProductsList } from '../../scripts/utils.js';

export default function decorate(block) {
  const parentBlock = block.closest('.section');
  const parentBlockStyle = parentBlock.style;
  const blockStyle = block.style;
  const metaData = parentBlock.dataset;
  const {
    product, products, logo, config, imageAlign, paddingTop, paddingBottom, marginTop,
    marginBottom, contentSize, backgroundColor, innerBackgroundColor, backgroundHide, bannerHide, textColor,
    underlinedInclinedTextColor, textAlignVertical, imageCover, corners, textNextToPill,
  } = metaData;
  const [contentEl, pictureEl, contentRightEl] = [...block.children];

  if (imageCover) {
    parentBlock.classList.add(`bckimg-${imageCover}`);
  }

  // tables from left content
  [...contentEl.querySelectorAll('table')].forEach((table) => {
    let prodName;
    let prodUsers;
    let prodYears;
    let onSelectorClass;
    const aliasTr = table.querySelector('tr'); // 1st tr should have an identifier alias

    if (product && product.length) {
      updateProductsList(product);
      [prodName, prodUsers, prodYears] = product.split('/');
      onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;
    }

    // BLUE-BOX
    if (aliasTr && aliasTr.innerText.trim() === 'blue-box') {
      table.classList.add('blue-box');
    }

    // PRICE_BOX
    if (aliasTr && aliasTr.innerText.trim() === 'price_box') {
      // eslint-disable-next-line no-unused-vars
      const [alias, prices, terms, buybtn] = [...contentEl.querySelectorAll('table tr')];
      const pricesBox = document.createElement('div');

      if (buybtn.innerText.indexOf('0%') !== -1 || buybtn.innerHTML.indexOf('0 %') !== -1) {
        buybtn.innerHTML = buybtn.innerText.replace(/0\s*%/g, `<span class="percent-${onSelectorClass}"></span>`);
      }

      pricesBox.id = 'pricesBox';
      pricesBox.className = `prices_box await-loader prodload prodload-${onSelectorClass}`;
      pricesBox.innerHTML += `<div class="d-flex">
        <p>
        <div>
          <div class="d-flex">
            <span class="prod-oldprice oldprice-${onSelectorClass} mr-2"></span>
            <span class="prod-save d-flex justify-content-center align-items-center save-class">Save <span class="save-${onSelectorClass} "> </span></span>
          </div>
          </p>
          <span class="prod-newprice newprice-${onSelectorClass}"></span>
          <p class="variation">${prices.innerHTML}</p>
      </div>`;

      pricesBox.innerHTML += `<div class="terms">${terms.querySelector('td').innerHTML}</div>`;
      pricesBox.innerHTML += `<div class="buy_box">
        <a class="red-buy-button await-loader prodload prodload-${onSelectorClass} buylink-${onSelectorClass}" href="#" referrerpolicy="no-referrer-when-downgrade">${buybtn.innerHTML}</a>
      </div>`;

      table.innerHTML = '';
      table.appendChild(pricesBox);
    }

    // GREEN_PILL_BOX
    if (aliasTr && aliasTr.innerText.trim() === 'green_pill') {
      const [, text] = [...contentEl.querySelectorAll('table tr')];
      const greenPillBox = document.createElement('div');

      if (text.innerText.indexOf('0%') !== -1 || text.innerText.indexOf('0 %') !== -1) {
        text.innerHTML = text.innerText.replace(/0\s*%/g, `<strong class="percent-${onSelectorClass}"></strong>`);
      }

      greenPillBox.id = 'greenPillBox';
      greenPillBox.className = `green_pill_box await-loader prodload prodload-${onSelectorClass}`;
      greenPillBox.innerHTML += `<span>${text.innerHTML}</span>`;

      // replace the table with greenPillBox in the exact same position
      const parentElement = table.parentElement;
      parentElement.replaceChild(greenPillBox, table);
    }

    // RED_PILL_BOX
    if (aliasTr && aliasTr.innerText.trim() === 'red_pill') {
      const [, text] = [...contentEl.querySelectorAll('table tr')];
      const redPillBox = document.createElement('div');

      if (text.innerText.indexOf('0%') !== -1 || text.innerText.indexOf('0 %') !== -1) {
        text.innerHTML = text.innerText.replace(/0\s*%/g, `<strong class="percent-${onSelectorClass}"></strong>`);
      }

      redPillBox.id = 'redPillBox';
      redPillBox.className = `red_pill_box await-loader prodload prodload-${onSelectorClass}`;
      redPillBox.innerHTML += `<span>${text.innerHTML}</span>`;

      // replace the table with redPillBox in the exact same position
      const parentElement = table.parentElement;
      parentElement.replaceChild(redPillBox, table);

      if (textNextToPill) {
        redPillBox.nextElementSibling.style.display = 'inline-block';
        redPillBox.nextElementSibling.style.margin = '0';
      }
    }

    // BUYBTN_AND_GREEN_CIRCLE_BOX
    if (aliasTr && aliasTr.innerText.trim() === 'buybtn_and_green_circle') {
      const [, buybtnText] = [...contentEl.querySelectorAll('table tr')];
      const [buybtn, text] = [...buybtnText.querySelectorAll('tr td')];
      const greenCircleBox = document.createElement('div');

      if (text && text.innerText !== '' && (text.innerText.indexOf('0%') !== -1 || text.innerText.indexOf('0 %') !== -1)) {
        text.innerHTML = text.innerText.replace(/0\s*%/g, `<strong class="percent-${onSelectorClass}"></strong>`);
      }

      if (buybtn && buybtn.innerText !== '' && (buybtn.innerText.indexOf('0%') !== -1 || buybtn.innerText.indexOf('0 %') !== -1)) {
        buybtn.innerHTML = buybtn.innerText.replace(/0\s*%/g, `<span class="percent-${onSelectorClass}"></span>`);
      }

      greenCircleBox.id = 'buyBtnGreenCircleBox';
      greenCircleBox.className = `d-flex buybtn_green_circle_box await-loader prodload prodload-${onSelectorClass}`;
      if (buybtn.innerHTML.includes('<a')) {
        buybtn.querySelector('a').className = 'button primary';
        greenCircleBox.innerHTML += buybtn.innerHTML;
      } else {
        greenCircleBox.innerHTML += `<a class="buylink-${onSelectorClass} button primary" referrerpolicy="no-referrer-when-downgrade" title="${buybtn.innerText.trim()} Bitdefender" href="#">
          <strong>${buybtn.innerHTML}</strong>
        </a>`;
      }

      if (text && text.innerHTML !== '') {
        greenCircleBox.innerHTML += `<span class="green_circle_box">${text.innerHTML}</span>`;
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
        const onSelectorClasses = [];

        const lidlBox = document.createElement('div');
        lidlBox.id = 'lidlBox';
        lidlBox.innerHTML = `${title.innerHTML}<hr />`;

        const createBuyLink = (button, index) => {
          const anchor = button.querySelector('a');
          const link = anchor ? anchor.getAttribute('href') : '#';
          const img = button.querySelector('img')?.getAttribute('src').split('?')[0];
          const text = button.textContent;
          const onSelectorClass = onSelectorClasses[index];

          lidlBox.innerHTML += `<a href="${link}" title="Bitdefender" class="red-buy-button d-flex ${anchor ? '' : 'buylink-'}${onSelectorClass}">${img ? `<img src="${img}" alt="Bitdefender">` : ''} ${text}</a>`;
        };

        if (products) {
          const productsAsList = products.split(',');
          productsAsList.forEach((prod) => updateProductsList(prod));

          productsAsList.forEach((prod) => {
            const [prodName, prodUsers, prodYears] = prod.split('/');
            const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;
            onSelectorClasses.push(onSelectorClass);
          });
        }

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

  if (corners && corners === 'round') {
    blockStyle.borderRadius = '20px';
  }

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
    parentBlock.classList.add('form');
    block.classList.add('form-banner');

    // adding reCaptcha script
    const recaptchaScript = document.createElement('script');
    recaptchaScript.src = 'https://www.google.com/recaptcha/api.js?render=explicit&onload=onRecaptchaLoadCallback';
    recaptchaScript.defer = true;
    document.body.appendChild(recaptchaScript);
    /* global grecaptcha */

    // Create the form element
    const formBox = document.createElement('form');
    const [inputText, buttonText] = parentBlock.querySelectorAll('table td');
    formBox.id = 'formBox';
    formBox.action = '?';
    formBox.method = 'POST';

    if (inputText) {
      formBox.innerHTML = '<label for="formEmail">Email:</label>';
      formBox.innerHTML += '<p class="form_err"></p>';
      formBox.innerHTML += `<input class='input' id='formEmail' name='nfo[email]' placeholder='${inputText.innerText}' type='email'></input>`;
    }

    if (buttonText) {
      formBox.innerHTML += `<button class='green-buy-button'>${buttonText.innerText}</button>`;
      formBox.innerHTML += '<div id="captchaBox"></div>';
      window.onRecaptchaLoadCallback = () => {
        window.clientId = grecaptcha.render('captchaBox', {
          sitekey: '6LcEH5onAAAAAH4800Uc6IYdUvmqPLHFGi_nOGeR',
          badge: 'inline',
          size: 'invisible',
        });
      };
    }

    parentBlock.querySelector('table').before(formBox);

    formBox.addEventListener('submit', async (event) => {
      event.preventDefault();
      const captchaToken = await grecaptcha?.execute(window.clientId, { action: 'submit' });

      const email = document.getElementById('formEmail').value;
      const formErr = formBox.querySelector('.form_err');
      const formBtn = formBox.querySelector('button');
      const formErrData = { '001': 'Invalid page', '002': 'Invalid email address', '003': 'Invalid captcha' };

      if (email.includes(allowedEmail.split(':')[1].trim())) {
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
