import { productAliases } from '../../scripts/scripts.js';
import { updateProductsList } from '../../scripts/utils.js';

export default function decorate(block) {
  /// ///////////////////////////////////////////////////////////////////////
  // get data attributes set in metaData
  const parentSelector = block.parentNode.parentNode;
  const metaData = parentSelector.dataset;
  const {
    backgroundColor, title, subtitle, titlePosition, products, bulinaText, marginTop, marginBottom, paddingTop, paddingBottom,
  } = metaData;
  const productsAsList = products && products.split(',');

  if (productsAsList.length) {
    /// ///////////////////////////////////////////////////////////////////////
    // set the background-color
    if (backgroundColor) parentSelector.style.backgroundColor = backgroundColor;

    // set the title
    if (title) {
      const divTagTitle = document.createElement('div');
      divTagTitle.classList = `top_title ${typeof titlePosition !== 'undefined' ? `p_${titlePosition}` : ''}`;

      // adding title
      divTagTitle.innerHTML = document.querySelectorAll('h1').length === 0 ? `<h1>${title}</h1>` : `<h2>${title}</h2>`;

      // adding subtitle
      if (subtitle) {
        divTagTitle.innerHTML += `<h2>${subtitle}</h2>`;
      }

      block.parentNode.prepend(divTagTitle);
    }

    if (marginTop) parentSelector.style.marginTop = `${marginTop}rem`;
    if (marginBottom) parentSelector.style.marginBottom = `${marginBottom}rem`;
    if (paddingTop) parentSelector.style.paddingTop = `${paddingTop}rem`;
    if (paddingBottom) parentSelector.style.paddingBottom = `${paddingBottom}rem`;

    /// ///////////////////////////////////////////////////////////////////////
    // check and add products into the final array
    productsAsList.forEach((prod) => updateProductsList(prod));

    /// ///////////////////////////////////////////////////////////////////////
    // set top class with numbers of products
    parentSelector.classList.add(`has${productsAsList.length}boxes`);

    /// ///////////////////////////////////////////////////////////////////////
    // create procent - bulina
    if (typeof bulinaText !== 'undefined') {
      const bulinaSplitted = bulinaText.split(',');
      let divBulina = `<div class='prod-percent green_bck_circle bigger has${bulinaSplitted.length}txt'>`;
      bulinaSplitted.forEach((item, idx) => {
        let newItem = item;
        if (item.indexOf('0%') !== -1) {
          newItem = item.replace(/0%/g, '<b class=\'max-discount\'></b>');
        }
        divBulina += `<span class='bulina_text${idx + 1}'>${newItem}</span>`;
      });
      divBulina += '</div>';

      // add to the previous element
      if (block.parentNode.querySelector('.top_title')) {
        block.parentNode.querySelector('.top_title').innerHTML += divBulina;
      } else {
        block.parentNode.parentNode.previousElementSibling.innerHTML += divBulina;
      }
    }

    /// ///////////////////////////////////////////////////////////////////////
    // create prices sections
    productsAsList.forEach((item, idx) => {
      const prodBox = block.children[idx];
      const [prodName, prodUsers, prodYears] = productsAsList[idx].split('/');
      const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;
      const pricesDiv = document.createElement('div');
      const saveText = prodBox?.querySelector('table:nth-of-type(2)').innerText.trim();
      const firstYearText = prodBox?.querySelector('table:nth-of-type(3)').innerText.trim();

      pricesDiv.classList = `prices_box await-loader prodload prodload-${onSelectorClass}`;
      if (saveText && saveText.indexOf('0') !== -1) {
        pricesDiv.innerHTML += `<p class="save-green-pill">
          ${saveText.replace(/0/g, `<span class="save-${onSelectorClass}"></span>`)}
        </p>`;
      } else {
        pricesDiv.innerHTML += `<span>${saveText}</span>`;
      }
      pricesDiv.innerHTML += `<span class="prod-newprice newprice-${onSelectorClass}"></span>`;
      pricesDiv.innerHTML += `<span class="prod-oldprice oldprice-${onSelectorClass}"></span>`;

      if (firstYearText) pricesDiv.innerHTML += `<span class="first_year">${firstYearText}</span>`;

      prodBox.querySelector('table:nth-of-type(3)').innerHTML = '';
      prodBox.querySelector('table').after(pricesDiv);

      /// ///////////////////////////////////////////////////////////////////////
      // adding top tag to each box
      let tagTextKey = `tagText${idx}`;
      if (idx === 0) {
        tagTextKey = 'tagText';
      }
      if (metaData[tagTextKey]) {
        const divTag = document.createElement('div');
        divTag.innerHTML = metaData[tagTextKey].indexOf('0%') !== -1 || metaData[tagTextKey].indexOf('0 %') !== -1 ? metaData[tagTextKey].replace(/0\s*%/g, `<span class="percent-${onSelectorClass}"></span>`) : metaData[tagTextKey];
        divTag.className = 'tag';
        // prodBox.parentNode.querySelector(`p:nth-child(1)`).before(divTag);
        prodBox?.querySelector('div').before(divTag);
      }

      /// ////////////////////////////////////////////////////////////////////////
      // add buybtn div & anchor
      const tableBuybtn = prodBox?.querySelector('table:last-of-type');

      const aBuybtn = document.createElement('a');
      aBuybtn.innerHTML = tableBuybtn?.innerHTML.replace(/0%/g, `<span class="percent percent-${onSelectorClass}"></span>`);
      aBuybtn.className = `red-buy-button buylink-${onSelectorClass} await-loader prodload prodload-${onSelectorClass}`;
      aBuybtn.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      aBuybtn.setAttribute('title', 'Buy Now Bitdefender');

      const divBuybtn = document.createElement('div');
      divBuybtn.classList.add('buybtn_box', 'buy_box', `buy_box${idx + 1}`);
      divBuybtn.appendChild(aBuybtn);
      tableBuybtn?.before(divBuybtn);

      /// ///////////////////////////////////////////////////////////////////////
      // removing last table
      tableBuybtn?.remove();

      // add prod class on block
      prodBox?.classList.add(`${onSelectorClass}_box`, 'prod_box');
      prodBox?.setAttribute('data-testid', 'prod_box');
    });
  }
}
