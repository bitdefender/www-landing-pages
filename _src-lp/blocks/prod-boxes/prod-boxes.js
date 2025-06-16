import { productAliases } from '../../scripts/scripts.js';
import { updateProductsList } from '../../scripts/utils.js';

const counter = 0;
export default function decorate(block) {
  const metaData = block.closest('.section').dataset;
  const [
    tag, title, subtitle, variationText, price, perMonth, billed, buy, underBuy, features,
  ] = block.children;

  if (tag.innerText.trim() === '') tag.style.display = 'none';

  if (block.classList.length > 2) {
    const prodClass = block.classList[1];
    const prod = prodClass.replace(/-/g, '/');
    const [pname, pusers, pyears] = prodClass.split('-');
    const selectorClass = `${pname.trim()}-${pusers}${pyears}`;
    updateProductsList(prod);

    const percentOff = price.innerText;
    const buyLinkText = buy.innerText;

    price.innerHTML = `<div class="save_price_box await-loader prodload prodload-${selectorClass}">
      <span class="prod-oldprice oldprice-${selectorClass}"></span>
      <strong class="save prod-percent">${percentOff.replace('0%', `<span class="percent-${selectorClass}"></span>`)}</strong>
    </div>`;

    perMonth.innerHTML = `<div class="prices_box prodload prodload-${selectorClass}">
      <span class="prod-newprice newprice-${selectorClass}-monthly"></span>
      <sup>${perMonth.innerText.replace('0', '')}</sup>
    </div>`;

    billed.innerHTML = `<div class="billed">${billed.innerHTML.replace('0', `<span class="newprice-${selectorClass}"></span>`)}</div>`;

    buy.innerHTML = `<div class="buy-btn">
      <a class="red-buy-button buylink-${selectorClass} await-loader prodload prodload-${selectorClass}" href="#" title="Bitdefender">
        ${buyLinkText.includes('0%') ? buyLinkText.replace('0%', `<span class="percent-${selectorClass}"></span>`) : buyLinkText}
      </a>
    </div>`;

  } else {
    block.innerHTML = `
    <div class="container-fluid">
      add some products
    </div>`;
  }

}
