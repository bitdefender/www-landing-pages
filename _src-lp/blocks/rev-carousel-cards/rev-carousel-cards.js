import { getDatasetFromSection, parseStoreProduct, wrapChildrenWithProduct } from '../../scripts/utils.js';

/*
  Information:

  MetaData:
  - products: ex.: tsmd/5/1 ps/10/1
  - tagText: ex.: BEST DEAL

  Samples:
  - https://main--www-landing-pages--bitdefender.aem.page/drafts/test-page/consumer/en/new/ps-ts-vpn-opt/
*/

/**
 * Wraps the element itself (not its children) in bd-product > bd-option,
 * so the carousel item keeps its own classes and children for the carousel and the CSS.
 * @param {HTMLElement} element
 * @param {object} storeProperties
 */
function wrapWithProduct(element, storeProperties) {
  const holder = document.createElement('div');
  element.before(holder);
  holder.append(element);
  const product = wrapChildrenWithProduct(holder, storeProperties);
  holder.replaceWith(product);
}

export default function decorate(block) {
  const carouselSlides = [...block.children];
  const metaData = getDatasetFromSection(block);
  const { products, tagText } = metaData;
  const productsAsList = products ? products.split(',') : [];
  block.innerHTML = `
      <div class="py-5">
        <div class="row">
          <div class="col-12 d-lg-none">
            <div id="carouselExampleIndicators" class="carousel slide">
              <div class="carousel-inner overflow-visible">
                ${carouselSlides.map((slide, idx) => `
                  <div class="carousel-item card-shadow ${idx === 0 ? 'active' : ''}">
                  ${idx === 0 ? `<div class="best-deal-card">${tagText}</div>` : ''}
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

  const mobileCards = block.querySelectorAll('.d-lg-none .carousel-item');
  const desktopCards = block.querySelectorAll('.d-lg-flex .carousel-item');
  if (productsAsList.length) {
    /// ///////////////////////////////////////////////////////////////////////
    // create prices sections
    productsAsList.forEach((item, idx) => {
      const {
        productId, devices, subscription, trialDuration,
      } = parseStoreProduct(item);

      // the same product is shown in the mobile carousel and in the desktop row
      [desktopCards[idx], mobileCards[idx]].forEach((card, cardIdx) => {
        if (!card) return;

        // add prices
        const pricesDiv = document.createElement('div');
        pricesDiv.classList = 'prices_box await-loader d-flex justify-content-center';
        pricesDiv.innerHTML = `
                                      <div>
                                          <span class="prod-oldprice" data-store-render data-store-price="full" data-store-hide="!it.option.price.discounted"></span>
                                          <span class="prod-newprice mt-2" data-store-render data-store-price="discounted||full"></span>
                                      </div>`;
        card.querySelector('hr + p.button-container')?.before(pricesDiv);

        // add buybtn div & anchor
        const tableBuybtn = card.querySelector('p.button-container > strong > a');
        if (tableBuybtn) {
          tableBuybtn.classList.add('await-loader');
          tableBuybtn.setAttribute('data-store-render', '');
          tableBuybtn.setAttribute('data-store-buy-link', trialDuration);
        }

        wrapWithProduct(card, {
          productId,
          devices,
          subscription,
          // the mobile card duplicates the desktop one
          storeEvent: cardIdx === 0 ? 'info' : '',
        });
      });
    });
  }
}
