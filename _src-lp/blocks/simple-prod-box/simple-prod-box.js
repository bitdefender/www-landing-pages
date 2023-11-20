import { productAliases } from '../../scripts/scripts.js';
import { updateProductsList } from '../../scripts/utils.js';

export default function decorate(block) {
  const parentBlockStyle = block.closest('.section').style;
  const blockStyle = block.style;
  const metaData = block.closest('.section').dataset;
  const {
    product,
  } = metaData;
  const [icon, title, subtitle, text, price, billed, buyLink, benefits] = [...block.children];

  updateProductsList(product);
  const [prodName, prodUsers, prodYears] = product.split('/');
  const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;

  block.innerHTML = `
    <div class="container-fluid">
      <div class="icon">${icon.innerHTML}</div>
      <h2>${title.innerText}</h2>
      <div class="w-80">
        <p class="subtitle">${subtitle.innerHTML}</p>
        <p class="subsubtitle">${text.innerHTML}</p>
        <div class="prices_box await-loader prodload prodload-${onSelectorClass}">
          <span class="prod-oldprice d-none oldprice-${onSelectorClass}-monthly"></span>
          <span class="prod-newprice newprice-${onSelectorClass}-monthly"></span>
          <sup>${price.innerText.replace('0', '')}<sup>
        </div>
        <div class="billed">${billed.innerHTML}</div>
        <div class="buy-btn">
          <a class="red-buy-button buylink-${onSelectorClass} await-loader prodload prodload-${onSelectorClass}" href="#" title="Bitdefender ${buyLink.innerText}">${buyLink.innerText}</a>
        </div>
      </div>
      <div class="benefits d-flex">
        ${benefits.innerHTML}
      </div>
    </div>
    `;

}
