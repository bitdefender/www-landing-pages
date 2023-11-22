import { productAliases } from '../../scripts/scripts.js';
import { updateProductsList } from '../../scripts/utils.js';

export default function decorate(block) {
  const metaData = block.closest('.section').dataset;
  const {
    product, priceType,
  } = metaData;
  const [icon, title, subtitle, text, saveOldPrice, price, billed, buyLink, tosText, benefits] = [...block.children];

  updateProductsList(product);
  const [prodName, prodUsers, prodYears] = product.split('/');
  const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;

  block.innerHTML = `
    <div class="container-fluid">
      ${icon.innerText.trim() && `<div class="icon">${icon.innerHTML}</div>`}
      ${title.innerText.trim() && `<h2>${title.innerText}</h2>`}

      <div>
        ${subtitle.innerText.trim() && `<div class="subtitle">${subtitle.innerHTML}</div>`}
        ${text.innerText.trim() && `<div class="subsubtitle">${text.innerHTML}</div>`}

        ${saveOldPrice.innerText.trim() && `<div class="save_price_box await-loader prodload prodload-${onSelectorClass}"">
          <span class="prod-oldprice oldprice-${onSelectorClass}"></span>
          <strong class="prod-percent">
            ${Array.from(saveOldPrice.querySelectorAll('div'))[1].innerText.replace('0%', `<span class="percent-${onSelectorClass}"></span>`)}
          </strong>
        </div>`}

        ${price.innerText.trim() && `<div class="prices_box await-loader prodload prodload-${onSelectorClass}">
          <span class="prod-newprice newprice-${onSelectorClass}${priceType ? `-${priceType}` : ''}"></span>
          <sup>${price.innerText.replace('0', '')}<sup>
        </div>`}

        ${billed.innerText.trim() && `<div class="billed">${billed.innerHTML.replace('0', `<span class="newprice-${onSelectorClass}"></span>`)}</div>`}

        ${buyLink.innerText.trim() && `<div class="buy-btn">
          <a class="red-buy-button buylink-${onSelectorClass} await-loader prodload prodload-${onSelectorClass}" href="#" title="Bitdefender ${buyLink.innerText}">${buyLink.innerText}</a>
        </div>`}

        ${tosText.innerText.trim() && `<div class="tosText">${tosText.innerHTML}</div>`}
      </div>

      ${benefits.innerText.trim() && `<div class="benefits d-flex">${benefits.innerHTML}</div>`}
    </div>`;
}
