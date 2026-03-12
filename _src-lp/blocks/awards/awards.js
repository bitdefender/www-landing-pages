export default function decorate(block) {
  const columns = [...block.children[0].children];

  block.innerHTML = `
        <div class="container">
          <div class="row">
            ${columns.map((col) => `<div class="col-12 col-md-4">
              <div class="text-center">
                ${[...col.children].map((item) => `<div class="mb-2">${item.innerHTML}</div>`).join('')}
              </div>
            </div>`).join('')}
          </div>
        </div>
    `;
}
