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
  const bannerContainer = document.querySelector('.b-banner-container');

  bannerImage.classList.add('b-banner-hero-image');
  parentSelector.append(bannerImage);

  // config new elements
  const paragraph = block.querySelector('p');
  const banner = document.querySelector('.b-banner-container');
  const {
    product, discountStyle, discountText, backgroundColor, imageVariation, paragraphColor,
    bannerHeight, bannerImageCover, hasAwardImage, awardImageWidth, bannerColor,
  } = metaData;

  // update background color if set
  if (typeof backgroundColor !== 'undefined') {
    bannerContainer.style.backgroundColor = backgroundColor;
    bannerContainer.style.filter = 'inverse(100%)';
  }

  if (typeof bannerColor !== 'undefined') {
    bannerContainer.style.color = bannerColor;
  }

  if (typeof imageVariation !== 'undefined') {
    if (imageVariation === 'small') {
      const block2 = document.querySelector('.b-banner-container');
      block2.classList.add('d-flex');

      const block3 = document.querySelector('picture');
      block3.style.marginLeft = 'auto';
    }
  }

  if (bannerHeight !== 'undefinded') {
    banner.style.height = bannerHeight;
  }

  if (bannerImageCover !== 'undefinded') {
    const image = bannerImage.querySelector('img');
    image.style.height = '-webkit-fill-available';
    image.style.objectFit = 'cover';
  }

  if (hasAwardImage !== 'undefinded') {
    const bBanner = document.querySelector('.b-banner');
    bBanner.classList.add('d-flex');

    const AwardImage = block.querySelectorAll('picture')[0];
    const AwardImage2 = AwardImage.querySelector('img');
    AwardImage2.style.width = awardImageWidth || '11rem';
  }

  if (paragraphColor !== 'undefinded') {
    paragraph.style.color = paragraphColor;
  }

  if (typeof product !== 'undefined' && product !== '') {
    const prodSplit = product.split('/');
    const prodName = productAliases(prodSplit[0]);

    updateProductsList(product);

    const finalDiscountStyle = typeof discountStyle !== 'undefined' && discountStyle !== 'default' ? discountStyle : 'circle';
    const finalDiscountText = typeof discountText !== 'undefined' && discountText !== 'default' ? discountText : '';

    const percentRadius = ` <span style="visibility: hidden" class="prod-percent strong green_bck_${finalDiscountStyle} mx-2"><span class="percent-${prodName}">10%</span> ${finalDiscountText}</span>`;
    paragraph.innerHTML += percentRadius;
  }
}
