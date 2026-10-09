import { parseStoreProduct, wrapChildrenWithProduct } from '../../scripts/utils.js';

/**
 * The buy buttons repeat the products of the b-productswithselectors block on the page,
 * so they follow its devices / years selectors.
 * @param {HTMLElement} block
 */
function followProductsSelectors(block) {
  const optionAttributes = { users: 'devices', years: 'subscription' };

  document.addEventListener('change', (event) => {
    const select = event.target.closest?.('.b-productswithselectors select[data-trigger]');
    const attribute = optionAttributes[select?.dataset.trigger];
    if (!attribute || !select.value) return;

    block.querySelectorAll('bd-option').forEach((option) => {
      option.setAttribute(attribute, select.value);
    });
  });
}

export default function decorate(block) {
  /// ///////////////////////////////////////////////////////////////////////
  // get data attributes set in metaData
  const parentSelector = block.closest('.section');
  const metaData = parentSelector.dataset;
  const {
    products, buttonText3, buttonText2, buttonText,
  } = metaData;
  const productsAsList = products?.split(',') || [];
  const allChildren = block.children[0].children;

  for (let i = 1; i < allChildren.length; i += 1) {
    if (typeof productsAsList[i - 1] !== 'undefined') {
      const {
        productId, devices, subscription, trialDuration,
      } = parseStoreProduct(productsAsList[i - 1]);
      const buyLinkAttributes = `data-store-render data-store-buy-link="${trialDuration}"`;
      const buylink = document.createElement('span');
      let hasAuthoredLink = false;

      if (i === 2 && buttonText2) {
        // btn 2
        const [btn2txt, btn2link] = buttonText2.split(',');
        hasAuthoredLink = Boolean(btn2link);
        buylink.innerHTML += `<a class="red-buy-button await-loader" ${btn2link ? `href="${btn2link}"` : buyLinkAttributes} data-type="buy-btn" referrerpolicy="no-referrer-when-downgrade">${btn2txt}</a>`;
      } else if (i === 3 && buttonText3) {
        // btn 3
        const [btn3txt, btn3link] = buttonText3.split(',');
        hasAuthoredLink = Boolean(btn3link);
        buylink.innerHTML += `<a class="red-buy-button await-loader" ${btn3link ? `href="${btn3link}"` : buyLinkAttributes} data-type="buy-btn" referrerpolicy="no-referrer-when-downgrade">${btn3txt}</a>`;
      } else if (buttonText) {
        // default
        const [btn1txt, btn1link] = buttonText.split(',');
        hasAuthoredLink = Boolean(btn1link);
        buylink.innerHTML += `<a class="red-buy-button await-loader" ${btn1link ? `href="${btn1link}"` : buyLinkAttributes} data-type="buy-btn" referrerpolicy="no-referrer-when-downgrade">${btn1txt}</a>`;
      } else {
        buylink.innerHTML += `<a class="red-buy-button await-loader" ${buyLinkAttributes} data-type="buy-btn" referrerpolicy="no-referrer-when-downgrade">Buy Now</a>`;
      }

      if (!hasAuthoredLink) {
        // the same products are already counted by b-productswithselectors, so no analytics event here
        wrapChildrenWithProduct(buylink, {
          productId, devices, subscription, storeEvent: '',
        });
      }

      allChildren[i].prepend(buylink);
    }
  }

  followProductsSelectors(block);
}
