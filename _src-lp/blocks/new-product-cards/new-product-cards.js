import { decorateIcons } from '../../scripts/lib-franklin.js';
import { updateProductsList, getDatasetFromSection, wrapChildrenWithStoreContext } from '../../scripts/utils.js';
import Constants from '../../scripts/constants.js';

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

function renderNanoBlocks(
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

function updateTagsMargin(block) {
  const greenTags = block.querySelectorAll('.green-tag');
  let greenTagsHeight = 0;
  greenTags.forEach((tag) => {
    if (greenTagsHeight < tag.offsetHeight) greenTagsHeight = tag.offsetHeight;
    block.style.setProperty('--green-tag-height', `${greenTagsHeight}px`);
  });
}

function renderGreenTag(text) {
  const root = document.createElement('div');

  root.classList.add('green-tag');
  root.innerHTML = text.replace('PERCENT', '&nbsp;<span data-store-render data-store-discount="percentage"></span>');
  root.setAttribute('data-store-hide', '!it.option.price.discounted ');
  if (!text) root.classList.add('hidden');

  return root;
}

function renderBlueTag(text, icon) {
  const root = document.createElement('div');
  root.classList.add('blue-tag-container');
  root.innerHTML = `<div class="blue-tag">${icon ? `<span class="icon icon-${icon}"></span>` : ''}${text}</div>`;
  return root;
}

function renderRadios(...radios) {
  const cardIndex = radios[radios.length - 2];
  const root = document.createElement('div');
  root.classList.add('radios-container');
  const productCard = radios[radios.length - 1];
  const section = productCard.closest('.section');
  const products = section.dataset[`pricing${cardIndex + 1}`]?.split(',') || [];
  const checkedRadio = section.dataset.checkedRadio;

  radios.forEach((radio, idx) => {
    if (typeof radio === 'string') {
      if (!radio) return;
      const radioWrapper = document.createElement('div');
      radioWrapper.classList.add('radio-wrapper');
      const radioElement = document.createElement('input');
      radioElement.classList.add('radio');
      radioElement.type = 'radio';
      radioElement.name = `radio-card-${cardIndex}`;
      radioElement.value = `radio-card-${cardIndex}-${idx}`;
      radioElement.id = `radio-card-${cardIndex}-${idx}`;
      radioElement.setAttribute('data-store-action', '');
      radioElement.setAttribute('data-store-set-id', `${products[idx]?.split('/')[0].trim()}`);
      radioElement.setAttribute('data-store-set-devices', `${products[idx]?.split('/')[1].trim()}`);
      radioElement.setAttribute('data-store-set-subscription', `${products[idx]?.split('/')[2].trim()}`);
      if (checkedRadio && idx + 1 === Number(checkedRadio)) radioElement.checked = true;

      const radioLabel = document.createElement('label');
      radioLabel.setAttribute('for', `radio-card-${cardIndex}-${idx}`);
      radioLabel.innerText = radio;
      radioWrapper.appendChild(radioElement);
      radioWrapper.appendChild(radioLabel);
      root.appendChild(radioWrapper);
    }
  });

  return root;
}

function renderPricing(...products) {
  const root = document.createElement('div');
  root.classList.add('pricing-container');
  const productCard = products[products.length - 1];

  const section = productCard.closest('.section');
  const monthlyPrice = section.dataset.monthlyPrice;
  const billedPrice = productCard.querySelector('.billed-price-container');
  console.log(billedPrice);

  const productName = products[0].split('/')[0];

  root.innerHTML += `
        <div class="pricing">
           <div class="save_price_box await-loader new-store" data-store-render data-store-hide="!it.option.price.discounted">
              <span class="prod-oldprice" data-store-render data-store-price="full"></span>
              <strong class="save prod-percent">Save <span data-store-render data-store-discount="percentage"></span></strong>
            </div>
            <div class="prices_box await-loader new-store">
              <span class="prod-newprice" data-store-render
              ${monthlyPrice && !Constants.MONTHLY_PRODUCTS.includes(productName)
    ? 'data-store-price="discounted-monthly||full-monthly"'
    : 'data-store-price="discounted||full"'}">
              </span>
              ${monthlyPrice ? `<sup>${monthlyPrice}</sup>` : ''}
            </div>
        </div>
      `;

  if (billedPrice) {
    billedPrice.innerHTML += '<span class="prod-newprice billed-price" data-store-render data-store-price="discounted||full"></span>';
  }

  return root;
}

createNanoBlock('greenTag', renderGreenTag);
createNanoBlock('blueTag', renderBlueTag);
createNanoBlock('radios', renderRadios);
createNanoBlock('pricing', renderPricing);

function replacePill(content) {
  const pillPattern = /\?(blue|green)-pill\s+([^?]+?)(?:\s*(<span class="icon[^"]*">[\s\S]*?<\/span>))?(?=\s*\?(?:blue|green)-pill\s+|$)/g;

  return content.replace(pillPattern, (match, pillType, pillText, icon) => {
    const pillElement = document.createElement('span');
    pillElement.classList.add(`${pillType}-pill`);
    pillElement.innerHTML = `${pillText.trim()}${icon || ''}`;
    return pillElement.outerHTML;
  });
}

function setSliderBoxVisibility(block, showFamilyBoxes) {
  block.querySelectorAll('.family-box').forEach((box) => {
    box.style.display = showFamilyBoxes ? 'grid' : 'none';
  });

  block.querySelectorAll('.individual-box').forEach((box) => {
    box.style.display = showFamilyBoxes ? 'none' : 'grid';
  });

  updateTagsMargin(block);
}

function removeArrowMarker(element) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);

  while (walker.nextNode()) {
    const textNode = walker.currentNode;
    const updatedText = textNode.textContent.replace(/\s*<-\s*/, '');

    if (updatedText !== textNode.textContent) {
      textNode.textContent = updatedText;
      break;
    }
  }
}

