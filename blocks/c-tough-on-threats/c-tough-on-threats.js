export default function decorate(block) {
  let [titleEl, extraClass, flexClass, orderClass] = ['', '', ' d-flex justify-content-center align-items-center', ' order-last'];
  let [richTextEl, pictureEl] = [...block.children[0].children];
  if (block.children.length > 1) {
    [titleEl, extraClass, flexClass, orderClass] = [`<div class="row"><div class="col-12 col-sm-12 col-md-5 col-lg-5">${block.children[0].children[0].innerHTML}</div></div>`, ' text-center', '', ''];
    [richTextEl, pictureEl] = [...block.children[1].children];
  }

  block.innerHTML = `
    <div class="container py-5">
    ${titleEl}
      <div class="row">
        <div class="col-12 col-md-7${orderClass} order-md-first${extraClass}">${richTextEl.innerHTML}</div>
        <div class="col-12 col-md-5${flexClass} mb-md-0 mb-4 mx-auto">
          ${pictureEl.innerHTML}
        </div>
      </div>
    </div>
  `;
}
