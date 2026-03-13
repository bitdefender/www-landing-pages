export default function decorate(block) {
  const columns = [...block.children[0].children];

  block.innerHTML = `
        <div class="container">
          <div class="row">
            ${columns.map((col) => `<div class="col-12 col-md-4">
              <div class="text-center">
                <div class="mb-2">${col.children[0].innerHTML}</div>
                ${col.children[1] ? `<div class="title mb-2">${col.children[1].innerText}</div>` : ''}
                ${col.children[2] ? `<div class="subtitle mb-2">${col.children[2].innerText}</div>` : ''}
              </div>
            </div>`).join('')}
          </div>
        </div>
    `;
}
