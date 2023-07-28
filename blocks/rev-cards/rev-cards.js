/*
  Information:

  MetaData:
  - svgColor :svgColor = "blue" | #313fad,
  - svgSize : svgSize = "smal" | medium

  Samples:
  - https://www.bitdefender.com/media/html/consumer/new/2020/cl-offer1-opt/ultimate-flv1.html
*/
// import SvgLoaderComponent from '../../components/svg-loader/svg-loader.js';
import { getDatasetFromSection, updateProductsList } from '../../scripts/utils.js';
import { productAliases } from '../../scripts/scripts.js';

export default function decorate(block) {
  const metaData = getDatasetFromSection(block);
  console.log(metaData);
  const {
    products, taxText, devicesTextCardTwo, devicesTextCardThree,
  } = metaData;
  const productsAsList = products && products.split(',');

  const [card1, card2, card3] = [...block.children];

  console.log(block);
  console.log(card1);

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
      const prodName = productAliases(productsAsList[idx].split('/')[0]);
      const pricesDivLeftCard = document.createElement('div');
      pricesDivLeftCard.classList = 'prices_box awaitLoader prodLoad d-flex justify-content-center';
      pricesDivLeftCard.innerHTML = `<div class="me-2">
                                      <div class="save-box">Save <span class="prod-percent percent-${prodName}"></span></div>
                                      <span class="prod-oldprice oldprice-${prodName}"></span>
                                    </div>
                                    <div>
                                        <span class="prod-newprice newprice-${prodName}"></span>
                                        <span class="sales-tax">${taxText || 'Sales tax included'}</span>
                                    </div>`;
      const pricesDivRightCard = document.createElement('div');
      pricesDivRightCard.classList = 'prices_box awaitLoader prodLoad d-flex flex-column justify-content-center';
      pricesDivRightCard.innerHTML = `<div class="me-2">
                                        <div class="d-inline-block save-box">Save <span class="prod-percent percent-${prodName}"></span></div>
                                        <span class="d-block my-2 prod-oldprice oldprice-${prodName}"></span>
                                    </div>
                                    <div>
                                        <span class="prod-newprice newprice-${prodName}"></span>
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
      tableBuybtn.classList.add(`buylink-${prodName}`);
    });
  }
}
