import { matchHeights, parseStoreProduct, wrapChildrenWithStoreContext } from '../../scripts/utils.js';

export default function decorate(block) {
  const metaData = block.closest('.section').dataset;
  const { product, buttonText, buttonLink } = metaData;
  const [, iconSubtitle, , subtitle, , columnTitle, columnSubtitle, columns] = block.children;

  if (product) {
    const buybtn = document.createElement('div');
    buybtn.style.width = '100%';
    if (buttonText) {
      if (buttonLink) {
        buybtn.innerHTML += `<a class="button primary" referrerpolicy="no-referrer-when-downgrade" title="${buybtn.innerText.trim()} Bitdefender" href="${buttonLink}">${buttonText}</a>`;
      } else {
        const {
          productId, devices, subscription, trialDuration,
        } = parseStoreProduct(product);

        buybtn.innerHTML += `<a class="button primary" referrerpolicy="no-referrer-when-downgrade" title="${buybtn.innerText.trim()} Bitdefender" href="#" data-store-render data-store-buy-link="${trialDuration}">${buttonText}</a>`;
        // the product is usually shown by another block of the page, so it is not counted again in analytics
        wrapChildrenWithStoreContext(buybtn, {
          productId, devices, subscription, storeEvent: '',
        });
      }
    }

    columns?.classList.add('columns-class');
    subtitle?.classList.add('subtitle');
    columnTitle?.classList.add('columns-title');
    columnSubtitle?.classList.add('columns-subtitle');
    if (iconSubtitle?.innerText.trim()) iconSubtitle.classList.add('icon-subtitle');
    columns?.insertAdjacentElement('afterend', buybtn);
    if (!columns?.innerText?.trim()) {
      columns.remove();
    }
  }

  matchHeights(block, 'h4');
  matchHeights(block, '.columns-class h4');
  matchHeights(block, '.columns-class img');
}
