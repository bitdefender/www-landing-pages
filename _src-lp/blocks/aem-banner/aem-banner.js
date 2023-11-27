import { getMetadata } from '../../scripts/lib-franklin.js';
import { productAliases } from '../../scripts/scripts.js';
import { updateProductsList } from '../../scripts/utils.js';

export default function decorate(block) {
  const metaData = getMetadata('section');
  console.log(metaData);

  // config new elements
  const {
    product,
  } = metaData;

  const mobileImage = block.querySelector('.aem-banner > div > div picture');
  mobileImage.classList.add('aem-banner__mobile-image');
  const mobileImageParent = mobileImage.parentNode;

  // get all the siblings after h1
  const cardElements = Array.from(block.querySelectorAll('h1 ~ *'));
  // put the siblings in a new div and append it to the block

  const cardElementContainer = document.createElement('div');
  const cardElementText = document.createElement('div');
  cardElementContainer.classList.add('aem-banner__card');
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
  }
}
