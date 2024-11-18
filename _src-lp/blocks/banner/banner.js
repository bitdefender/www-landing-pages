import { detectModalButtons, productAliases, isView } from '../../scripts/scripts.js';
import { updateProductsList } from '../../scripts/utils.js';

export default function decorate(block) {
  const parentBlock = block.closest('.section');
  const parentBlockStyle = block.closest('.section').style;
  const blockStyle = block.style;
  const metaData = block.closest('.section').dataset;
  const {
    product, products, animatedText, contentSize, backgroundColor, backgroundColorGradient, innerBackgroundColor, backgroundHide, bannerHide, textColor,
    underlinedInclinedTextColor, textAlignVertical, imageAlign, paddingTop, paddingBottom, marginTop,
    marginBottom, imageCover, corners, textNextToPill, isCampaign,
  } = metaData;
  const [contentEl, pictureEl, contentRightEl] = [...block.children];
  const isDesktop = isView('desktop');

  if (imageCover) {
    parentBlock.classList.add(`bckimg-${imageCover}`);
  }

  // table from left content
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
          XX: `newprice-${onSelectorClass}`,
          YY: `save-${onSelectorClass}`,
          ZZ: `oldprice-${onSelectorClass}`,
        };

        Object.keys(replacements).forEach((key) => {
          const value = replacements[key];
          if (titlePrices.textContent.indexOf(key) !== -1) {
            const regex = new RegExp(key, 'g');
            titlePrices.innerHTML = titlePrices.innerHTML.replace(regex, `<span class="${value}"></span>`);
          }
        });

        titleBox.innerHTML = titlePrices.innerHTML;
      }

      table.innerHTML = '';
      table.appendChild(titleBox);
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
        if (buybtn && (buybtn.textContent.indexOf('0%') !== -1 || buybtn.innerHTML.indexOf('0 %') !== -1)) {
          buybtn.innerHTML = buybtn.textContent.replace(/0\s*%/g, `<span class="percent-${onSelectorClass}"></span>`);
        }

        pricesBox.id = 'pricesBox';
        pricesBox.className = `prices_box await-loader prodload prodload-${onSelectorClass}`;
        pricesBox.innerHTML += `<div class="d-flex">
          <p>
          <div>
            <div class="d-flex">
              <span class="prod-oldprice oldprice-${onSelectorClass} mr-2"></span>
              <span class="prod-save d-flex justify-content-center align-items-center save-class">${save.textContent} <span class="save-${onSelectorClass} "> </span></span>
            </div>
            </p>
            <div class="d-flex">
              <span class="prod-newprice newprice-${onSelectorClass}"></span>
              <p class="variation">${prices.innerHTML}</p>
            </div>
        </div>`;

        pricesBox.innerHTML += `<div class="terms">${terms.querySelector('td').innerHTML}</div>`;
        pricesBox.innerHTML += `<div class="buy_box">
          <a class="red-buy-button await-loader prodload prodload-${onSelectorClass} buylink-${onSelectorClass}" href="#" referrerpolicy="no-referrer-when-downgrade">${buybtn ? buybtn.innerHTML : 'Get it now'}</a>
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
        (link || text).innerHTML = text.innerText.replace(/0\s*%/g, `<strong class="percent-${onSelectorClass}"></strong>`);
      }

      greenPillBox.id = 'greenPillBox';
      greenPillBox.className = `green_pill_box await-loader prodload prodload-${onSelectorClass}`;
      greenPillBox.innerHTML += `<span>${text.innerHTML}</span>`;

      // replace the table with greenPillBox in the exact same position
      const parentElement = table.parentElement;
      parentElement.replaceChild(greenPillBox, table);
    }

    // RED_PILL_BOX
    if (aliasTr && aliasTr.textContent.trim() === 'red_pill') {
      const [, text] = [...table.querySelectorAll('tr')];
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
    if (aliasTr && aliasTr.textContent.trim() === 'buybtn_and_green_circle') {
      // eslint-disable-next-line no-unused-vars
      const [alias, buybtnText] = [...table.querySelectorAll('tr')];
      const [buybtn, text] = [...buybtnText.querySelectorAll('tr td')];
      const greenCircleBox = document.createElement('div');

      if (text && text.innerText !== '' && (text.innerText.indexOf('0%') !== -1 || text.innerText.indexOf('0 %') !== -1)) {
        text.innerHTML = text.innerText.replace(/0\s*%/g, `<strong class="percent-${onSelectorClass}"></strong>`);
      }

      if (buybtn && buybtn.innerText && buybtn.innerText !== '' && (buybtn.innerText.indexOf('0%') !== -1 || buybtn.innerText.indexOf('0 %') !== -1)) {
        buybtn.innerHTML = buybtn.innerText.replace(/0\s*%/g, `<span class="percent-${onSelectorClass}"></span>`);
      }

      greenCircleBox.id = 'buyBtnGreenCircleBox';
      greenCircleBox.className = `d-flex buybtn_green_circle_box await-loader prodload prodload-${onSelectorClass}`;
      if (buybtn) {
        if (buybtn.innerHTML.includes('<a')) {
          buybtn.querySelector('a').className = 'button primary';
          greenCircleBox.innerHTML += buybtn.innerHTML;
        } else {
          greenCircleBox.innerHTML += `<a class="buylink-${onSelectorClass} button primary" referrerpolicy="no-referrer-when-downgrade" title="${buybtn.innerText.trim()} Bitdefender" href="#">
            <strong>${buybtn.innerHTML}</strong>
          </a>`;
        }
      }

      if (text && text.innerHTML !== '') {
        greenCircleBox.innerHTML += `<span class="green_circle_box">${text.innerHTML}</span>`;
      }

      table.innerHTML = '';
      table.appendChild(greenCircleBox);
    }

    // GREEN_CIRCLE_BOX
    if (aliasTr && aliasTr.textContent.trim() === 'percent_circle') {
      // eslint-disable-next-line no-unused-vars
      const textContent = table.querySelector('tr:nth-of-type(2)')?.innerText.trim();
      const greenCircleBox = document.createElement('div');

      greenCircleBox.id = 'buyBtnGreenCircleBox';
      greenCircleBox.className = `d-flex buybtn_green_circle_box await-loader prodload prodload-${onSelectorClass}`;

      if (textContent?.includes('0%') || textContent?.includes('0 %')) {
        greenCircleBox.innerHTML = `
          <span class='green_circle_box v2'>
            ${textContent.replace(/0\s*%/g, `<strong class='max-discount'></strong>`)}
          </span>
        `;
      }

      table.replaceChildren(greenCircleBox);
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
    if (backgroundColorGradient) {
      if (isDesktop) {
        blockStyle.background = `url(${pictureEl.querySelector('img')?.getAttribute('src').split('?')[0]}), linear-gradient(to bottom, ${backgroundColorGradient.replace(' ', ',')})`;
        blockStyle.backgroundSize = 'cover';
        blockStyle.backgroundPosition = '0 0';
        blockStyle.backgroundRepeat = 'no-repeat';
        blockStyle.backgroundBlendMode = 'unset';
      } else {
        blockStyle.background = `linear-gradient(to bottom, ${backgroundColorGradient.replace(' ', ',')}) !important`;
      }
    } else {
      blockStyle.background = `url(${pictureEl.querySelector('img')?.getAttribute('src').split('?')[0]}) no-repeat 0 0 / cover ${innerBackgroundColor || '#000'}`;
    }

    const imageCoverVar = imageCover.split('-')[1];
    if (imageCoverVar) {
      if (backgroundColorGradient) {
        if (isDesktop) {
          blockStyle.background = `url(${pictureEl.querySelector('img')?.getAttribute('src').split('?')[0]}), linear-gradient(to bottom, ${backgroundColorGradient.replace(' ', ',')})`;
          blockStyle.backgroundSize = 'auto 100%';
          blockStyle.backgroundPosition = `top ${imageCoverVar}`;
          blockStyle.backgroundRepeat = 'no-repeat';
          blockStyle.backgroundBlendMode = 'unset';
        } else {
          blockStyle.background = `linear-gradient(to bottom, ${backgroundColorGradient.replace(' ', ',')}) !important`;
        }
      } else {
        blockStyle.background = `url(${pictureEl.querySelector('img')?.getAttribute('src').split('?')[0]}) no-repeat top ${imageCoverVar} / auto 100% ${innerBackgroundColor || '#000'}`;
      }
    }

    let defaultSize = 'col-sm-6 col-md-6 col-lg-5';
    if (contentSize === 'full') {
      defaultSize = 'col-sm-12 col-md-12 col-lg-12';
    } else if (contentSize === 'larger') {
      defaultSize = 'col-sm-7 col-md-7 col-lg-7';
    } else if (contentSize === 'half') {
      defaultSize = 'col-sm-6 col-md-6 col-lg-6';
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
    if (backgroundColorGradient) {
      if (isDesktop) {
        parentBlockStyle.background = `url(${pictureEl.querySelector('img')?.getAttribute('src').split('?')[0]}), linear-gradient(to bottom, ${backgroundColorGradient.replace(' ', ',')})`;
        parentBlockStyle.backgroundSize = 'cover';
        parentBlockStyle.backgroundPosition = 'top right';
        parentBlockStyle.backgroundRepeat = 'no-repeat';
        parentBlockStyle.backgroundBlendMode = 'unset';
      } else {
        parentBlockStyle.background = `linear-gradient(to bottom, ${backgroundColorGradient.replace(' ', ',')})`;
      }
    } else {
      parentBlockStyle.background = `url(${pictureEl.querySelector('img')?.getAttribute('src').split('?')[0]}) no-repeat top center / 100% ${backgroundColor || '#000'}`;
    }

    const imageCoverVar = imageCover.split('-')[1];
    if (imageCoverVar) {
      if (backgroundColorGradient) {
        if (isDesktop) {
          parentBlockStyle.background = `url(${pictureEl.querySelector('img')?.getAttribute('src').split('?')[0]}), linear-gradient(to bottom, ${backgroundColorGradient.replace(' ', ',')})`;
          parentBlockStyle.backgroundSize = 'auto 100%';
          parentBlockStyle.backgroundPosition = `top ${imageCoverVar}`;
          parentBlockStyle.backgroundRepeat = 'no-repeat';
          parentBlockStyle.backgroundBlendMode = 'unset';
        } else {
          parentBlockStyle.background = `linear-gradient(to bottom, ${backgroundColorGradient.replace(' ', ',')})`;
        }
      } else {
        parentBlockStyle.background = `url(${pictureEl.querySelector('img')?.getAttribute('src').split('?')[0]}) no-repeat top ${imageCoverVar} / auto 100% ${backgroundColor || '#000'}`;
      }
    }

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
    let defaultSize = 'col-sm-5 col-md-5 col-lg-5';
    if (contentSize === 'larger') {
      defaultSize = 'col-sm-7 col-md-7 col-lg-7';
    } else if (contentSize === 'half') {
      defaultSize = 'col-sm-6 col-md-6 col-lg-6';
    }

    block.innerHTML = `
    <div class="container-fluid">
      <div class="row d-block d-sm-flex d-md-flex d-lg-flex position-relative">
        <div class="col-12 d-block d-sm-block d-md-none d-lg-none p-0 text-center bck-img">
            ${pictureEl.innerHTML}
        </div>

        <div class="col-xs-12 ${defaultSize} ps-4">${contentEl.innerHTML}</div>

        <div class="${defaultSize ? 'col-5' : 'col-7'} d-none d-sm-none d-md-block d-lg-block img-right bck-img">
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

  detectModalButtons(block);
}
