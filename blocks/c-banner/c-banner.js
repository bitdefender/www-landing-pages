export default function decorate(block) {
  const parentBlockStyle = block.closest('.section').style;
  const blockStyle = block.style;
  const metaData = block.closest('.section').dataset;
  const {
    textColor, backgroundColor, padding, margin,
  } = metaData;
  const [richTextEl, pictureEl] = [...block.children];

  if (backgroundColor) parentBlockStyle.backgroundColor = backgroundColor;
  if (textColor) blockStyle.color = textColor;
  if (padding) blockStyle.padding = padding;
  if (margin) blockStyle.margin = margin;

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
