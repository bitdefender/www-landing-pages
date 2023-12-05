export default function decorate(block) {
  // eslint-disable-next-line prefer-const
  let [richText, columns] = block.children;
  columns = [...columns.children];

  block.innerHTML = `
    <div class="row row-gap-3">
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
