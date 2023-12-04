export default function decorate(block) {
  // get data attributes set in metaData
  const parentSelector = block.closest('.section');
  const metaData = parentSelector.dataset;

  // config new elements
  const {
    product,
  } = metaData;
  let [richText, columns] = block.children;
  columns = [...columns.children];

  block.innerHTML = `
    <div class="row">
      <div class="col-md-6">
        ${richText.innerHTML}
      </div>
      ${columns.map((col) => `
        <div class="col-md-3">
          <div class="aem-two-cards_card">
            ${col.innerHTML}
          </div>
        </div>`).join('')}
    </div>
  `;
}
