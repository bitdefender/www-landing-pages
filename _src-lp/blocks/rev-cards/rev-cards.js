/*
  Information:

  MetaData:
  - products: ex.: tsmd/5/1 ps/10/1
  - taxText: ex.: sales not included
  - devicesTextCardTwo: text above the price on the second card
  - devicesTextCardThree: text above the price on the third card
  - savePillText: text in the green pill  Ex.: save 5%

  Samples:
  - https://main--www-landing-pages--bitdefender.aem.page/drafts/test-page/consumer/en/new/ps-ts-vpn-opt/
*/
import { getDatasetFromSection, updateProductsList } from '../../scripts/utils.js';
import { productAliases } from '../../scripts/scripts.js';

export default function decorate(block) {
  const metaData = getDatasetFromSection(block);
  const {
    products, taxText, devicesTextCardTwo, devicesTextCardThree, savePillText,
  } = metaData;
  const productsAsList = products && products.split(',');

  const [card1, card2, card3] = [...block.children];

  block.innerHTML = `
      <div class="row">
        <div class="col-12 col-lg-6 my-3">
          <div class="card card-1">
            ${card1.innerHTML}
          </div>
        </div>
        <div class="col-12 col-lg-3 my-3">
          <div class="card card-2">
            ${card2.innerHTML}
          </div>
        </div>
        <div class="col-12 col-lg-3 my-3">
          <div class="card card-3">
            ${card3.innerHTML}
          </div>
        </div>
      </div>
  `;

  if (productsAsList.length) {
    // check and add products into the final array
    productsAsList.forEach((prod) => updateProductsList(prod));

    /// ///////////////////////////////////////////////////////////////////////
    // create prices sections
    productsAsList.forEach((item, idx) => {
      // add prices
      // const prodName = productAliases(productsAsList[idx].split('/')[0]);
      const [prodName, prodUsers, prodYears] = productsAsList[idx].split('/');
      const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;
      const pricesDivLeftCard = document.createElement('div');
      pricesDivLeftCard.classList = `prices_box await-loader prodload prodload-${onSelectorClass} d-flex justify-content-center`;
      pricesDivLeftCard.innerHTML = `<div class="me-2">
                                      <div class="save-box">${savePillText} <span class="prod-percent percent-${onSelectorClass}"></span></div>
                                      <span class="prod-oldprice oldprice-${onSelectorClass}"></span>
                                    </div>
                                    <div>
                                        <span class="prod-newprice newprice-${onSelectorClass}"></span>
                                        <span class="sales-tax">${taxText || 'Sales tax included'}</span>
                                    </div>`;
      const pricesDivRightCard = document.createElement('div');
      pricesDivRightCard.classList = `prices_box await-loader prodload prodload-${onSelectorClass} d-flex flex-column justify-content-center`;
      pricesDivRightCard.innerHTML = `<div class="me-2">
                                        <div class="d-inline-block save-box">${savePillText} <span class="prod-percent percent-${onSelectorClass}"></span></div>
                                        <span class="d-block my-2 prod-oldprice oldprice-${onSelectorClass}"></span>
                                    </div>
                                    <div>
                                        <span class="prod-newprice newprice-${onSelectorClass}"></span>
                                        <span class="devices">${idx === 1 ? devicesTextCardTwo : devicesTextCardThree}</span>
                                        <span class="sales-tax">${taxText || 'Sales tax included'}</span>
                                    </div>`;
      if (idx === 0) {
        block.querySelectorAll(`.rev-cards .card-${idx + 1} hr`)[1].after(pricesDivLeftCard);
      } else {
        block.querySelectorAll(`.rev-cards .card-${idx + 1} hr`)[1].before(pricesDivRightCard);
      }

      // add buybtn div & anchor
      const tableBuybtn = block.querySelectorAll('p.button-container > strong > a')[idx];
      tableBuybtn.classList.add(`buylink-${onSelectorClass}`, 'await-loader', 'prodload', `prodload-${onSelectorClass}`);
    });
  }
}
