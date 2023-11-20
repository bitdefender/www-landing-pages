import { productAliases } from '../../scripts/scripts.js';
import { updateProductsList } from '../../scripts/utils.js';

export default function decorate(block) {
  const parentBlockStyle = block.closest('.section').style;
  const blockStyle = block.style;
  const metaData = block.closest('.section').dataset;
  const {
    products,
  } = metaData;

  const productsAsList = products && products.split(',');
  if (productsAsList.length) {
    productsAsList.forEach((prod) => updateProductsList(prod));

    [...block.children].forEach((prod, key) => {
      const [greenTag, title, blueTag, subtitle, price, billed, buyLink, undeBuyLink, benefitsLists] = [...prod.querySelectorAll('tr')];
      const [prodName, prodUsers, prodYears] = productsAsList[key].split('/');
      const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;

      [...block.children][key].innerHTML = '';

      block.innerHTML += `
        <div class="pod_box">
          <div class="inner_pod_box">
            ${greenTag.innerText.trim() ? `<div class="greenTag2">${greenTag.innerText.trim()}</div>` : ''}
            ${title.innerText.trim() ? `<h2>${title.innerHTML}</h2>` : ''}
            ${blueTag.innerText.trim() ? `<div class="blueTag"><div>${blueTag.innerHTML.trim()}</div></div>` : ''}
            ${subtitle.innerText.trim() ? `<p class="subtitle">${subtitle.innerText.trim()}</p>` : ''}
            <hr />
            <div class="prices_box await-loader prodload prodload-${onSelectorClass}">
                <span class="prod-oldprice d-none oldprice-${onSelectorClass}-monthly"></span>
                <span class="prod-newprice newprice-${onSelectorClass}-monthly"></span>
                <sup>${price.innerText.trim() && price.innerText.trim().replace('0', '')}<sup>
              </div>
              ${billed ? `<div class="billed">${billed.innerHTML}</div>` : ''}
              <div class="buy-btn">
                <a class="red-buy-button buylink-${onSelectorClass} await-loader prodload prodload-${onSelectorClass}" href="#" title="Bitdefender ${buyLink.innerText.trim() && buyLink.innerText.trim()}">${buyLink.innerText.trim() && buyLink.innerText.trim()}</a>
              </div>
              ${undeBuyLink.innerText.trim() ? `<div class="undeBuyLink">${undeBuyLink.innerText.trim()}</div>` : ''}
              <hr />
              ${benefitsLists.innerText.trim() ? `<div class="benefitsLists">${benefitsLists.innerHTML.trim()}</div>` : ''}
          </div>
        </div>
      `;

    })



  } else {
    block.innerHTML = `
    <div class="container-fluid">
      add some products
    </div>
    `;
  }
}
