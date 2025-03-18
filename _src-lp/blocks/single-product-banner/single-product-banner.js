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
    products, product, textColor, backgroundColor, paddingTop, paddingBottom, marginTop, imageCover, bannerHide,
    marginBottom, preselected, billedYearly, billedMonthly, per, logo, type,
  } = metaData;
  const [contentEl, pictureEl, contentRightEl, boxEl] = [...block.children];

  if (type && type === 'slide') parentBlock.classList.add(type);

  const tablePrices = contentRightEl.querySelector('table');
  const tableBuybtn = contentRightEl.querySelector('table:last-of-type');
  const buyButtonText = tableBuybtn.textContent;

  if (backgroundColor) parentBlockStyle.backgroundColor = backgroundColor;
  if (textColor) blockStyle.color = textColor;

  if (paddingTop) blockStyle.paddingTop = `${paddingTop}rem`;
  if (paddingBottom) blockStyle.paddingBottom = `${paddingBottom}rem`;
  if (marginTop) blockStyle.marginTop = `${marginTop}rem`;
  if (marginBottom) blockStyle.marginBottom = `${marginBottom}rem`;

  if (bannerHide) parentBlock.classList.add(`block-hide-${bannerHide}`);

  let imgPosition = '0 0';
  if (imageCover) {
    imgPosition = `top ${imageCover}`;
  }
  if (pictureEl && pictureEl.querySelector('img')) parentBlockStyle.background = `url(${pictureEl.querySelector('img').getAttribute('src').split('?')[0]}) no-repeat ${imgPosition} / cover ${backgroundColor || '#000'}`;

  [...contentEl.querySelectorAll('table')].forEach((table) => {
    const aliasTr = table.querySelector('tr');

    if (aliasTr && aliasTr.textContent.trim() === 'display') {
      aliasTr.parentNode.removeChild(aliasTr);
      table.style.display = 'block';
    }
  });

  if (products) {
    const productsAsList = products && products.split(',');
    const selectorBox = document.createElement('div');
    selectorBox.className = 'productSelector justify-content-start';
    if (type && type === 'slide') {
      selectorBox.classList.add('slideToggle');
    }
    const selectorBoxOptions = ['yearly', 'monthly'];
    const selectorBoxTexts = Array.from(tablePrices.querySelectorAll('td')).map((td) => td.innerHTML);

    productsAsList.forEach((prod) => updateProductsList(prod));

    productsAsList.forEach((item, idx) => {
      // eslint-disable-next-line prefer-const
      let [prodName, prodUsers, prodYears] = productsAsList[idx].split('/');
      prodName = prodName.trim();
      const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;
      const pricesBox = document.createElement('div');
      let show;
      let checkedOption = 0;
      if (preselected && preselected === 'monthly' && idx === 1) {
        show = 'show';
        checkedOption = 1;
      } else if (preselected && preselected === 'monthly' && idx === 0) {
        show = '';
      } else if (idx === 0) {
        // default selected - yearly
        show = 'show';
      }

      // prices
      let billed = '';
      if (billedYearly) {
        billed = billedYearly.replace('XX', `<span class='d-inline-flex newprice-${onSelectorClass}'></span>`);
      }

      let priceFull = '';
      if (type && type === 'slide') {
        priceFull = `
          <div class="priced">
            <span class='prod-newprice newprice-${onSelectorClass}'></span>
            <span class='prod-oldprice oldprice-${onSelectorClass}'></span>
            <span class='prod-save save-${onSelectorClass} greenTag d-inline'></span>
          </div>`;
      } else {
        priceFull = `
          <div class="d-flex justify-content-center priced">
            <span class='prod-newprice newprice-${onSelectorClass}-monthly'></span><span class="per-month"> /${per}</span>
          </div>`;
      }

      if (prodName.endsWith('m')) {
        billed = billedMonthly.replace('XX', `<span class='d-inline-flex newprice-${onSelectorClass}'></span>`);
        priceFull = `
        <div class="d-flex justify-content-center priced">
        <span class='prod-newprice newprice-${onSelectorClass}'></span><span class="per-month"> /${per}</span>
        </div>`;
      }

      pricesBox.className = `${prodName}_box prices_box ${idx === 0 ? 'yearly' : 'monthly'} ${show} await-loader prodload prodload-${onSelectorClass}`;
      pricesBox.innerHTML = `<div>
        ${priceFull}
        ${billed ? `<div class="d-flex justify-content-center billed">${billed}</div>` : ''}
      </div>`;
      tablePrices.appendChild(pricesBox);

      // checkboxes options:
      let saveText = selectorBoxTexts[idx];
      if (saveText) {
        if (saveText.indexOf('<strong>')) selectorBox.classList.add('bigger');
        saveText = saveText.replace(/<strong>/g, '<span class="greenTag">').replace(/<\/strong>/g, '</span>').replace(/0/g, `<b class='save-${onSelectorClass}'></b>`);
      }

      if (selectorBoxTexts.length >= 2 && saveText.trim() !== '') {
        selectorBox.innerHTML += `
          <div class="d-flex ${idx === 0 ? 'active' : ''}">
            <input type="radio" id="pay_${selectorBoxOptions[idx]}_${counter}" class="selector-${selectorBoxOptions[idx]}" name="selectorBox${counter}" value="${selectorBoxOptions[idx]}" ${idx === checkedOption ? 'checked="check"' : ''}>
              <label for="pay_${selectorBoxOptions[idx]}_${counter}">${saveText}</label>
          </div>
        `;
      }

      if (type && type === 'slide') {
        const parentElement = tablePrices.parentNode; // Get the parent of tablePrices
        parentElement.insertBefore(selectorBox, tablePrices);
      } else {
        tablePrices.appendChild(selectorBox);
      }

      // buylink
      const buyButton = document.createElement('div');
      buyButton.className = `buy_box buy_box_${prodName} ${idx === 0 ? 'yearly' : 'monthly'} ${show}`;
      buyButton.innerHTML = `<a href='#' title='Bitdefender ${onSelectorClass}' class='red-buy-button await-loader prodload prodload-${onSelectorClass} buylink-${onSelectorClass}' referrerpolicy="no-referrer-when-downgrade">${buyButtonText}</a>`;
      tableBuybtn.appendChild(buyButton);
    });
  } else {
    if (!product) return;

    block.classList.add('single-prod');
    updateProductsList(product);

    const [prodName, prodUsers, prodYears] = product.split('/');
    const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;
    const pricesBox = document.createElement('div');

    // prices
    pricesBox.className = `pricesBox await-loader prodload prodload-${onSelectorClass}`;
    pricesBox.innerHTML = `<div class='prod-oldprice oldprice-${onSelectorClass}'></div>`;
    pricesBox.innerHTML += `<div class='prod-newprice newprice-${onSelectorClass}'></div>`;
    tablePrices.appendChild(pricesBox);

    // buylink
    const buyButton = document.createElement('div');
    buyButton.innerHTML = `<a href='#' title='Bitdefender ${onSelectorClass}' class='red-buy-button await-loader prodload prodload-${onSelectorClass} buylink-${onSelectorClass} buylink-${prodName}' referrerpolicy="no-referrer-when-downgrade">${tableBuybtn.textContent}</a>`;
    tableBuybtn.appendChild(buyButton);
    tableBuybtn.style.display = 'none';

    // discount bulina:
    const percentCircle = boxEl.querySelector('strong');
    percentCircle.className = `prod-percent green_bck_circle bigger await-loader prodload prodload-${onSelectorClass}`;
    percentCircle.innerHTML = percentCircle.innerHTML.replace('0%', `<span class='prod-percent percent-${onSelectorClass}'></span>`);
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
      <div class="leftSide col-xs-12 col-sm-12 col-md-5 col-xl-5">
        ${logo ? `<img src="${logo}" alt="Bitdefender" style="margin-bottom: -1em;">` : ''}
        ${contentEl.innerHTML}
      </div>
      <div class="rightSide col-xs-12 col-sm-12 col-md-5 col-xl-4">${contentRightEl.innerHTML}</div>
    </div>
  `;
  }

  const radioGroups = block.querySelectorAll('input[type="radio"]');
  if (radioGroups) {
    radioGroups.forEach((group) => {
      group.addEventListener('change', (event) => {
        block.querySelectorAll('.slideToggle > div').forEach((item) => item.classList.remove('active'));
        event.target.closest('div').classList.add('active');
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
