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

  const lastElIndex = block.children.length - 1;

  const pictureEl = block.children[0];
  const linkEl = block.children[lastElIndex];
  const rowText = [...block.children].slice(1, lastElIndex);

  block.innerHTML = `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12 col-lg-6">
          ${pictureEl.innerHTML}
        </div>
        <div class="col-12 col-lg-4 mt-3">
          ${rowText.map((row) => `
            <div class="d-flex row-box">
              <div>${new SvgLoaderComponent(row.children[0].innerText, svgColor, svgSize).render()}</div>
              <div class="ms-3">${row.children[1].innerHTML}</div>
            </div>
          `).join('')}
           ${linkEl.outerHTML}
        </div>
      </div>
    </div>
  `;
}
