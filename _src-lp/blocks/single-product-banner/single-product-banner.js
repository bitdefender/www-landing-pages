import { productAliases } from '../../scripts/scripts.js';
import { updateProductsList } from '../../scripts/utils.js';

let counter = 0;

export default function decorate(block) {
  counter += 1;
  // get data attributes set in metaData
  const parentBlock = block.closest('.section');
  const parentBlockStyle = block.closest('.section').style;
  const blockStyle = block.style;
  const metaData = block.closest('.section').dataset;

  // config new elements
  const {
    products, textColor, backgroundColor, paddingTop, paddingBottom, marginTop, bannerHide,
    marginBottom, payYearly, payMonthly, billedYearly, billedMonthly, per, buyButtonText,
  } = metaData;
  const [contentEl, pictureEl, contentRightEl] = [...block.children];

  if (backgroundColor) parentBlockStyle.backgroundColor = backgroundColor;
  if (textColor) blockStyle.color = textColor;

  if (paddingTop) blockStyle.paddingTop = `${paddingTop}rem`;
  if (paddingBottom) blockStyle.paddingBottom = `${paddingBottom}rem`;
  if (marginTop) blockStyle.marginTop = `${marginTop}rem`;
  if (marginBottom) blockStyle.marginBottom = `${marginBottom}rem`;

  if (bannerHide) parentBlock.classList.add(`block-hide-${bannerHide}`);

  parentBlockStyle.background = `url(${pictureEl.querySelector('img').getAttribute('src').split('?')[0]}) no-repeat 0 0 / cover ${backgroundColor || '#000'}`;

  const productsAsList = products && products.split(',');

  if (productsAsList.length) {
    productsAsList.forEach((prod) => updateProductsList(prod));

    productsAsList.forEach((product, idx) => {
      // eslint-disable-next-line prefer-const
      let [prodName, prodUsers, prodYears] = productsAsList[idx].split('/');
      prodName = prodName.trim();
      const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;
      const firstTable = contentRightEl.querySelector('table:first-of-type');
      const pricesBox = document.createElement('div');

      let billed = billedYearly.replace('XX', `<span class='d-inline-flex newprice-${onSelectorClass}'></span>`);
      let priceFull = `<span class='prod-newprice newprice-${onSelectorClass}-monthly'></span><span class="per-month"> /${per}</span>`;
      let prodType = 'yearly';
      if (prodName.endsWith('m')) {
        billed = billedMonthly.replace('XX', `<span class='d-inline-flex price-${onSelectorClass}'></span>`);
        priceFull = `<span class='prod-newprice newprice-${onSelectorClass}'></span><span class="per-month"> /${per}</span>`;
        prodType = 'monthly';
      }

      pricesBox.className = `${prodName}_box prices_box ${prodType} await-loader prodload prodload-${onSelectorClass}`;
      pricesBox.innerHTML = `<div>
        <div class="d-flex justify-content-center priced">${priceFull}</div>
        <div class="d-flex justify-content-center billed">${billed}</div>
      </div>`;

      firstTable.appendChild(pricesBox);

      const tableBuybtn = contentRightEl.querySelector('table:last-of-type');
      const buyButton = document.createElement('div');
      buyButton.className = `buy_box buy_box_${prodName} ${prodType}`;
      buyButton.innerHTML = `<a href='#' title='Bitdefender ${onSelectorClass}' class='red-buy-button await-loader prodload prodload-${onSelectorClass} buylink-${onSelectorClass}' referrerpolicy="no-referrer-when-downgrade">${buyButtonText}</a>`;
      tableBuybtn.appendChild(buyButton);
    });

    const firstTable = contentRightEl.querySelector('table:first-of-type');
    const selectorBox = document.createElement('div');
    selectorBox.innerHTML = `<div class="productSelector justify-content-center">
        <div class="d-flex justify-content-center"><input type="radio" id="pay_yearly_${counter}" class="selectorYearly" name="selectorBox${counter}" value="yearly" checked="check"><label for="pay_yearly_${counter}">${payYearly}</label></div>
        <div class="d-flex justify-content-center"><input type="radio" id="pay_monthly_${counter}" class="selectorMonthly" name="selectorBox${counter}" value="monthly"><label for="pay_monthly_${counter}">${payMonthly}</label></div>
      </div>`;
    firstTable.appendChild(selectorBox);
  }

  block.innerHTML = `
    <div class="leftSide">${contentEl.innerHTML}</div>
    <div class="rightSide">${contentRightEl.innerHTML}</div>
  `;

  const selectorYearly = block.querySelector('input[value="yearly"');
  const selectorMonthly = block.querySelector('input[value="monthly"]');
  const prodBoxYearly = block.querySelector('.prices_box.yearly');
  const prodBoxMonthly = block.querySelector('.prices_box.monthly');
  const buyBtnYearly = block.querySelector('.buy_box.yearly');
  const buyBtnMonthly = block.querySelector('.buy_box.monthly');
  function showYearlyElements() {
    prodBoxYearly.style.display = 'block';
    prodBoxMonthly.style.display = 'none';
    buyBtnYearly.style.display = 'block';
    buyBtnMonthly.style.display = 'none';
  }
  function showMonthlyElements() {
    prodBoxYearly.style.display = 'none';
    prodBoxMonthly.style.display = 'block';
    buyBtnYearly.style.display = 'none';
    buyBtnMonthly.style.display = 'block';
  }

  selectorYearly.addEventListener('change', showYearlyElements);
  selectorMonthly.addEventListener('change', showMonthlyElements);

  // Initial check: Show elements based on the checked radio button
  if (selectorYearly.checked) {
    showYearlyElements();
  } else {
    showMonthlyElements();
  }
}
