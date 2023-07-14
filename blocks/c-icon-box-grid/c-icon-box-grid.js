/*
  Information:

  MetaData:
  - svgColor :svgColor = "blue" | #313fad,
  - svgSize : svgSize = "smal" | medium

  Samples:
  - https://www.bitdefender.com/media/html/consumer/new/2020/cl-offer1-opt/ultimate-flv1.html
*/
import SvgLoaderComponent from '../../components/svg-loader/svg-loader.js';
import { getDatasetFromSection } from '../../scripts/utils.js';

export default function decorate(block) {
  const metaData = getDatasetFromSection(block);

  const svgColor = metaData.svgcolor;
  const svgSize = metaData.svgsize;

  const formattedDataColumns = [...block.children[0].children].map((svgNameEl, tableIndex) => ({
    svgName: svgNameEl.innerText,
    title: block.children[1].children[tableIndex].innerText,
    subtitle: block.children[2].children[tableIndex].innerText,
  }));

  block.innerHTML = `
    <div class="container">
      <div class="row">
        ${formattedDataColumns.map((col) => `
          <div class="col-md-12 col-lg">
            <div class="d-flex flex-column justify-content-start">
              ${new SvgLoaderComponent(col.svgName, svgColor, svgSize).render()}
              <h6 class="title">${col.title}</h6> 
              <p class="subtitle">${col.subtitle}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
