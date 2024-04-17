import ColumnComponent from '../../components/column/column.js';

export default function decorate(block) {
  const [firstCol, pictureCol] = Array.from(block.firstElementChild.children);

  block.innerHTML = `
    <div class="container">
      <div class="row g-0">
        <div class="col-12 col-md-6">
          ${new ColumnComponent(firstCol, 'secondary').render()}
        </div>
        <div class="col-12 col-md-6">
          ${pictureCol.innerHTML}
        </div>
      </div>
    </div>
  `;
}
