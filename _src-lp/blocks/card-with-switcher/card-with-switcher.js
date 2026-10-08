import { productAliases } from '../../scripts/scripts.js';
import { updateProductsList } from '../../scripts/utils.js';

export default function decorate(block) {
  const section = block.closest('.section');
  const { products } = section.dataset;

  if (!products) return;

  const productList = products
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  const productData = productList.map((product) => {
    const [name, users, years] = product.split('/');

    updateProductsList(product);

    return {
      selector: `${productAliases(name)}-${users}${years}`,
    };
  });

  const content = block.children[1];
  const right = block.children[2];

  if (!content || !right) return;

  const tables = right.querySelectorAll('table');
  const switcherTable = tables[0];
  const priceTable = tables[1];
  const buyTable = tables[2];

  if (!switcherTable || !priceTable || !buyTable) return;

  /* Switcher */
  const switcherCells = [...switcherTable.querySelectorAll('td')];

  switcherCells.forEach((cell, index) => {
    cell.dataset.product = index;

    if (index === 0) {
      cell.classList.add('active');
    }
  });

  /* Text variants */
  content.querySelectorAll('li').forEach((li) => {
    if (!li.textContent.includes('|')) return;

    const values = li.textContent.split('|').map((v) => v.trim());

    li.innerHTML = values.map((value, index) => `
      <span
        class="card-switcher-value"
        data-product="${index}"
        ${index ? 'hidden' : ''}
      >
        ${value}
      </span>
    `).join('');
  });

  /* Prices */
  const priceCells = priceTable.querySelectorAll('td');

  const priceCell = priceCells[0];
  const saveCell = priceCells[1];

  priceCell.innerHTML = productData.map((product, index) => `
    <div
      class="card-switcher-price"
      data-product="${index}"
      ${index ? 'hidden' : ''}
    >
      <span class="prod-oldprice oldprice-${product.selector}"></span>
      <span class="prod-newprice newprice-${product.selector}"></span>
    </div>
  `).join('');

  if (saveCell) {
    saveCell.innerHTML = productData.map((product, index) => `
      <div
        class="card-switcher-save"
        data-product="${index}"
        ${index ? 'hidden' : ''}
      >
        <span class="save-${product.selector}"></span>
      </div>
    `).join('');
  }

  /* Buy buttons */
  const buyCell = buyTable.querySelector('td');

  if (!buyCell) return;

  const existingButtons = [...buyCell.querySelectorAll('a')];

  if (existingButtons.length) {
    existingButtons.forEach((button, index) => {
      const wrapper = document.createElement('div');

      wrapper.className = 'card-switcher-buy';
      wrapper.dataset.product = index;
      wrapper.hidden = index !== 0;

      button.parentElement.replaceWith(wrapper);

      button.classList.add('red-buy-button');

      wrapper.append(button);
    });
  } else {
    const buttonText = buyCell.textContent.trim();

    buyCell.innerHTML = '';

    productData.forEach((product, index) => {
      const wrapper = document.createElement('div');

      wrapper.className = 'card-switcher-buy';
      wrapper.dataset.product = index;
      wrapper.hidden = index !== 0;

      wrapper.innerHTML = `
      <a
        href="#"
        class="red-buy-button await-loader prodload prodload-${product.selector} buylink-${product.selector}"
      >
        ${buttonText}
      </a>
    `;

      buyCell.append(wrapper);
    });
  }

  /* Switch */
  switcherTable.addEventListener('click', (event) => {
    const cell = event.target.closest('td[data-product]');

    if (!cell) return;

    const selected = Number(cell.dataset.product);

    switcherCells.forEach((item) => {
      item.classList.toggle(
        'active',
        Number(item.dataset.product) === selected,
      );
    });

    block
      .querySelectorAll('.card-switcher-value')
      .forEach((item) => {
        item.hidden = Number(item.dataset.product) !== selected;
      });

    block
      .querySelectorAll('.card-switcher-price')
      .forEach((item) => {
        item.hidden = Number(item.dataset.product) !== selected;
      });

    block
      .querySelectorAll('.card-switcher-save')
      .forEach((item) => {
        item.hidden = Number(item.dataset.product) !== selected;
      });

    buyCell
      .querySelectorAll('.card-switcher-buy')
      .forEach((item) => {
        item.hidden = Number(item.dataset.product) !== selected;
      });
  });
}
