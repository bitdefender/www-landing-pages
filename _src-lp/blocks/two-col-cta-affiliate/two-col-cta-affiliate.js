import { productAliases } from '../../scripts/scripts.js';

export default function decorate(block) {
  const metaData = block.closest('.section').dataset;
  const { product, buttonText } = metaData;

  const [title, subtitle, ...rightColumns] = block.children;

  const [prodName, prodUsers, prodYears] = product.split('/');
  const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;

  const buybtn = document.createElement('span');
  buybtn.innerHTML += `<a class="buylink-${onSelectorClass} button primary" referrerpolicy="no-referrer-when-downgrade" title="${buybtn.innerText.trim()} Bitdefender" href="#">
  <strong>${buttonText}</strong>
  </a>`;

  const leftColumn = document.createElement('div');
  leftColumn.classList.add('left-column');
  leftColumn.appendChild(title);
  leftColumn.appendChild(subtitle);
  leftColumn.appendChild(buybtn);

  const rightColumn = document.createElement('div');
  rightColumn.classList.add('right-column');
  rightColumns.forEach((element) => {
    rightColumn.appendChild(element);
  });
  block.appendChild(leftColumn);
  block.appendChild(rightColumn);
}
