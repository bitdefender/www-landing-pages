import { parseStoreProduct, wrapChildrenWithProduct } from '../../scripts/utils.js';

export default function decorate(block) {
  const parentSelector = block.closest('.section');
  const metaData = parentSelector.dataset;
  const { product, active } = metaData;
  let activeProd = 1;

  if (active) {
    parentSelector.classList.add(`active-${active}`);
    activeProd = Number(active);
  }

  if (product) {
    // add the prod
    const {
      productId, devices, subscription, trialDuration,
    } = parseStoreProduct(product);
    const priceBoxTable = block.querySelector(`div div:nth-of-type(${activeProd + 1}) table strong`);
    const productColumn = priceBoxTable?.closest('.prorata-comparative > div > div');

    if (priceBoxTable) {
      // create ProdBox
      const prodBox = document.createElement('div');
      prodBox.classList.add('prices_box', 'await-loader');
      prodBox.innerHTML += `<span class="prod-save-box">${priceBoxTable.innerText.replace(' 0', '')} <b class="prod-save" data-store-render data-store-discount="value"></b></span>`;
      prodBox.innerHTML += '<span class="prod-oldprice" data-store-render data-store-price="full"></span>';
      prodBox.innerHTML += '<span class="prod-newprice" data-store-render data-store-price="discounted||full"></span>';
      priceBoxTable.innerHTML = prodBox.outerHTML;

      // without a discount the whole price box was removed
      const noDiscountHide = '!it.option.price.discounted';
      const priceParagraph = priceBoxTable.closest('p');
      if (priceParagraph) {
        priceParagraph.setAttribute('data-store-hide', noDiscountHide);
      } else {
        priceBoxTable.querySelector('.prod-oldprice').setAttribute('data-store-hide', noDiscountHide);
        priceBoxTable.querySelector('.prod-save-box').setAttribute('data-store-hide', noDiscountHide);
        priceBoxTable.querySelector('.prod-save-box').setAttribute('data-store-hide-type', 'visibility');
      }
    }

    // replace anchor
    const anchorElement = block.querySelector(`div div:nth-of-type(${activeProd + 1}) table a`);
    if (anchorElement) {
      const newAnchorElement = document.createElement('a');
      newAnchorElement.classList.add('await-loader');
      newAnchorElement.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      newAnchorElement.setAttribute('data-store-render', '');
      newAnchorElement.setAttribute('data-store-buy-link', trialDuration);
      newAnchorElement.textContent = anchorElement.textContent;
      anchorElement.replaceWith(newAnchorElement);
    }

    // the price box and the buy button live in the same column
    const buyColumn = block.querySelector('[data-store-buy-link]')?.closest('.prorata-comparative > div > div');
    const storeProperties = {
      productId,
      devices,
      subscription,
    };
    if (productColumn) {
      wrapChildrenWithProduct(productColumn, { ...storeProperties, storeEvent: 'info' });
    }
    if (buyColumn && buyColumn !== productColumn) {
      wrapChildrenWithProduct(buyColumn, storeProperties);
    }
  } else {
    block.innerHTML = 'Product metadata is mandatory';
  }
}
