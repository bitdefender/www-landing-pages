import { getDatasetFromSection } from '../../scripts/utils.js';

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);
  block.classList.add('container-sm');

  const metaData = getDatasetFromSection(block);

  const backgroundColor = metaData.backgroundcolor || undefined;

  if (backgroundColor) {
    block.style.backgroundColor = backgroundColor;
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
          <div>
            ${col.innerHTML}
          </div>
        `;
      }
    });
  });
}
