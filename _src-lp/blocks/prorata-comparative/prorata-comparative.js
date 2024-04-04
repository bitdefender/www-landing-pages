import { productAliases } from '../../scripts/scripts.js';
import { updateProductsList } from '../../scripts/utils.js';

export default function decorate(block) {
  const parentSelector = block.closest('.section');
  const metaData = parentSelector.dataset;
  const { product, style } = metaData;
  if (product) {
    updateProductsList(product);
    const [prodName, prodUsers, prodYears] = product.split('/');
    const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;
    const priceBoxTable = block.querySelector('div div:nth-of-type(3) table strong');

    const prodBox = document.createElement('div');
    prodBox.classList.add('prices_box', 'await-loader', 'prodload', `prodload-${onSelectorClass}`);
    prodBox.innerHTML += `<span class="prod-save-box">${priceBoxTable.innerText.replace(' 0', '')} <b class="prod-save save-${onSelectorClass}"></b></span>`;
    prodBox.innerHTML += `<span class="prod-oldprice oldprice-${onSelectorClass}"></span>`;
    prodBox.innerHTML += `<span class="prod-newprice newprice-${onSelectorClass}"></span>`;
    // prodBox.innerHTML += `<div class="buy_box"><a class="red-buy-button buylink-${onSelectorClass} await-loader prodload prodload-${onSelectorClass}" referrerpolicy="no-referrer-when-downgrade">${block.querySelector('div div:nth-of-type(3) table a').innerText}</a></div>`;
    priceBoxTable.innerHTML = prodBox.outerHTML;

    const anchorElement = block.querySelector('div div:nth-of-type(3) table a');
    const newAnchorElement = document.createElement('a');
    newAnchorElement.classList.add(`buylink-${onSelectorClass}`, 'await-loader', `prodload`, `prodload-${onSelectorClass}`);
    newAnchorElement.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    newAnchorElement.textContent = anchorElement.textContent;

    anchorElement.replaceWith(newAnchorElement);

  } else {
    block.innerHTML = 'Product metadata is mandatory';
  }


}
