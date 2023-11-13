export default function decorate(block) {
  const parentSelector = block.closest('.section');
  const metaData = parentSelector.dataset;
  const {
    textColor, backgroundColor, padding, margin,
  } = metaData;
  const [richTextEl, pictureEl] = [...block.children];

  if (backgroundColor) {
    parentSelector.style.backgroundColor = backgroundColor;
  }

  if (textColor) {
    block.style.textColor = textColor;
    const elements = block.querySelectorAll('*');

    elements.forEach((element) => {
      element.style.color = textColor;
    });
  }

  if (padding) {
    block.style.padding = padding;
  }

  if (margin) {
    block.style.margin = margin;
  }

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
