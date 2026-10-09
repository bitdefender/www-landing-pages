import { parseStoreProduct, wrapChildrenWithStoreContext } from '../../scripts/utils.js';

// hide rule for elements that only make sense when the product has a discount
const NO_DISCOUNT = '!it.option.price.discounted';

function createPricesElement(conditionText, saveText) {
  const priceElement = document.createElement('div');
  priceElement.classList.add('aem-banner__prices');
  // without a discount the old price is removed and the save text is hidden
  priceElement.innerHTML = `
    <div class="aem-banner__price mt-3">
      <div>
          <span class="prod-oldprice" data-store-render data-store-price="full" data-store-hide="${NO_DISCOUNT}"></span>
          <span class="prod-save" data-store-hide="${NO_DISCOUNT}" data-store-hide-type="visibility">${saveText} <span data-store-render data-store-discount="value"></span></span>
      </div>
      <div class="newprice-container mt-2">
        <span class="prod-newprice" data-store-render data-store-price="discounted||full"></span>
        <sup>${conditionText}</sup>
      </div>
    </div>`;
  return priceElement;
}

function createCardElementContainer(elements, mobileImage) {
  const cardElementContainer = document.createElement('div');
  cardElementContainer.classList.add('aem-banner__card');

  const cardElementText = document.createElement('div');
  cardElementText.classList.add('aem-banner__card-text');

  elements.forEach((sibling) => {
    if (sibling.contains(mobileImage)) {
      cardElementContainer.appendChild(sibling);
    } else {
      cardElementText.appendChild(sibling);
    }
  });

  cardElementContainer.appendChild(cardElementText);

  return cardElementContainer;
}

function decorateBuyLink(buyLink, trialDuration) {
  if (buyLink) {
    buyLink.classList.add('button', 'primary');
    buyLink.setAttribute('data-store-render', '');
    buyLink.setAttribute('data-store-buy-link', trialDuration);
    if (buyLink.innerHTML.includes('0%')) {
      buyLink.innerHTML = buyLink.innerHTML.replace(/0%/g, '<span data-store-render data-store-discount="percentage">10%</span>');
      // a button showing the discount (with its paragraph) is hidden when there is none
      const container = buyLink.closest('p') || buyLink;
      container.setAttribute('data-store-hide', NO_DISCOUNT);
      container.setAttribute('data-store-hide-type', 'visibility');
    }
  }
}

export default function decorate(block) {
  const metaData = block.closest('.section').dataset;
  const {
    product, conditionText, saveText,
  } = metaData;

  const [richText, mainDesktopImage] = block.children;

  // Configuration for new elements
  richText.classList.add('aem-banner__card__desktop', 'col-md-6');
  mainDesktopImage.classList.add('col-md-6');
  mainDesktopImage.children[0].classList.add('h-100');

  const mobileImage = block.querySelector('.aem-banner > div > div picture');
  mobileImage.classList.add('aem-banner__mobile-image');

  // Get all the siblings after h1
  const cardElements = Array.from(block.querySelectorAll('h1 ~ *'));

  // Put the siblings in a new div and append it to the block
  const cardElementContainer = createCardElementContainer(cardElements, mobileImage);

  // Append the container after h1
  block.querySelector('h1').after(cardElementContainer);

  const desktopImage = block.querySelector('.aem-banner > div > div > picture');
  desktopImage.classList.add('aem-banner__desktop-image');

  if (product) {
    const {
      productId, devices, subscription, trialDuration,
    } = parseStoreProduct(product);

    const buyLink = block.querySelector('a[href*="#buylink"]');
    decorateBuyLink(buyLink, trialDuration);

    const pricesBox = createPricesElement(conditionText, saveText);
    buyLink.parentNode.parentNode.insertBefore(pricesBox, buyLink.parentNode);

    // the card holds the prices and the buy link
    const storeScope = cardElementContainer.contains(buyLink) ? cardElementContainer : block;
    wrapChildrenWithStoreContext(storeScope, {
      productId, devices, subscription, ignoreEventsParent: true, storeEvent: 'info',
    });
  }
}
