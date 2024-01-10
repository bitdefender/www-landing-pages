import { productAliases } from '../../scripts/scripts.js';
import { updateProductsList } from '../../scripts/utils.js';

export default function decorate(block) {
  const parentBlock = block.closest('.section');
  const parentBlockStyle = block.closest('.section').style;
  const blockStyle = block.style;
  const metaData = block.closest('.section').dataset;
  const {
    product, products, animatedText, contentSize, backgroundColor, backgroundHide, textColor, underlinedInclinedTextColor, textAlignVertical, imageAlign, paddingTop, paddingBottom, marginTop, marginBottom, imageCover, corners,
  } = metaData;
  const [contentEl, pictureEl, contentRightEl] = [...block.children];

  // tables from left content
  [...contentEl.querySelectorAll('table')].forEach((table) => {
    const aliasTr = table.querySelector('tr'); // 1st tr shoudlk have an identifier alias
    if (aliasTr && aliasTr.innerText.trim() === 'price_box' && product?.length) {
      // add products into the final array
      updateProductsList(product);

      const [prodName, prodUsers, prodYears] = product.split('/');
      const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;
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
          <span class="prod-oldprice oldprice-${onSelectorClass}"></span>
          <span class="prod-newprice newprice-${onSelectorClass}"></span>
        </p>
        <p class="variation">${prices.innerHTML}</p>
      </div>`;
      pricesBox.innerHTML += `<div class="terms">${terms.querySelector('td').innerHTML}</div>`;
      pricesBox.innerHTML += `<div class="buy_box">
        <a class="red-buy-button await-loader prodload prodload-${onSelectorClass} buylink-${onSelectorClass}" href="#" referrerpolicy="no-referrer-when-downgrade">${buybtn.innerHTML}</a>
      </div>`;

      table.innerHTML = '';
      table.appendChild(pricesBox);
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
    });
  }

  if (backgroundColor) parentBlockStyle.backgroundColor = backgroundColor;
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

  if (animatedText) {
    const animatedTextArr = animatedText.split('|');

    const animatedTextBox = document.createElement('div');
    animatedTextBox.className = 'mask';

    animatedTextArr.forEach((item, index) => {
      const rotatingText = document.createElement('span');
      if (index === 0) {
        rotatingText.setAttribute('data-show', '');
      }
      rotatingText.textContent = item.trim();
      animatedTextBox.appendChild(rotatingText);
    });

    // Append the animated text to the content element
    contentEl.innerHTML = contentEl.innerHTML.replace('[animated_text]', animatedTextBox.outerHTML);
  }

  if (imageCover && imageCover === 'small') {
    blockStyle.background = `url(${pictureEl.querySelector('img').getAttribute('src').split('?')[0]}) no-repeat 0 0 / cover ${backgroundColor || '#000'}`;
    block.innerHTML = `
    <div class="container-fluid">
        <div class="row d-none d-lg-flex">
          <div class="col-5 ps-4">${contentEl.innerHTML}</div>
        </div>
        <div class="row d-lg-none justify-content-center">
          <div class="col-12 col-md-7 text-center">${contentEl.innerHTML}</div>
          <div class="col-12 p-0 text-center bck-img">
            ${pictureEl.innerHTML}
          </div>
        </div>
      </div>
    `;
  } else if (imageCover) {
    parentBlockStyle.background = `url(${pictureEl.querySelector('img').getAttribute('src').split('?')[0]}) no-repeat top center / 100% ${backgroundColor || '#000'}`;

    if (imageCover === 'full-left') {
      parentBlockStyle.background = `url(${pictureEl.querySelector('img').getAttribute('src').split('?')[0]}) no-repeat top left / auto 100% ${backgroundColor || '#000'}`;
    } else if (imageCover === 'full-center') {
      parentBlockStyle.background = `url(${pictureEl.querySelector('img').getAttribute('src').split('?')[0]}) no-repeat top center / auto 100% ${backgroundColor || '#000'}`;
    } else if (imageCover === 'full-right') {
      parentBlockStyle.background = `url(${pictureEl.querySelector('img').getAttribute('src').split('?')[0]}) no-repeat top right / auto 100% ${backgroundColor || '#000'}`;
    }

    block.innerHTML = `
    <div class="container-fluid">
      <div class="row d-md-flex d-sm-block justify-content-center">
        <div class="col-12 col-md-${contentSize === 'half' ? '6' : '7'}">${contentEl.innerHTML}</div>
        <div class="col-12 col-md-${contentSize === 'half' ? '6' : '5'}">${contentRightEl.innerHTML}</div>
      </div>
      </div>
    `;
  } else {
    block.innerHTML = `
    <div class="container-fluid">
        <div class="row d-none d-lg-flex">
          <div class="col-5 ps-4">${contentEl.innerHTML}</div>
          <div class="col-7 img-right bck-img">
            ${pictureEl.innerHTML}
          </div>
        </div>
        <div class="row d-lg-none justify-content-center">
          <div class="col-12 p-0 text-center bck-img">
            ${pictureEl.innerHTML}
          </div>
          <div class="col-12 col-md-7 text-center">${contentEl.innerHTML}</div>
        </div>
      </div>
    `;
  }

  if (textAlignVertical) {
    block.querySelector('.row').classList.add(`align-items-${textAlignVertical}`);
  }

  if (imageAlign) {
    block.querySelector('.img-right').style.textAlign = imageAlign;
  }


  if (animatedText) {
    // Get all rotating text elements
    // const rotatingTexts = document.querySelectorAll('.rotating-text');
    setInterval(function () {
      const show = document.querySelector('.mask span[data-show]')
      const next = show.nextElementSibling || document.querySelector('.mask span:first-child')
      const up = document.querySelector('.mask span[data-up]')
      if (up) {
        up.removeAttribute('data-up')
      }
      show.removeAttribute('data-show')
      show.setAttribute('data-up', '')
      next.setAttribute('data-show', '')
    }, 2000);
  }
}
