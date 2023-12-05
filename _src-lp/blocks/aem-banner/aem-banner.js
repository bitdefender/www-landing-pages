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

export default function decorate(block) {
  // get data attributes set in metaData
  const parentSelector = block.closest('.section');
  const metaData = parentSelector.dataset;

  // config new elements
  const {
    product, conditionText, saveText,
  } = metaData;

  const [richText, columns] = block.children;

  // TODO: This is a dirty hack to get the columns to work, should be fixed in the future
  richText.classList.add('aem-banner__card__desktop', 'col-md-6');
  columns.classList.add('col-md-6');
  const columns2 = columns.children[0];
  columns2.classList.add('h-100');

  const mobileImage = block.querySelector('.aem-banner > div > div picture');
  mobileImage.classList.add('aem-banner__mobile-image');
  const mobileImageParent = mobileImage.parentNode;

  // get all the siblings after h1
  const cardElements = Array.from(block.querySelectorAll('h1 ~ *'));
  // put the siblings in a new div and append it to the block

  const cardElementContainer = document.createElement('div');
  cardElementContainer.classList.add('aem-banner__card');

  const cardElementText = document.createElement('div');
  cardElementText.classList.add('aem-banner__card-text');

  cardElements.forEach((sibling) => {
    // check if a sibling is the mobile image
    if (sibling === mobileImageParent) {
      cardElementContainer.appendChild(sibling);
    } else {
      cardElementText.appendChild(sibling);
    }
  });
  cardElementContainer.appendChild(cardElementText);

  // append the container to after h1
  block.querySelector('h1').after(cardElementContainer);

  const desktopImage = block.querySelector('.aem-banner > div > div > picture');
  desktopImage.classList.add('aem-banner__desktop-image');

  if (product) {
    const [prodName, prodUsers, prodYears] = product.split('/');
    const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;

    updateProductsList(product);

    const buyLink = block.querySelector('a[href*="#buylink"]');
    if (buyLink) {
      buyLink.classList.add('button', 'primary', `buylink-${onSelectorClass}`);
      buyLink.innerHTML = buyLink.innerHTML.replace(/0%/g, `<span class="percent-${onSelectorClass}">10%</span>`);
    }

    const pricesBox = createPricesElement(onSelectorClass, conditionText, saveText);
    buyLink.parentNode.parentNode.insertBefore(pricesBox, buyLink.parentNode);
  }
}
