/**
 * Information:
 * - hero banner - top LandingPage
 * - default value for discount: 10%
 *
 * MetaData:
 * - discount_style : default(circle) || pill
 * - product : ex: elite/10/1 (alias_name/nr_devices/nr_years)
 * - discount_text : ex: OFF special offer (comes after the percent discount)
 *   ((not necessary for default discount_style))
 * - button_type: external-link, go-to-section-link, buy-link
 * - background_color: ex: #f5f5f5, default is white.
 * - image_variation: ex: small, default is big for large hero banners.
 *
 * Samples:
 * - default(circle): https://www.bitdefender.com/media/html/business/cross-sell-flash-sale-pm-2023/existing.html
 * - pill: https://www.bitdefender.com/media/html/business/RansomwareTrial/new.html
 */

import { productAliases } from '../../scripts/scripts.js';
import { updateProductsList } from '../../scripts/utils.js';

export default function decorate(block) {
  // get data attributes set in metaData
  const parentSelector = block.closest('.section');
  const metaData = parentSelector.dataset;

  // move picture below
  const bannerImage = block.querySelector('picture');
  parentSelector.append(bannerImage);

  // config new elements
  const {
    product, discountStyle, discountText, backgroundColor, imageVariation, bannerDiscount
  } = metaData;

  // update background color if set, if not set default: #000
  const block1 = document.querySelector('.b-banner-container');
  if (backgroundColor) {
    block1.style.backgroundColor = backgroundColor;
  } else {
    block1.style.backgroundColor = '#000'
  }

  if (imageVariation) {
    if (imageVariation === 'small') {
      const block2 = document.querySelector('.b-banner-container');
      block2.classList.add('d-flex');

      const block3 = document.querySelector('picture');
      block3.style.marginLeft = 'auto';
    }
  }

  if (typeof product !== 'undefined' && product !== '') {
    const [prodName, prodUsers, prodYears] = product.split('/');
    const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;

    updateProductsList(product);

    const finalDiscountStyle = typeof discountStyle !== 'undefined' && discountStyle !== 'default' ? discountStyle : 'circle';
    let finalDiscountText = typeof discountText !== 'undefined' && discountText !== 'default' ? discountText : '';

    if (finalDiscountText.indexOf('0') !== -1) {
      finalDiscountText = finalDiscountText.replace(/0/g, `<span class="percent-${onSelectorClass}">10%</span>`);
    } else {
      finalDiscountText = `<span class="percent-${onSelectorClass}">10%</span> ${finalDiscountText}`;
    }

    let percentRadius;
    if (block.querySelector('.button-container')) {
      percentRadius = block.querySelector('.button-container');
    } else {
      percentRadius = document.createElement('div');
    }

    percentRadius.innerHTML += ` <span style="visibility: hidden" class="prod-percent strong green_bck_${finalDiscountStyle} mx-2">${finalDiscountText}</span>`;
    block.appendChild(percentRadius);

    if (bannerDiscount) {
      const discountDiv = document.createElement('div');
      parentSelector.querySelector('picture').classList.add('hasDiscount');
      discountDiv.innerHTML = `<span class="percent-${onSelectorClass}">10%</span><span>${bannerDiscount.split(' ')[1]}</span>`;
      parentSelector.querySelector('picture').appendChild(discountDiv);
    }
  }
}
