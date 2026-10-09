import { matchHeights, parseStoreProduct, wrapChildrenWithStoreContext } from '../../scripts/utils.js';

/**
 * Points the link to the product's buy link (or trial link, when the page has one).
 * The product is usually shown by another block of the page as well, so it is not
 * counted again in analytics.
 * @param {HTMLAnchorElement} link
 * @param {string} product e.g. tsmd/5/1
 */
function setStoreBuyLink(link, product) {
  const {
    productId, devices, subscription, trialDuration,
  } = parseStoreProduct(product);

  link.setAttribute('data-store-render', '');
  link.setAttribute('data-store-buy-link', link.classList.contains('no-trial') ? '' : trialDuration);
  wrapChildrenWithStoreContext(link.parentElement, {
    productId, devices, subscription, storeEvent: '',
  });
}

export default function decorate(block) {
  const metaData = block.closest('.section').dataset;
  const {
    product, buttonText, buttonLink, type,
  } = metaData;

  if (type && type === 'v2') {
    block.classList.add('typev2');
    const link = block.querySelector('a');
    if (link) {
      link.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      if (product) setStoreBuyLink(link, product);
    }
  } else {
    const [title, subtitle, ...rightColumns] = block.children;
    const buyBtn = document.createElement('span');

    if (buttonText) {
      const href = buttonLink || '#';

      buyBtn.innerHTML = `
        <a
          class="button primary"
          referrerpolicy="no-referrer-when-downgrade"
          href="${href}"
          title="${buttonText.trim()} Bitdefender"
        >
          <strong>${buttonText}</strong>
        </a>
      `;

      // an authored button link is kept as it is
      if (product && !buttonLink) setStoreBuyLink(buyBtn.querySelector('a'), product);
    }

    const leftColumn = document.createElement('div');
    leftColumn.classList.add('left-column');
    leftColumn.appendChild(title);
    leftColumn.appendChild(subtitle);
    leftColumn.appendChild(buyBtn);

    const rightColumn = document.createElement('div');
    rightColumn.classList.add('right-column');
    rightColumns.forEach((element) => {
      rightColumn.appendChild(element);
    });

    block.appendChild(leftColumn);
    block.appendChild(rightColumn);
  }
  matchHeights(block, 'h4');
}
