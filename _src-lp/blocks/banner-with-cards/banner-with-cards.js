import { productAliases } from '../../scripts/scripts.js';
import { updateProductsList } from '../../scripts/utils.js';

function createRadioBoxes(tableRadios, onSelectorClassM, onSelectorClass, idx, radio1, radio2) {
  const radioBoxParent = document.createElement('div');
  radioBoxParent.className = 'radioBoxParent d-flex';

  const createRadioBox = (id, className, name, value, text, type, checked = false) => {
    const radioBox = document.createElement('div');
    radioBox.innerHTML = `<div class="d-radio">
      <input type="radio" id="${id}" data-select="${type}" class="${className}" name="${name}" value="${value}" ${checked ? 'checked="checked"' : ''}>
      <label for="${id}">${text}</label>
    </div>`;
    return radioBox;
  };

  radioBoxParent.appendChild(createRadioBox(`pay_${onSelectorClassM}_${idx}`, `selector-${onSelectorClassM}`, `selectorBox_${idx}`, onSelectorClassM, radio1.textContent, 'monthly', true));
  radioBoxParent.appendChild(createRadioBox(`pay_${onSelectorClass}_${idx}`, `selector-${onSelectorClass}`, `selectorBox_${idx}`, onSelectorClass, radio2.textContent, 'yearly'));

  tableRadios.innerHTML = '';
  tableRadios.appendChild(radioBoxParent);
}

function updatePrices(tablePrices, prodName, tablePricesText, onSelectorClass, onSelectorClassM) {
  // Clear existing content
  tablePrices.innerHTML = '';

  // Function to create and append price boxes
  const createPriceBox = (className, selectorClass) => {
    const pricesBox = document.createElement('div');
    pricesBox.className = `${className} ${prodName}_box prices_box await-loader prodload prodload-${selectorClass}`;
    pricesBox.innerHTML = `<div>
      <div class="display-flex">
        <span class="prod-oldprice oldprice-${selectorClass}"></span>
        <span class="prod-save"> ${tablePricesText} <span class="save-${selectorClass}"></span></span>
        <span class="d-none percent percent-${selectorClass}">0%</span>
      </div>
      <div class="display-flex">
        <span class="prod-newprice newprice-${selectorClass}"></span>
      </div>
    </div>`;
    tablePrices.appendChild(pricesBox);
  };

  // Create yearly and monthly price boxes
  createPriceBox('yearly hide', onSelectorClass);
  createPriceBox('monthly show', onSelectorClassM);
}

function createBuyButtons(tableBuyBtn, prodName, onSelectorClass, onSelectorClassM) {
  const btnText = tableBuyBtn.textContent;

  const createButton = (classSuffix, visibilityClass) => {
    const button = document.createElement('div');
    button.innerHTML = `<a href='#' title='Bitdefender ${prodName}' class='${visibilityClass} red-buy-button await-loader prodload prodload-${classSuffix} buylink-${classSuffix}' referrerpolicy='no-referrer-when-downgrade'>${btnText}</a>`;

    return button.innerHTML;
  };

  const buyButtonYearly = createButton(onSelectorClass, 'yearly hide');
  const buyButtonMonthly = createButton(onSelectorClassM, 'monthly show');

  tableBuyBtn.innerHTML = `${buyButtonYearly} ${buyButtonMonthly}`;
}

function activateRadios(block, type) {
  const allRadios = block.querySelectorAll('input[type="radio"]');
  allRadios.forEach((radio) => {
    const radioID = radio.id;
    block.addEventListener('click', (event) => {
      const { target } = event;
      if (target.tagName === 'INPUT' && target.id === radioID) {
        const select = target.dataset.select;
        let prodBox = target.closest('.prodBox');

        if (typeof type !== 'undefined' && type === 'combined') {
          prodBox = event.target.closest('.hasProds');
          allRadios.forEach((r) => {
            r.checked = (r.dataset.select === select);
          });
        }

        if (prodBox) {
          ['yearly', 'monthly'].forEach((period) => {
            prodBox.querySelectorAll(`.${period}`).forEach((item) => {
              item.classList.toggle('show');
              item.classList.toggle('hide');
            });
          });
        }
      }
    });
  });
}

