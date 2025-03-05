import { updateProductsList, getDatasetFromSection, matchHeights } from '../../scripts/utils.js';

const nanoBlocks = new Map();

function createNanoBlock(name, renderer) {
  nanoBlocks.set(name.toLowerCase(), renderer);
}

function findTextNodes(parent) {
  let all = [];
  for (let node = parent.firstChild; node; node = node.nextSibling) {
    if (node.nodeType === Node.TEXT_NODE) all.push(node);
    else all = all.concat(findTextNodes(node));
  }
  return all;
}

function parseParams(params) {
  const segments = params.split(',').map((segment) => segment.trim());
  const result = [];

  let tempArray = [];
  let isInArray = false;

  segments.forEach((segment) => {
    if (isInArray) {
      if (segment.endsWith(']')) {
        tempArray.push(segment.slice(0, -1).trim());
        result.push(tempArray);
        tempArray = [];
        isInArray = false;
      } else {
        tempArray.push(segment.trim());
      }
    } else if (segment.startsWith('[')) {
      if (segment.endsWith(']')) {
        result.push(segment.slice(1, -1).trim());
      } else {
        tempArray.push(segment.slice(1).trim());
        isInArray = true;
      }
    } else {
      result.push(segment);
    }
  });

  return result;
}

function replaceDoubleCommas(str) {
  // Convert the string to an array for easy manipulation
  const arr = str.split('');

  // Loop through the array from the end to the beginning
  for (let i = arr.length - 1; i > 0; i -= 1) {
    // Check if there are two consecutive commas
    if (arr[i] === ',' && arr[i - 1] === ',') {
      // Replace the two consecutive commas with a single comma
      arr.splice(i, 1);
    }
  }

  // Convert the array back to a string
  return arr.join('');
}

async function renderNanoBlocks(
  parent = document.body,
  mv = undefined,
  index = undefined,
  block = undefined,
) {
  const regex = /{([^}]+)}/g;
  findTextNodes(parent).forEach((node) => {
    const text = node.textContent.trim();
    const matches = text.match(regex);
    if (matches) {
      matches.forEach((match) => {
        const [name] = parseParams(match.slice(1, -1));
        const datasetValue = getDatasetFromSection(parent);

        const datasetEntryValue = (index !== undefined ? datasetValue[`${name.toLowerCase()}${index + 1}`] : datasetValue[name.toLowerCase()]) || '';
        const formattedDatasetEntryValue = replaceDoubleCommas(datasetEntryValue);

        const newMatch = [match, formattedDatasetEntryValue.split(',')].join(',').replace(/[{}]/g, '');

        const [newName, ...params] = parseParams(newMatch);
        const renderer = nanoBlocks.get(newName.toLowerCase());
        if (renderer) {
          // eslint-disable-next-line max-len
          const element = mv ? renderer(mv, ...params, block, index, parent) : renderer(...params, block, index, parent);
          element.classList.add('nanoblock');
          const oldElement = node.parentNode;
          oldElement.parentNode.replaceChild(element, oldElement);
        }
      });
    }
  });
}

const state = {
  firstProduct: null,
  secondProduct: null,
  currentProduct: null,
  currentUsers: null,
  currentYears: null,
  membersIndex: 0,
  blockDataset: null,
};

const MEMBERS_MAP = new Map();

function expandItem(content) {
  content.style.height = `${content.scrollHeight}px`;
  const transitionEndCallback = () => {
    content.removeEventListener('transitionend', transitionEndCallback);
    content.style.height = 'auto';
  };
  content.addEventListener('transitionend', transitionEndCallback);
  content.classList.add('expanded');
}

function collapseItem(content) {
  content.style.height = `${content.scrollHeight}px`;
  requestAnimationFrame(() => {
    content.classList.remove('expanded');
    content.style.height = 0;
  });
}

function eventListener(ul) {
  return (event) => {
    let target = null;
    // find ancestor a tag
    if (event.target.tagName !== 'A') {
      target = event.target.closest('a');
    } else {
      target = event.target;
    }

    // if the clicked node is not open then open it
    if (!target.classList.contains('is-open')) {
      target.classList.add('is-open');
      // if the clicked node has children then toggle the expanded class
      if (target.parentNode.children.length > 1) {
        target.parentNode.querySelectorAll('.features-tabs-content').forEach((content) => {
          expandItem(content);
        });
      }
      // hide the other tabs

      ul.querySelectorAll('li').forEach((collapsedLi) => {
        if (collapsedLi !== target.parentNode) {
          collapsedLi.children[0].classList.remove('is-open');
          collapsedLi.querySelectorAll('.features-tabs-content').forEach((content) => {
            collapseItem(content);
          });
        }
      });
    } else {
      target.classList.remove('is-open');
      // if the clicked node has children then toggle the expanded class
      if (target.parentNode.children.length > 1) {
        target.parentNode.querySelectorAll('.features-tabs-content').forEach((content) => {
          collapseItem(content);
        });
      }
    }
  };
}

