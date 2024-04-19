import { productAliases } from '../../scripts/scripts.js';
import { updateProductsList } from '../../scripts/utils.js';

export default function decorate(block) {
  // get data attributes set in metaData
  const parentBlock = block.closest('.section');
  const parentBlockStyle = block.closest('.section').style;
  const blockStyle = block.style;
  const metaData = block.closest('.section').dataset;

  // console.log(parentBlockStyle);

  // config new elements
  const {
    products, textColor, backgroundColor, textAlignVertical, imageAlign, paddingTop, paddingBottom, marginTop,
    marginBottom, imageCover, payYearly, payMonthly, save,
  } = metaData;
  const [contentEl, pictureEl, contentRightEl] = [...block.children];

  // console.log(payYearly);

  if (imageCover) {
    parentBlock.classList.add(`bckimg-${imageCover}`);
  }

  if (backgroundColor) parentBlockStyle.backgroundColor = backgroundColor;
  if (textColor) blockStyle.color = textColor;

  if (paddingTop) blockStyle.paddingTop = `${paddingTop}rem`;
  if (paddingBottom) blockStyle.paddingBottom = `${paddingBottom}rem`;
  if (marginTop) blockStyle.marginTop = `${marginTop}rem`;
  if (marginBottom) blockStyle.marginBottom = `${marginBottom}rem`;

  parentBlockStyle.background = `url(${pictureEl.querySelector('img').getAttribute('src').split('?')[0]}) no-repeat top center / 100% ${backgroundColor || '#000'}`;

  const imageCoverVar = imageCover.split('-')[1];
  parentBlockStyle.background = `url(${pictureEl.querySelector('img').getAttribute('src').split('?')[0]}) no-repeat top ${imageCoverVar} / auto 100% ${backgroundColor || '#000'}`;

  let prodYearlyName;
  let prodYearlyUsers;
  let prodYearlyYears;
  let onSelectorClass;

  const productsAsList = products && products.split(',');

  if (productsAsList.length) {
    productsAsList.forEach((prod) => updateProductsList(prod));

    productsAsList.forEach((product, idx) => {
      const [prodName, prodUsers, prodYears] = productsAsList[idx].split('/');
      const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;

    updateProductsList(products);
  
    console.log(products);
    const firstTable = contentRightEl.querySelector("table");
    console.log(firstTable);
    const pricesBox = document.createElement('div');

    pricesBox.id = 'pricesBox';
    pricesBox.className = `prices_box await-loader prodload prodload-${onSelectorClass}`;
    pricesBox.innerHTML += `<div class="d-flex">
      <div>
        <div class="d-flex">
          <span class="prod-oldprice oldprice-${onSelectorClass} mr-2"></span>
          <span class="prod-save d-flex justify-content-center align-items-center save-class">Save <span class="save-${onSelectorClass} "> </span></span>
        </div>
      </div>
      <span class="prod-newprice newprice-${onSelectorClass}"></span>

    </div>`;

    firstTable.innerHTML = '';
    firstTable.appendChild(pricesBox);

  });

  }

  block.innerHTML = `
    <div class="leftSide">${contentEl.innerHTML}</div>
    <div class="rightSide">${contentRightEl.innerHTML}</div>
  `;
}