let counter = 0;
export default function decorate(block) {
  counter += 1;
  // 1st set of variables:
  const parentBlock = block.closest('.section');
  const parentBlockStyle = block.closest('.section').style;
  const blockStyle = block.style;
  const metaData = block.closest('.section').dataset;

  // get Metadatas:
  const {
    products, type, headerColor, textColor, cardsColor, backgroundColor, backgroundHide, paddingTop, paddingBottom, marginTop, bannerHide,
    marginBottom, imageCover, imageHeight, contentSize,
  } = metaData;
  const [contentEl, pictureEl, contentRightEl] = [...block.children];
  const prodBoxesParent = document.createElement('div');

  // config based on Metadatas
  if (block.querySelector('h1')) {
    if (headerColor) block.querySelector('h1').style.color = headerColor;
    block.querySelector('h1').innerHTML = block.querySelector('h1').innerHTML.replace('xx%', '<span class="max-discount"></span>');
  }

  if (backgroundHide) parentBlock.classList.add(`hide-${backgroundHide}`);

  if (backgroundColor) parentBlockStyle.backgroundColor = backgroundColor;
  if (textColor) blockStyle.color = textColor;

  if (paddingTop) blockStyle.paddingTop = `${paddingTop}rem`;
  if (paddingBottom) blockStyle.paddingBottom = `${paddingBottom}rem`;
  if (marginTop) blockStyle.marginTop = `${marginTop}rem`;
  if (marginBottom) blockStyle.marginBottom = `${marginBottom}rem`;

  if (bannerHide) parentBlock.classList.add(`block-hide-${bannerHide}`);

  if (pictureEl && pictureEl.querySelector('img')) {
    parentBlockStyle.background = `url(${pictureEl.querySelector('img').getAttribute('src').split('?')[0]}) no-repeat 0 0 / cover ${backgroundColor || '#000'}`;

    if (imageCover === 'full-right') {
      parentBlockStyle.background = `url(${pictureEl.querySelector('img').getAttribute('src').split('?')[0]}) no-repeat top right / auto ${imageHeight || '100%'} ${backgroundColor || '#000'}`;
    }
  }

  if (contentSize) parentBlock.classList.add(`content-${contentSize}`);

  // if we have set products
  if (products) {
    const productsAsList = products && products.split(',');
    const selectorBox = document.createElement('div');
    selectorBox.className = 'productSelector justify-content-start';

    productsAsList.forEach((prod, idx) => {
      // eslint-disable-next-line prefer-const
      let [prodName, prodUsers, prodYears] = productsAsList[idx].split('/');
      prodName = prodName.trim();
      updateProductsList(prod);
      updateProductsList(prod.replace(prodName, `${prodName}m`));

      const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;
      const onSelectorClassM = `${productAliases(`${prodName}m`)}-${prodUsers}${prodYears}`;

      const contentRightItem = contentRightEl.children[idx];
      if (!contentRightItem) return;
      const [, tableRadios, tablePrices] = contentRightItem.querySelectorAll('table');
      const [radio1, radio2] = tableRadios.querySelectorAll('td');
      const tablePricesText = tablePrices.textContent;
      const tableBuyBtn = contentRightItem.querySelector('table:last-of-type');

      // radios
      createRadioBoxes(tableRadios, onSelectorClassM, onSelectorClass, `${idx}_${counter}`, radio1, radio2);

      // prices:
      updatePrices(tablePrices, prodName, tablePricesText, onSelectorClass, onSelectorClassM);

      // buylink
      createBuyButtons(tableBuyBtn, prodName, onSelectorClass, onSelectorClassM);

      const prodBox = document.createElement('div');
      prodBox.className = `prodBox box-${idx + 1}`;
      if (cardsColor && cardsColor === 'grey') {
        prodBox.style.backgroundColor = '#F6F6F6';
        prodBox.style.boxShadow = 'unset';
        prodBox.style.border = '1px solid #D1D1D1';
      }
      prodBox.innerHTML = contentRightItem.innerHTML;
      prodBoxesParent.appendChild(prodBox);
    });
  }

  // display
  block.innerHTML = `
    <div class="customWrapper d-flex hasProds">
      ${contentEl.textContent.trim() !== '' ? contentEl.innerHTML : ''}
      ${products ? prodBoxesParent.innerHTML : ''}
    </div>
  `;

  // activate radios
  activateRadios(block, type);
}
