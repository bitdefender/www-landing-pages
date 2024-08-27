import { productAliases } from '../../scripts/scripts.js';

export default function decorate(block) {
  const metaData = block.closest('.section').dataset;
  const { product, buttonText, buttonLink } = metaData;
  const [, iconSubtitle, subtitle, columnTitle, columnSubtitle, columns] = block.children;

  columns?.classList.add('columns-class');
  subtitle.classList.add('subtitle');
  columnTitle.classList.add('columns-title');
  columnSubtitle.classList.add('columns-subtitle');
  if (iconSubtitle.innerText.trim()) iconSubtitle.classList.add('icon-subtitle');
  if (product) {
    const [prodName, prodUsers, prodYears] = product.split('/');
    const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;

    const buybtn = document.createElement('span');
    if (buttonLink) {
      buybtn.innerHTML += `<a class="button primary" referrerpolicy="no-referrer-when-downgrade" title="${buybtn.innerText.trim()} Bitdefender" href="${buttonLink}"><strong>${buttonText}</strong></a>`;
    } else {
      buybtn.innerHTML += `<a class="buylink-${onSelectorClass} button primary" referrerpolicy="no-referrer-when-downgrade" title="${buybtn.innerText.trim()} Bitdefender" href="#"><strong>${buttonText}</strong></a>`;
    }
    block.appendChild(buybtn);
  }
}
