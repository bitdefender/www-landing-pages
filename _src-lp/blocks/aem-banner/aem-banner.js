import { productAliases } from '../../scripts/scripts.js';
import { updateProductsList } from '../../scripts/utils.js';

function createPricesElement(onSelectorClass, conditionText, saveText) {
  const priceElement = document.createElement('div');
  priceElement.classList.add('aem-banner__prices');
  priceElement.innerHTML = `
    <div class="aem-banner__price mt-3">
      <div>
          <span class="prod-oldprice oldprice-${onSelectorClass}"></span>
          <span class="prod-save">${saveText} <span class="save-${onSelectorClass}"></span></span>
      </div>
      <div class="newprice-container mt-2">
        <span class="prod-newprice newprice-${onSelectorClass}"></span>
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

function decorateBuyLink(buyLink, onSelectorClass) {
  if (buyLink) {
    buyLink.classList.add('button', 'primary', `buylink-${onSelectorClass}`);
    buyLink.innerHTML = buyLink.innerHTML.replace(/0%/g, `<span class="percent-${onSelectorClass}">10%</span>`);
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
    const [prodName, prodUsers, prodYears] = product.split('/');
    const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;

    updateProductsList(product);

    const buyLink = block.querySelector('a[href*="#buylink"]');
    decorateBuyLink(buyLink, onSelectorClass);

    const pricesBox = createPricesElement(onSelectorClass, conditionText, saveText);
    buyLink.parentNode.parentNode.insertBefore(pricesBox, buyLink.parentNode);
  }
}
