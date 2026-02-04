import { productAliases } from '../../scripts/scripts.js';
import { matchHeights } from '../../scripts/utils.js';

export default function decorate(block) {
  const metaData = block.closest('.section').dataset;
  const {
    product, buttonText, buttonLink, type,
  } = metaData;
  const [prodName, prodUsers, prodYears] = product ? product.split('/') : '';
  const onSelectorClass = product ? `${productAliases(prodName)}-${prodUsers}${prodYears}` : '';

  if (type && type === 'v2') {
    block.classList.add('typev2');
    if (block.querySelector('a')) {
      block.querySelector('a').classList.add(`buylink-${onSelectorClass}`);
      block.querySelector('a').setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    }
  } else {
    const [title, subtitle, ...rightColumns] = block.children;
    const buyBtn = document.createElement('span');

    if (buttonText) {
      const cls = onSelectorClass ? ` buylink-${onSelectorClass}` : '';
      const href = buttonLink || '#';

      buyBtn.innerHTML = `
        <a
          class="button primary${cls}"
          referrerpolicy="no-referrer-when-downgrade"
          href="${href}"
          title="${buttonText.trim()} Bitdefender"
        >
          <strong>${buttonText}</strong>
        </a>
      `;
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
