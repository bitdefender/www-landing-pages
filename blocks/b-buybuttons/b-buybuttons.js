import { productAliases } from '../../scripts/scripts.js';

export default function decorate(block) {
  /// ///////////////////////////////////////////////////////////////////////
  // get data attributes set in metaData
  const parentSelector = block.closest('.section');
  const metaData = parentSelector.dataset;
  const {
    products, buttonText3, buttonText2, buttonText,
  } = metaData;
  const productsList = products.split(',');
  const allChildren = block.children[0].children;

  for (let i = 1; i < allChildren.length; i += 1) {
    if (typeof productsList[i - 1] !== 'undefined') {
      const [prodName, prodUsers, prodYears] = productsList[i - 1].split('/');
      const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;
      const buylink = document.createElement('span');

      if (i === 2 && buttonText2) {
        // btn 2
        const [btn2txt, btn2link] = buttonText2.split(',');
        buylink.innerHTML += `<a class="red-buy-button await-loader prodload prodload-${onSelectorClass} ${!btn2link ? `buylink-${onSelectorClass}` : ''}" ${btn2link ? `href="${btn2link}"` : ''} data-type="buy-btn">${btn2txt}</a>`;
      } else if (i === 3 && buttonText3) {
        // btn 3
        const [btn3txt, btn3link] = buttonText3.split(',');
        buylink.innerHTML += `<a class="red-buy-button await-loader prodload prodload-${onSelectorClass} ${!btn3link ? `buylink-${onSelectorClass}` : ''}" ${btn3link ? `href="${btn3link}"` : ''} data-type="buy-btn">${btn3txt}</a>`;
      } else if (buttonText) {
        // default
        const [btn1txt, btn1link] = buttonText.split(',');
        buylink.innerHTML += `<a class="red-buy-button await-loader prodload prodload-${onSelectorClass} ${!btn1link ? `buylink-${onSelectorClass}` : ''}" ${btn1link ? `href="${btn1link}"` : ''} data-type="buy-btn">${btn1txt}</a>`;
      } else {
        buylink.innerHTML += `<a class="red-buy-button await-loader prodload prodload-${onSelectorClass} buylink-${onSelectorClass}" data-type="buy-btn">Buy Now</a>`;
      }

      allChildren[i].prepend(buylink);
    }
  }
}
