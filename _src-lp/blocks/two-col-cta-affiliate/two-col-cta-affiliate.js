import { productAliases } from '../../scripts/scripts.js';

export default function decorate(block) {
  const metaData = block.closest('.section').dataset;
  const { product, buttonText, buttonLink, type } = metaData;
  const [prodName, prodUsers, prodYears] = product.split('/');
  const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;

  if (type && type === 'v2') {
    block.classList.add('typev2');

    block.querySelector('a').classList.add(`buylink-${onSelectorClass}`);
    block.querySelector('a').setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
  } else {
    const [title, subtitle, ...rightColumns] = block.children;

    const buybtn = document.createElement('span');
    console.log('buttonLink ', buttonLink)
    if (buttonLink) {
      buybtn.innerHTML += `<a class="button primary" referrerpolicy="no-referrer-when-downgrade" title="${buybtn.innerText.trim()} Bitdefender" href="${buttonLink}"><strong>${buttonText}</strong></a>`;
    } else {
      buybtn.innerHTML += `<a class="buylink-${onSelectorClass} button primary" referrerpolicy="no-referrer-when-downgrade" title="${buybtn.innerText.trim()} Bitdefender" href="#">
      <strong>${buttonText}</strong>
      </a>`;
    }

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
}
