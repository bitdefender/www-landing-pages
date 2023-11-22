import { productAliases } from '../../scripts/scripts.js';
import { updateProductsList } from '../../scripts/utils.js';

export default function decorate(block) {
  const metaData = block.closest('.section').dataset;
  const {
    product, priceType,
  } = metaData;
  const [icon, title, subtitle, text, price, billed, buyLink, tosText, benefits] = [...block.children];

  updateProductsList(product);
  const [prodName, prodUsers, prodYears] = product.split('/');
  const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;

  block.innerHTML = `
    <div class="container-fluid">
      <div class="icon">${icon.innerHTML}</div>
      <h2>${title.innerText}</h2>
      <div>
        <div class="subtitle">${subtitle.innerHTML}</div>
        <div class="subsubtitle">${text.innerHTML}</div>
        <div class="prices_box await-loader prodload prodload-${onSelectorClass}">
          <span class="prod-oldprice d-none oldprice-${onSelectorClass}${priceType ? `-${priceType}` : ''}"></span>
          <span class="prod-newprice newprice-${onSelectorClass}${priceType ? `-${priceType}` : ''}"></span>
          <sup>${price.innerText.replace('0', '')}<sup>
        </div>
        <div class="billed">${billed.innerHTML.replace('0', `<span class="oldprice-${onSelectorClass}"></span>`)}</div>
        <div class="buy-btn">
          <a class="red-buy-button buylink-${onSelectorClass} await-loader prodload prodload-${onSelectorClass}" href="#" title="Bitdefender ${buyLink.innerText}">${buyLink.innerText}</a>
        </div>
        <div class="tosText">${tosText.innerHTML}</div>
      </div>
      <div class="benefits d-flex">
        ${benefits.innerHTML}
      </div>
    </div>
    `;
}
