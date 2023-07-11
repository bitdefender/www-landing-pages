import { productAliases } from '../../scripts/scripts.js';
import { getDatasetFromSection, updateProductsList } from '../../scripts/utils.js';

export default function decorate(block) {
  const carouselSlides = [...block.children];

  const metaData = getDatasetFromSection(block);
  const { products, tagText } = metaData;
  const productsAsList = products && products.split(',');

  block.innerHTML = `
      <div class="py-5">
        <div class="row">
          <div class="col-12 d-lg-none">
            <div id="carouselExampleIndicators" class="carousel slide">
              <div class="carousel-inner overflow-visible card-shadow">
                ${carouselSlides.map((slide, idx) => `
                  ${idx === 0 ? '<div class="best-deal-card">BEST DEAL</div>' : ''}
                  <div class="carousel-item ${idx === 0 ? 'active' : ''}">
                    ${slide.children[0].innerHTML}
                  </div>
                `).join('')}
              </div>
              <div class="text-center mt-3">
                <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
                  <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span class="visually-hidden">Previous</span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
                  <span class="carousel-control-next-icon" aria-hidden="true"></span>
                  <span class="visually-hidden">Next</span>
                </button>
              </div>
            </div>
          </div>
          <div class="d-none d-lg-flex row">
              <div class="col-4">
                <div id="carouselExampleIndicators" class="">
                  <div class="carousel-inner overflow-visible">
                      <div class="carousel-item card-shadow active">
                        <div class="best-deal-card">${tagText || 'BEST DEAL'}</div>
                        ${carouselSlides[0].children[0].innerHTML}
                      </div>
                  </div>
                </div>
              </div>
              <div class="col-4">
                <div id="carouselExampleIndicators" class="">
                  <div class="carousel-inner overflow-visible">
                      <div class="carousel-item card-shadow active">
                        ${carouselSlides[1].children[0].innerHTML}
                      </div>
                  </div>
                </div>
              </div>
              <div class="col-4">
                <div id="carouselExampleIndicators" class="">
                  <div class="carousel-inner overflow-visible">
                      <div class="carousel-item card-shadow active">
                        ${carouselSlides[2].children[0].innerHTML}
                      </div>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>
    `;

  const prices = block.querySelectorAll('.rev-carousel-cards hr + p.button-container');
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
      pricesDivLeftCard.innerHTML = `
                                      <div>
                                          <span class="prod-oldprice oldprice-${prodName}"></span>
                                          <span class="prod-newprice newprice-${prodName} mt-2"></span>
                                      </div>`;
      const pricesDivLeftCard2 = document.createElement('div');
      pricesDivLeftCard2.classList = 'prices_box awaitLoader prodLoad d-flex justify-content-center';
      pricesDivLeftCard2.innerHTML = `
                                      <div>
                                          <span class="prod-oldprice oldprice-${prodName}"></span>
                                          <span class="prod-newprice newprice-${prodName} mt-2"></span>
                                      </div>`;
      prices[idx + 3].before(pricesDivLeftCard);
      prices[idx].before(pricesDivLeftCard2);

      // add buybtn div & anchor
      const tableBuybtn = block.querySelectorAll('p.button-container > strong > a')[idx];
      const tableBuybtn2 = block.querySelectorAll('p.button-container > strong > a')[idx + 3];
      tableBuybtn.classList.add(`buylink-${prodName}`);
      tableBuybtn2.classList.add(`buylink-${prodName}`);
    });
  }
}
