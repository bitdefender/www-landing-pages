import { getDatasetFromSection } from '../../scripts/utils.js';

export default function decorate(block) {
  const [richTextEl, pictureEl] = [...block.children];

  const metadata = getDatasetFromSection(block);

  block.innerHTML = `
      <div class="container-fluid pt-lg-5">
        <div class="row d-none d-lg-flex">
          <div class="col-5 ps-4">${richTextEl.innerHTML}</div>
          <div class="col-7">
          ${pictureEl.innerHTML}
          </div>
        </div>
        <div class="row d-lg-none justify-content-center">
          <div class="col-12 p-0">
          ${pictureEl.innerHTML}
          </div>
          <div class="col-12 col-md-7 text-center">${richTextEl.innerHTML}</div>
        </div>
      </div>
    `;
}
