import { getDatasetFromSection, matchHeights, matchWidths } from '../../scripts/utils.js';

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);
  // block.classList.add('container-sm');
  const metaData = getDatasetFromSection(block);

  const backgroundColor = metaData.backgroundcolor || undefined;
  const textColor = metaData.textColor || undefined;

  if (backgroundColor) {
    block.style.backgroundColor = backgroundColor;
  }

  if (textColor) {
    block.style.color = textColor;
  }

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col, idx) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col', `columns-img-col--${idx % 2 === 0 ? 'right' : 'left'}`);
        }
      } else {
        col.innerHTML = `
          <div class="text-content">
            ${col.innerHTML}
          </div>
        `;
      }
    });
  });

  // special handling for dynamic image block, present in the
  // they-wear-our-faces campaign
  // this is a bit hacky, please do not extend this pattern
  if (block.classList.contains('dynamic-image')) {
    const buttonContainerLink = block.querySelector('.button-container a');
    const buttonContainerSibling = buttonContainerLink.parentElement.nextElementSibling;
    if (buttonContainerLink && buttonContainerSibling) {
      buttonContainerLink.classList.add('same-width');
      buttonContainerSibling.classList.add('same-width');
      matchWidths(block, '.same-width');
    }
  }
  matchHeights(block, '.text-content');
  matchHeights(block, '.feature-cards img');
}
