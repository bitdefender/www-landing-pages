import ReviewComponent from '../../components/review/review.js';
import { getDatasetFromSection } from '../../scripts/utils.js';

/*
  Information:

  MetaData:
  - textstyle : default(center) || left || right
  - bottomtext : free text input ( optional )

  Samples:
  - https://www.bitdefender.com/media/html/consumer/new/2020/cl-offer1-opt/ultimate-flv1.html
*/
export default function decorate(block) {
  const metaData = getDatasetFromSection(block);

  const textstyle = metaData.textstyle || 'center';
  const bottomtext = metaData.bottomtext || undefined;

  const formattedDataColumns = [...block.children[0].children].map((ratingEl, tableIndex) => ({
    rating: ratingEl.innerText,
    quote: block.children[1].children[tableIndex].innerText,
    author: block.children[2].children[tableIndex].innerText,
    link: block.children[3].children[tableIndex].innerText || undefined,
  }));

  block.innerHTML = `
    <div class="container">
      <div class="row">
        ${formattedDataColumns.map((col) => `
          <div class="col-12 col-sm">
            ${new ReviewComponent(col, textstyle).render()}
          </div>
        `).join('')}
      </div>
      ${bottomtext ? `
        <div class="row">
          <div class="col bottom-text">${bottomtext}</div>
        </div>
      ` : ''}
    </div>
  `;
}
