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

  const tables = [...right.querySelectorAll('table')];

  const switcherTable = tables[0];
  const priceTable = tables[1];
  const buyTable = tables[2];

  if (!switcherTable || !priceTable || !buyTable) return;

  /*
   * Convert table to div
   */
  const convertTable = (table, className) => {
    const wrapper = document.createElement('div');

    wrapper.className = className;

    [...table.querySelectorAll(':scope > tbody > tr > td, :scope > tr > td')]
      .forEach((td) => {
        const cell = document.createElement('div');

        cell.innerHTML = td.innerHTML;

        wrapper.append(cell);
      });

    table.replaceWith(wrapper);

    return wrapper;
  };

  /* Convert tables */

  const switcher = convertTable(
    switcherTable,
    'card-switcher',
  );

  const price = convertTable(
    priceTable,
    'card-switcher-price-container',
  );

  const buy = convertTable(
    buyTable,
    'card-switcher-buy-container',
  );

  /*
   * Price + switcher
   */

  const priceSwitcherRow = document.createElement('div');

  priceSwitcherRow.className = 'card-switcher-price-row';

  price.parentNode.insertBefore(
    priceSwitcherRow,
    price,
  );

  priceSwitcherRow.append(
    price,
    switcher,
  );

  /* =========================
   * Switcher
   * ========================= */

  const switcherCells = [...switcher.children];

  switcherCells.forEach((cell, index) => {
    cell.classList.add('card-switcher-cell');
    cell.dataset.product = index;

    if (index === 0) {
      cell.classList.add('active');
    }
  });

  /* =========================
   * Text variants
   * ========================= */

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

  /* =========================
   * Prices
   * ========================= */

  const priceCells = [...price.children];

  const priceCell = priceCells[0];
  const saveCell = priceCells[1];

  if (!priceCell) return;

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

  /* =========================
   * Buy buttons
   * ========================= */
  const existingButtons = [...buy.querySelectorAll('a')];
  const buttonText = buy.textContent.trim();

  buy.innerHTML = '';

  if (existingButtons.length) {
    existingButtons.forEach((button, index) => {
      const wrapper = document.createElement('div');

      wrapper.className = 'card-switcher-buy';
      wrapper.dataset.product = index;
      wrapper.hidden = index !== 0;

      const newButton = button.cloneNode(true);

      newButton.classList.add('red-buy-button');

      wrapper.append(newButton);
      buy.append(wrapper);
    });
  } else {
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

      buy.append(wrapper);
    });
  }

  /* =========================
   * Switch
   * ========================= */
  switcher.addEventListener('click', (event) => {
    const cell = event.target.closest('.card-switcher-cell');

    if (!cell) return;

    const selected = Number(cell.dataset.product);

    /* Active switcher */
    switcherCells.forEach((item) => {
      item.classList.toggle(
        'active',
        Number(item.dataset.product) === selected,
      );
    });

    /* Text */
    block
      .querySelectorAll('.card-switcher-value')
      .forEach((item) => {
        item.hidden = Number(item.dataset.product) !== selected;
      });

    /* Price */
    block
      .querySelectorAll('.card-switcher-price')
      .forEach((item) => {
        item.hidden = Number(item.dataset.product) !== selected;
      });

    /* Save */
    block
      .querySelectorAll('.card-switcher-save')
      .forEach((item) => {
        item.hidden = Number(item.dataset.product) !== selected;
      });

    /* Buy */
    buy
      .querySelectorAll('.card-switcher-buy')
      .forEach((item) => {
        item.hidden = Number(item.dataset.product) !== selected;
      });
  });
}