export default async function decorate(block) {
  const section = block.closest('.section');
  const productCards = [...block.children];
  const { checkedRadio, slider, sliderIcons } = section.dataset;
  let limit = productCards.length;
  let switchCheckbox;
  if (slider) {
    limit = productCards.length / 2;
    const switchBox = document.createElement('div');

    const [partsIndividual, partsFamily] = slider ? slider.split(',') : ['', ''];
    const [iconIndividual, iconFamily] = sliderIcons ? sliderIcons.split(',') : ['', ''];

    switchBox.classList.add('switchBox');
    switchBox.innerHTML = `  
            <label class="switch"> 
              <input type="checkbox" id="switchCheckbox">
              <span class="slider round"></span>
              <span class="label left">
                ${iconIndividual ? `<span class="icon icon-${iconIndividual}"></span>` : ''}
                ${partsIndividual ? `<p>${partsIndividual}</p>` : ''}
              </span>
               <span class="label right">
                ${iconFamily ? `<span class="icon icon-${iconFamily.trim()}"></span>` : ''}
                ${partsFamily ? `<p>${partsFamily}</p>` : ''}
              </span>
            </label>
          `;

    // Get the checkbox inside the switchBox
    switchCheckbox = switchBox.querySelector('#switchCheckbox');
    if (section.classList.contains('reverted-slider')) {
      switchCheckbox.checked = true;
      switchCheckbox.setAttribute('checked', '');
    }
    // Add an event listener to the checkbox
    switchCheckbox.addEventListener('change', () => {
      setSliderBoxVisibility(block, switchCheckbox.checked);
    });

    block.parentElement.prepend(switchBox);
  }

  productCards.forEach((card, idx) => {
    if (idx >= limit) card.classList.add('family-box');
    else card.classList.add('individual-box');
    card.classList.add('prod_box');
    const innerCard = card.querySelector(':scope > div');
    if (innerCard) {
      innerCard.classList.add('inner_prod_box');
      const products = block.closest('.section').dataset[`pricing${idx + 1}`]?.split(',') || [];
      const activeProduct = products[checkedRadio - 1] || products[0];
      const [activeProductName, activeProductUsers, activeProductYears] = activeProduct.split('/');
      wrapChildrenWithStoreContext(innerCard, {
        productId: activeProductName,
        devices: activeProductUsers,
        subscription: activeProductYears,
        storeEvent: 'info',
      });

      const listElements = innerCard.querySelectorAll('.inner_prod_box > ul > li');
      listElements.forEach((li) => {
        li.innerHTML = replacePill(li.innerHTML);
        if (li.innerText.includes('<-')) {
          li.classList.add('has-arrow-left');
          removeArrowMarker(li);
        }
      });

      const buyButtons = innerCard.querySelectorAll('a[href*="#buylink"]');

      buyButtons.forEach((button) => {
        button.classList.add('red-buy-button');
        button.setAttribute('data-store-render', '');
        button.setAttribute('data-store-buy-link', '');
      });

      const paragraphs = card.querySelectorAll('p');
      paragraphs.forEach((p) => {
        p.innerHTML = p.innerHTML.replace(0, '<span class="billed-price-container"></span>');
      });

      const addOnList = card.querySelector(':scope  div  ol');
      if (addOnList) {
        const items = addOnList.querySelectorAll(':scope > li');

        const [isCheckbox, addonProduct, addonContent] = [...items];

        if (isCheckbox.textContent.toLowerCase().includes('add-on-checkbox') && addonProduct) {
          updateProductsList(addonProduct.textContent.trim());
          const [addOnProductName, addOnProductUsers, addOnProductYears] = addonProduct.textContent.trim().split('/');
          isCheckbox.remove();
          addonProduct.remove();

          const addOnLabel = document.createElement('label');
          addOnLabel.setAttribute('for', `addon-checkBox-${idx}`);
          addOnLabel.innerHTML = `
            ${addonContent.innerHTML
    .replace('{PERCENT}', '&nbsp;<span class="add-on-percent"><span class="prod-percent" data-store-render data-store-discount="percentage"></span></span>')
    .replace('{PRICE}', '<span class="add-on-price"><span class="prod-newprice" data-store-render data-store-price="discounted||full"></span></span>')
    .replace('{OLD_PRICE}', '&nbsp;<span class="add-on-percent"><span class="prod-oldprice" data-store-render data-store-price="full"></span></span>')}
    `;

          wrapChildrenWithStoreContext(addOnLabel, {
            productId: addOnProductName,
            devices: addOnProductUsers,
            subscription: addOnProductYears,
            ignoreEventsParent: true,
            storeEvent: 'info',
          });
          addonContent.innerHTML = ` <div class= "vpn_box">
          <input type="checkbox" id="addon-checkBox-${idx}" name="addon-checkbox-${idx}"
          data-store-action data-store-set-bundle 
          data-store-set-id="${addOnProductName}"
          data-store-set-devices="${addOnProductUsers}"
          data-store-set-subscription="${addOnProductYears}"
          class="checkboxVPN" value="">
          ${addOnLabel.outerHTML}
          </div>
        `;
        }
      }

      renderNanoBlocks(innerCard, undefined, idx);
    }
  });

  if (slider) {
    setSliderBoxVisibility(block, switchCheckbox?.checked);
  }

  await decorateIcons(block.closest('.section'));

  const resizeObserver = new ResizeObserver(() => {
    updateTagsMargin(block);
  });
  resizeObserver.observe(document.body);
}
