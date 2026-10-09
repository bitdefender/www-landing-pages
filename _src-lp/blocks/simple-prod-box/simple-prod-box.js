import { parseStoreProduct, wrapChildrenWithProduct } from '../../scripts/utils.js';

export default function decorate(block) {
  const metaData = block.closest('.section').dataset;
  const {
    product, priceType,
  } = metaData;
  const [icon, title, subtitle, text, saveOldPrice, price, billed, buyLink, tosText, benefits] = [...block.children];

  const {
    productId, devices, subscription, trialDuration,
  } = parseStoreProduct(product);
  const newPrice = priceType === 'monthly' ? 'discounted-monthly||full-monthly' : 'discounted||full';

  block.innerHTML = `
    <div class="container-fluid">
      ${icon.innerHTML.trim() && `<div class="icon">${icon.innerHTML}</div>`}
      ${title.innerText.trim() && `<h2>${title.innerText}</h2>`}

      <div>
        ${subtitle.innerText.trim() && `<div class="subtitle">${subtitle.innerHTML}</div>`}
        ${text.innerText.trim() && `<div class="subsubtitle">${text.innerHTML}</div>`}

        ${saveOldPrice.innerText.trim() && `<div class="save_price_box await-loader">
          <span class="prod-oldprice" data-store-render data-store-price="full" data-store-hide="!it.option.price.discounted"></span>
          <strong class="prod-percent" data-store-hide="!it.option.price.discounted" data-store-hide-type="visibility">
            ${Array.from(saveOldPrice.querySelectorAll('div'))[1]?.innerText.replace('0%', '<span data-store-render data-store-discount="percentage"></span>') ?? ''}
          </strong>
        </div>`}

        ${price.innerText.trim() && `<div class="prices_box await-loader">
          <span class="prod-newprice" data-store-render data-store-price="${newPrice}"></span>
          <sup>${price.innerText.replace('0', '')}<sup>
        </div>`}

        ${billed.innerText.trim() && `<div class="billed">${billed.innerHTML.replace('0', '<span data-store-render data-store-price="discounted||full"></span>')}</div>`}


        ${buyLink.querySelector('a') ? `<div class="buy-btn">
          <a class="red-buy-button" href="${buyLink.querySelector('a').getAttribute('href')}" title="Bitdefender">${buyLink.innerText}</a>
        </div>` : buyLink.innerText.trim() && `<div class="buy-btn">
          <a class="red-buy-button await-loader" href="#" title="Bitdefender ${buyLink.innerText}" data-store-render data-store-buy-link="${trialDuration}">${buyLink.innerText}</a>
        </div>`}

        ${tosText.innerText.trim() && `<div class="tosText">${tosText.innerHTML}</div>`}
      </div>

      ${benefits.innerText.trim() && `<div class="benefits d-flex">${benefits.innerHTML}</div>`}
    </div>`;

  if (productId) {
    wrapChildrenWithProduct(block, {
      productId,
      devices,
      subscription,
      storeEvent: 'info',
    });
  }
}
