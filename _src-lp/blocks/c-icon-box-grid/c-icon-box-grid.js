/*
  Information:

  MetaData:
  - svgColor :svgColor = "blue" | #313fad,
  - svgSize : svgSize = "smal" | medium
  - columnsAlignment : columnsAlignment = center
  - upperTextWidth : upperTextWidth = 2/3

  Samples:
  - https://www.bitdefender.com/media/html/consumer/new/2020/cl-offer1-opt/ultimate-flv1.html
*/
import SvgLoaderComponent from '../../components/svg-loader/svg-loader.js';
import { getDatasetFromSection } from '../../scripts/utils.js';
import { decorateIcons } from '../../scripts/lib-franklin.js';

function hasOldSvgImplementation(svgNameEl) {
  return svgNameEl.childElementCount === 0;
}

function sanitiseStrongItalic(el) {
  return el.firstElementChild?.tagName === 'STRONG' ? el.firstElementChild : el;
}

export default function decorate(block) {
  const metaData = getDatasetFromSection(block);

  const svgColor = metaData.svgcolor;
  const svgSize = metaData.svgsize;
  const columnsAlignment = metaData.columnsalignment;
  const upperTextWidth = metaData.upperTextWidth;

  const formattedDataColumns = [...block.children[0].children].map((svgNameEl, tableIndex) => ({
    svgNameEl: sanitiseStrongItalic(svgNameEl),
    title: block.children[1].children[tableIndex].innerText,
    subtitle: block.children[2].children[tableIndex].innerHTML,
    buttons: block.children[5]?.children[tableIndex].innerHTML,
  }));

  const upperText = block.children[3];
  const bottomText = block.children[4];

  if (upperTextWidth === '2/3') {
    upperText.firstElementChild.classList.add('w-lg-65');
    upperText.firstElementChild.style.margin = '0 auto';
  }

  block.innerHTML = `
    <div class="container rounded-bottom">
      ${upperText ? `${upperText.innerHTML}` : ''}
      <div class="row ${columnsAlignment === 'center' ? 'justify-content-center' : ''}">
        ${formattedDataColumns.map((col) => `
          <div class="quotebox col-md-12 col-lg ${columnsAlignment === 'center' ? 'col-lg-4' : ''}">
            <div class="icon-box-grid-column d-flex flex-column justify-content-start">
              ${hasOldSvgImplementation(col.svgNameEl) ? new SvgLoaderComponent(col.svgNameEl.innerText, svgColor, svgSize).render() : col.svgNameEl.innerHTML}
              ${col.title ? `<h6 class="title">${col.title}</h6> ` : ''}
              ${col.subtitle ? `<div class="subtitle">${col.subtitle}</div>` : ''}
              ${col.buttons ? `<div class="buttons">${col.buttons}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
      ${bottomText ? `${bottomText.innerHTML}` : ''}
    </div>
  `;

  decorateIcons(block);
}
