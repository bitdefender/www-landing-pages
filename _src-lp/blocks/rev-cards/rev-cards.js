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
import { getDatasetFromSection, parseStoreProduct, wrapChildrenWithProduct } from '../../scripts/utils.js';

export default function decorate(block) {
  const metaData = getDatasetFromSection(block);
  const {
    products, taxText, devicesTextCardTwo, devicesTextCardThree, savePillText,
  } = metaData;
  const productsAsList = products ? products.split(',') : [];

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
    /// ///////////////////////////////////////////////////////////////////////
    // create prices sections
    productsAsList.forEach((item, idx) => {
      const card = block.querySelector(`.card-${idx + 1}`);
      if (!card) return;

      const {
        productId, devices, subscription, trialDuration,
      } = parseStoreProduct(item);

      // add prices
      const pricesDivLeftCard = document.createElement('div');
      pricesDivLeftCard.classList = 'prices_box await-loader d-flex justify-content-center';
      pricesDivLeftCard.innerHTML = `<div class="me-2">
                                      <div class="save-box" data-store-hide="!it.option.price.discounted" data-store-hide-type="visibility">${savePillText} <span class="prod-percent" data-store-render data-store-discount="percentage"></span></div>
                                      <span class="prod-oldprice" data-store-render data-store-price="full" data-store-hide="!it.option.price.discounted"></span>
                                    </div>
                                    <div>
                                        <span class="prod-newprice" data-store-render data-store-price="discounted||full"></span>
                                        <span class="sales-tax">${taxText || 'Sales tax included'}</span>
                                    </div>`;
      const pricesDivRightCard = document.createElement('div');
      pricesDivRightCard.classList = 'prices_box await-loader d-flex flex-column justify-content-center';
      pricesDivRightCard.innerHTML = `<div class="me-2">
                                        <div class="d-inline-block save-box" data-store-hide="!it.option.price.discounted" data-store-hide-type="visibility">${savePillText} <span class="prod-percent" data-store-render data-store-discount="percentage"></span></div>
                                        <span class="d-block my-2 prod-oldprice" data-store-render data-store-price="full" data-store-hide="!it.option.price.discounted"></span>
                                    </div>
                                    <div>
                                        <span class="prod-newprice" data-store-render data-store-price="discounted||full"></span>
                                        <span class="devices">${idx === 1 ? devicesTextCardTwo : devicesTextCardThree}</span>
                                        <span class="sales-tax">${taxText || 'Sales tax included'}</span>
                                    </div>`;
      const cardSeparator = card.querySelectorAll('hr')[1];
      if (idx === 0) {
        cardSeparator?.after(pricesDivLeftCard);
      } else {
        cardSeparator?.before(pricesDivRightCard);
      }

      // add buybtn div & anchor
      const tableBuybtn = card.querySelector('p.button-container > strong > a');
      if (tableBuybtn) {
        tableBuybtn.classList.add('await-loader');
        tableBuybtn.setAttribute('data-store-render', '');
        tableBuybtn.setAttribute('data-store-buy-link', trialDuration);
      }

      // the column holds only the card, so the card keeps its place in the layout
      wrapChildrenWithProduct(card.parentElement, {
        productId,
        devices,
        subscription,
        storeEvent: 'info',
      });
    });
  }
}
