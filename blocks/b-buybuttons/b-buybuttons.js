import { productAliases } from '../../scripts/scripts.js';

export default function decorate(block) {
  /// ///////////////////////////////////////////////////////////////////////
  // get data attributes set in metaData
  const parentSelector = block.closest('.section');
  const metaData = parentSelector.dataset;
  const { products, buttonText } = metaData;
  const productsList = products.split(',');
  const allChildren = block.children[0].children;

  for (let i = 1; i < allChildren.length; i += 1) {
    if (typeof productsList[i - 1] !== 'undefined') {
      const [prodName, prodUsers, prodYears] = productsList[i - 1].split('/');
      const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;

      const buylink = document.createElement('a');
      buylink.className = `red-buy-button buylink-${onSelectorClass} awaitLoader prodLoad prodLoad-${onSelectorClass}`;
      buylink.setAttribute('data-type', 'buy-btn');
      buylink.textContent = buttonText;
      allChildren[i].prepend(buylink);
    }
  }
}