function extractFeatures(col) {
  const ul = document.createElement('ul');
  ul.classList.add('features-tabs');

  // select all h4 tags as feature titles
  col.querySelectorAll('h4').forEach((h4) => {
    const li = document.createElement('li');
    ul.appendChild(li);

    const a = document.createElement('a');
    a.setAttribute('href', '#');

    // register click event on a tag

    a.addEventListener('click', (event) => {
      event.preventDefault();
      eventListener(ul)(event);
    });

    h4.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        a.appendChild(document.createTextNode(node.textContent));
      } else {
        a.appendChild(node);
      }
    });

    a.classList.add('features-tabs-title');

    li.appendChild(a);

    // all descendants of a that have class tag
    a.querySelectorAll('.tag').forEach((tag) => {
      li.appendChild(tag);
    });

    const content = document.createElement('div');
    content.classList.add('features-tabs-content');
    li.appendChild(content);

    // every oaragraph until next h4
    let nextElement = h4.nextElementSibling;
    while (nextElement && nextElement.tagName !== 'H4') {
      content.appendChild(nextElement);
      nextElement = h4.nextElementSibling;
    }

    ul.appendChild(li);

    h4.remove();
  });

  return ul;
}

function renderRadioGroup(block) {
  const radioBoxParent = document.createElement('div');
  radioBoxParent.className = 'radioBoxParent d-flex';
  const [radio1, radio2] = block.closest('.section').dataset.radioLabels.split(',');
  const createRadioBox = (id, className, name, value, text, type, checked = false) => {
    const radioBox = document.createElement('div');
    radioBox.innerHTML = `<div class="d-radio">
      <input type="radio" id="${id}" data-select="${type}" class="${className}" name="${name}" value="${value}" ${checked ? 'checked="checked"' : ''}>
      <label for="${id}">${text}</label>
    </div>`;
    return radioBox;
  };

  radioBoxParent.appendChild(createRadioBox(`pay_${state.secondProduct}`, `selector-${state.secondProduct}`, 'selectorBox', state.secondProduct, radio1, 'monthly', true));
  radioBoxParent.appendChild(createRadioBox(`pay_${state.firstProduct}`, `selector-${state.firstProduct}`, 'selectorBox', state.firstProduct, radio2, 'yearly'));

  return radioBoxParent;
}

function renderPrice(block, ...price) {
  const variant = 'vsbm51';
  const priceZone = document.createElement('div');
  priceZone.classList.add('price-element-wrapper');
  const btnText = block.querySelector('a').textContent;
  // Function to create and append price boxes
  const createPriceBox = (className, product) => {
    const pricesBox = document.createElement('div');
    const [productCode, prodUsers, prodYears] = product.split('/');
    pricesBox.className = `${className} ${productCode}_box prices_box await-loader prodload prodload-${productCode}-${prodUsers}${prodYears}`;
    pricesBox.innerHTML = `<div>
        <div class="display-flex">
          <span class="prod-oldprice oldprice-${productCode}-${prodUsers}${prodYears}"></span>
        </div>
        <div class="display-flex">
          <span class="prod-newprice newprice-${productCode}-${prodUsers}${prodYears}"></span>
        </div>
        <p class="button-container">
          <a href='#' title='Bitdefender ${product.split('/')[0]}' class=' red-buy-button prodload prodload-${productCode}-${prodUsers}${prodYears} buylink-${productCode}-${prodUsers}${prodYears} referrerpolicy='no-referrer-when-downgrade'>${btnText}</a>
        </p>
      </div>`;
    updateProductsList(product.trim());
    return pricesBox;
  };

  price.forEach((product) => {
    if (product && typeof product === 'string') {
      priceZone.appendChild(createPriceBox(product.replaceAll('/', '') === variant ? 'show' : 'hide', product));
    }
  });

  block.querySelector('a').remove();
  return priceZone;
}

function getBlueTags(block) {
  let blueTags = block.querySelectorAll('.tag-blue');
  if (!blueTags.length) {
    const benefitsList = block.querySelector('ul');
    benefitsList?.classList.add('benefits-list');
    const benefitsListElements = benefitsList?.querySelectorAll('li');
    benefitsListElements?.forEach((element) => {
      const blueTag = document.createElement('span');
      blueTag.classList.add('tag-blue');
      element.insertAdjacentElement('beforeend', blueTag);
    });
    blueTags = block.querySelectorAll('.tag-blue');
  }
  return blueTags;
}

function updateBenefits(block, selectEl, metadata) {
  const blueTags = getBlueTags(block);
  const selectedOption = [...selectEl.options].find((option) => option.hasAttribute('selected'));
  const neededIndex = [...selectEl.options].indexOf(selectedOption);
  const updatedBenefits = JSON.parse(metadata[neededIndex]);
  let counter = 0;
  blueTags.forEach((tag) => {
    // eslint-disable-next-line no-plusplus
    tag.textContent = `x${updatedBenefits[counter++]}`;
  });
}

