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
    products, product, textColor, backgroundColor, paddingTop, paddingBottom, marginTop, bannerHide,
    marginBottom, payYearly, payMonthly, billedYearly, billedMonthly, per, buyButtonText,
  } = metaData;
  const [contentEl, pictureEl, contentRightEl, boxEl] = [...block.children];

  const tablePrices = contentRightEl.querySelector('table');
  const tableBuybtn = contentRightEl.querySelector('table:last-of-type');

  if (backgroundColor) parentBlockStyle.backgroundColor = backgroundColor;
  if (textColor) blockStyle.color = textColor;

  if (paddingTop) blockStyle.paddingTop = `${paddingTop}rem`;
  if (paddingBottom) blockStyle.paddingBottom = `${paddingBottom}rem`;
  if (marginTop) blockStyle.marginTop = `${marginTop}rem`;
  if (marginBottom) blockStyle.marginBottom = `${marginBottom}rem`;

  if (bannerHide) parentBlock.classList.add(`block-hide-${bannerHide}`);

  parentBlockStyle.background = `url(${pictureEl.querySelector('img').getAttribute('src').split('?')[0]}) no-repeat 0 0 / cover ${backgroundColor || '#000'}`;

  if (products) {
    const productsAsList = products && products.split(',');
    const selectorBox = document.createElement('div');
    selectorBox.className = 'productSelector justify-content-center';
    const selectorBoxOptions = ['yearly', 'monthly'];
    const selectorBoxTexts = [payYearly, payMonthly];

    productsAsList.forEach((prod) => updateProductsList(prod));

    productsAsList.forEach((product, idx) => {
      // eslint-disable-next-line prefer-const
      let [prodName, prodUsers, prodYears] = productsAsList[idx].split('/');
      prodName = prodName.trim();
      const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;
      const pricesBox = document.createElement('div');

      // prices
      let billed = billedYearly.replace('XX', `<span class='d-inline-flex newprice-${onSelectorClass}'></span>`);
      let priceFull = `<span class='prod-newprice newprice-${onSelectorClass}-monthly'></span><span class="per-month"> /${per}</span>`;
      let prodType = 'yearly';
      let show = '';

      if (prodName.endsWith('m')) {
        billed = billedMonthly.replace('XX', `<span class='d-inline-flex newprice-${onSelectorClass}'></span>`);
        priceFull = `<span class='prod-newprice newprice-${onSelectorClass}'></span><span class="per-month"> /${per}</span>`;
        prodType = 'monthly';
      }

      if (prodType === 'yearly') show = 'show';
      pricesBox.className = `${prodName}_box prices_box ${prodType} ${show} await-loader prodload prodload-${onSelectorClass}`;
      pricesBox.innerHTML = `<div>
        <div class="d-flex justify-content-center priced">${priceFull}</div>
        <div class="d-flex justify-content-center billed">${billed}</div>
      </div>`;
      tablePrices.appendChild(pricesBox);

      // checkboxes options:
      let defaultText;
      const [initialDefaultText, saveText] = selectorBoxTexts[idx].split(',');

      defaultText = initialDefaultText;
      if (saveText) {
        defaultText = `${defaultText} <span class="greenTag">${saveText.replace('0', `<b class="save-${onSelectorClass}"></b>`)}</span>`;
      }

      selectorBox.innerHTML += `
        <div class="d-flex">
          <input type="radio" id="pay_${selectorBoxOptions[idx]}_${counter}" class="selector-${selectorBoxOptions[idx]}" name="selectorBox${counter}" value="${selectorBoxOptions[idx]}" ${idx === 0 ? 'checked="check"' : ''}>
            <label for="pay_${selectorBoxOptions[idx]}_${counter}">${defaultText}</label>
        </div>
      `;
      tablePrices.appendChild(selectorBox);

      // buylink
      const buyButton = document.createElement('div');
      buyButton.className = `buy_box buy_box_${prodName} ${show} ${prodType}`;
      buyButton.innerHTML = `<a href='#' title='Bitdefender ${onSelectorClass}' class='red-buy-button await-loader prodload prodload-${onSelectorClass} buylink-${onSelectorClass}' referrerpolicy="no-referrer-when-downgrade">${buyButtonText}</a>`;
      tableBuybtn.appendChild(buyButton);
    });
  } else {
      if (product) {
        block.classList.add('single-prod');
        updateProductsList(product);

        let [prodName, prodUsers, prodYears] = product.split('/');
        prodName = prodName.trim();
        const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;
        const pricesBox = document.createElement('div');

        // prices
        pricesBox.className = `pricesBox await-loader prodload prodload-${onSelectorClass}`;
        pricesBox.innerHTML = `<div class='prod-oldprice oldprice-${onSelectorClass}'></div>`;
        pricesBox.innerHTML += `<div class='prod-newprice newprice-${onSelectorClass}'></div>`;
        tablePrices.appendChild(pricesBox);

        // buylink
        const buyButton = document.createElement('div');
        buyButton.innerHTML = `<a href='#' title='Bitdefender ${onSelectorClass}' class='red-buy-button await-loader prodload prodload-${onSelectorClass} buylink-${onSelectorClass}' referrerpolicy="no-referrer-when-downgrade">${tableBuybtn.textContent}</a>`;
        tableBuybtn.appendChild(buyButton);
        tableBuybtn.style.display = 'none';

        // discount bulina:
        let percentCircle = boxEl.querySelector('strong');
        percentCircle.className = `prod-percent green_bck_circle bigger await-loader prodload prodload-${onSelectorClass}`;
        percentCircle.innerHTML = percentCircle.innerHTML.replace('0%', `<span class='prod-percent percent-${onSelectorClass}'></span>`);

        // percentCircle.innerHTML = `<span class="prod-percent percent-${onSelectorClass}"></span>`;
    }
  }

  if (boxEl) {
    block.innerHTML = `
    <div class="customWrapper d-block d-md-flex d-md-flex d-xl-flex hasBox">
      <div class="boxSide col-xs-12 col-sm-12 col-md-4 col-xl-4">
        ${boxEl.innerHTML}
      </div>
      <div class="leftSide col-xs-12 col-sm-12 col-md-4 col-xl-4">
        ${contentEl.innerHTML}
      </div>
      <div class="rightSide col-xs-12 col-sm-12 col-md-4 col-xl-4">
        ${contentRightEl.innerHTML}
      </div>
    </div>
  `;
  } else {
    block.innerHTML = `
    <div class="customWrapper d-block d-md-flex d-md-flex d-xl-flex">
      <div class="leftSide col-xs-12 col-sm-12 col-md-5 col-xl-5">${contentEl.innerHTML}</div>
      <div class="rightSide col-xs-12 col-sm-12 col-md-5 col-xl-4">${contentRightEl.innerHTML}</div>
    </div>
  `;
  }

  const radioGroups = block.querySelectorAll('input[type="radio"]');
  if (radioGroups) {
    radioGroups.forEach((group) => {
      group.addEventListener('change', (event) => {
        if (['.selector-yearly', '.selector-monthly'].some((selector) => event.target.matches(selector))) {
          ['yearly', 'monthly'].forEach((period) => {
            block.querySelector(`.prices_box.${period}`)?.classList.toggle('show');
            block.querySelector(`.buy_box.${period}`)?.classList.toggle('show');
          });
        }
      });
    });
  }
}