function renderSelector(block, ...options) {
  const metadata = block.parentElement.parentElement.dataset;
  const membersText = metadata.membersText ?? ',';
  const selectorOptions = options
    .filter((option) => option && !Number.isNaN(Number(option)))
    .map((opt) => Number(opt));
  const defaultSelection = Number(state.blockDataset.defaultselection) || selectorOptions[1];
  const el = document.createElement('div');
  el.classList.add('products-sideview-selector');
  el.innerHTML = `
      <select>
          ${selectorOptions.sort((first, second) => first - second).map((opt) => `
            <option value="${opt}" ${opt === defaultSelection ? 'selected' : ''}>${opt} ${opt === 1 ? membersText.split(',')[0] : membersText.split(',')[1]}</option>
          `).join('/n')}
      </select>
    `;
  const selectEl = el.querySelector('select');
  selectEl.value = defaultSelection;
  selectEl.querySelectorAll('option')?.forEach((option, idx) => {
    option.setAttribute('data-selector-u', `u_${options[idx]}`);
    option.setAttribute('data-value-u', options[idx]);
  });
  selectEl.addEventListener('change', (e) => {
    [...selectEl.options].forEach((option) => option.removeAttribute('selected'));
    [...selectEl.options].find((option) => option.value === e.target.value)?.setAttribute('selected', '');
    updateBenefits(block, selectEl, metadata.benefits.split(',,'));
  });
  updateBenefits(block, selectEl, metadata.benefits.split(',,'));
  return el;
}

createNanoBlock('price', renderPrice);
createNanoBlock('monthlyYearly', renderRadioGroup);
createNanoBlock('selectMembers', renderSelector);

function initMembersMap() {
  const selectMembers = state.blockDataset.selectmembers.trim().split(',');
  selectMembers.forEach((member, index) => MEMBERS_MAP.set(index, Number(member)));
}

function initializeDynamicSelection(block) {
  const updateStateAndBuyZone = (updatedState) => {
    // Update the state object
    state.currentProduct = updatedState.currentProduct;
    state.currentUsers = updatedState.currentUsers;
    state.currentYears = updatedState.currentYears;

    // Build the variation dynamically
    const variation = `${state.currentUsers}${state.currentYears}`;

    // Hide all buy zones
    const allBuyZones = block.querySelectorAll('.prices_box');
    allBuyZones.forEach((zone) => zone.classList.add('hide'));

    // Build the buy zone key dynamically
    const buyZoneKey = `.prodload-${state.currentProduct}-${variation}`;
    const selectedBuyZone = block.querySelector(buyZoneKey);
    if (selectedBuyZone) {
      selectedBuyZone.classList.remove('hide');
    }
  };

  // Set the default radio group selection
  const radioInputs = block.querySelectorAll('.d-radio input[type="radio"]');
  radioInputs.forEach((radio) => {
    if (radio.checked) {
      const product = radio.value;
      state.currentProduct = product;
      updateStateAndBuyZone(state);
    }

    // Add event listener to update selection dynamically
    radio.addEventListener('change', (event) => {
      const selectedProduct = event.target.value;
      state.currentProduct = selectedProduct;
      updateStateAndBuyZone(state);
    });
  });

  // Set the default selector group selection
  const selector = block.querySelector('.products-sideview-selector select');
  if (selector) {
    selector.addEventListener('change', () => {
      const selectedUsers = selector.options[selector.selectedIndex].value;
      state.currentUsers = selectedUsers;
      // Get the selected radio input to maintain consistency
      updateStateAndBuyZone(state);
    });

    // Trigger change event to set the default state
    const defaultOption = selector.querySelector('option[selected]');
    if (defaultOption) {
      selector.value = defaultOption.value;
      selector.dispatchEvent(new Event('change'));
    }
  }
}

export default function decorate(block) {
  const blockDataset = getDatasetFromSection(block);

  state.blockDataset = blockDataset;
  [state.currentProduct, state.currentUsers, state.currentYears] = state.blockDataset.defaultProduct.split('/');
  state.firstProduct = state.blockDataset.blockProducts.split(',')[0].trim();
  state.secondProduct = state.blockDataset.blockProducts.split(',')[1].trim();
  initMembersMap();
  block.firstElementChild.classList.add('d-flex');
  block.firstElementChild.firstElementChild.classList.add('pricing-wrapper');
  block.firstElementChild.lastElementChild.classList.add('features-wrapper');
  renderNanoBlocks(block.firstElementChild, block);
  const cols = [...block.firstElementChild.children];
  block.classList.add(`features-${cols.length}-cols`);
  const col = block.children[0].children[1];
  col.appendChild(extractFeatures(col));
  initializeDynamicSelection(block);
  matchHeights(block, '.block >div >div >p:first-of-type');
  matchHeights(block, '.block >div >div >:first-child');
}
