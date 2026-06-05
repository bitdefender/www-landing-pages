import { decorateIcons } from '../../scripts/lib-franklin.js';
import { updateProductsList, getDatasetFromSection } from '../../scripts/utils.js';

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

function renderGreenTag(text, ...params) {
  console.log('Rendering green tag with text:', text, 'and params:', params);
  const root = document.createElement('div');
  const cardIndex = params[params.length - 2];
  const card = params[params.length - 1];
  console.log(card.closest('.section').dataset);
  // eslint-disable-next-line no-unsafe-optional-chaining
  const [product, productUsers, productYears] = card?.closest('.section')?.dataset?.[`buyzone${cardIndex + 1}`]?.split(',')?.[0]?.split('/');
  const selectorClass = `${product}-${productUsers}${productYears}`;
  root.classList.add('green-tag');
  root.innerHTML = text.replace('PERCENT', `&nbsp;<span class="percent-${selectorClass.trim()}"></span>`);

  if (!text) root.classList.add('hidden');

  return root;
}

function renderBlueTag(text, icon) {
  const root = document.createElement('div');
  root.classList.add('blue-tag');
  root.innerHTML = `<span class="icon icon-${icon}"></span>${text}`;
  return root;
}

function renderRadios(...radios) {
  const cardIndex = radios[radios.length - 2];
  const root = document.createElement('div');
  root.classList.add('radios-container');

  radios.forEach((radio, idx) => {
    if (typeof radio === 'string') {
      const radioWrapper = document.createElement('div');
      radioWrapper.classList.add('radio-wrapper');
      const radioElement = document.createElement('input');
      radioElement.classList.add('radio');
      radioElement.type = 'radio';
      radioElement.name = `radio-card-${cardIndex}`;
      radioElement.value = `radio-card-${cardIndex}-${idx}`;
      radioElement.id = `radio-card-${cardIndex}-${idx}`;

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

function renderBuyzone(...products) {
  const root = document.createElement('div');
  const { billedText } = products[products.length - 1].closest('.section').dataset;
  root.classList.add('buyzone-container');

  products.forEach((product) => {
    if (typeof product === 'string') {
      updateProductsList(product);
      const [productName, productUsers, productYears] = product.split('/');
      const selectorClass = `${productName}-${productUsers}${productYears}`;

      root.innerHTML += `
        <div class="buyzone">
           <div class="save_price_box await-loader prodload prodload-${selectorClass}">
              <span class="prod-oldprice oldprice-${selectorClass}"></span>
              <strong class="save prod-percent">Save <span class="percent-${selectorClass}"></span></strong>
            </div>
            <div class="prices_box await-loader prodload prodload-${selectorClass}">
              <span class="prod-newprice newprice-${selectorClass}"></span>
            </div>
            ${billedText ? `<p class="billed">${billedText}</p>` : ''}
            <a class="red-buy-button buylink-${selectorClass}" href="#">Buy Now</a>
        </div>
      `;
    }
  });

  return root;
}

createNanoBlock('greenTag', renderGreenTag);
createNanoBlock('blueTag', renderBlueTag);
createNanoBlock('radios', renderRadios);
createNanoBlock('buyzone', renderBuyzone);

function replacePill(content, regExp, pillClass) {
  const pillText = content.match(regExp);

  const icon = content.match(/(?<!<span[^>]*\b(?:blue-pill|green-pill)\b[^>]*>[^<]*?)<span class="[^"]*\bicon\b[^"]*">.*?<\/span>/g);
  let updatedContent = content;

  if (pillText) {
    // Remove original icon if found
    if (icon) {
      updatedContent = updatedContent.replace(icon[0], '');
    }

    // Create the pill element
    const pillElement = document.createElement('span');
    pillElement.classList.add(pillClass);
    pillElement.innerHTML = `${pillText[1]}${icon ? icon[0] : ''}`;

    // Replace the ?pill or ?green-pill directive with the new pill HTML
    updatedContent = updatedContent.replace(pillText[0], pillElement.outerHTML);
  }

  return updatedContent;
}

function selectRadioBuyzone(innerCard, selectedRadioIndex) {
  const radios = innerCard.querySelectorAll('.radio-wrapper');
  const buyzones = innerCard.querySelectorAll('.buyzone');

  radios.forEach((radio, radioIndex) => {
    const input = radio.querySelector('input');
    if (!input) return;

    input.checked = radioIndex === selectedRadioIndex;
    input.toggleAttribute('checked', radioIndex === selectedRadioIndex);
  });

  buyzones.forEach((buyzone, buyzoneIndex) => {
    buyzone.style.display = buyzoneIndex === selectedRadioIndex ? 'grid' : 'none';
  });
}

function setSliderBoxVisibility(block, showFamilyBoxes) {
  block.querySelectorAll('.family-box').forEach((box) => {
    box.style.display = showFamilyBoxes ? 'grid' : 'none';
  });

  block.querySelectorAll('.individual-box').forEach((box) => {
    box.style.display = showFamilyBoxes ? 'none' : 'grid';
  });
}

export default async function decorate(block) {
  const productCards = [...block.children];
  const { checkedRadio, slider, sliderIcons } = block.closest('.section').dataset;
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
                ${iconFamily ? `<span class="icon icon-${iconFamily.trim()}"></span>` : ''}
                ${partsFamily ? `<p>${partsFamily}</p>` : ''}
              </span>
               <span class="label right">
                ${iconIndividual ? `<span class="icon icon-${iconIndividual}"></span>` : ''}
                ${partsIndividual ? `<p>${partsIndividual}</p>` : ''}
              </span>
            </label>
          `;

    // Get the checkbox inside the switchBox
    switchCheckbox = switchBox.querySelector('#switchCheckbox');

    // Add an event listener to the checkbox
    switchCheckbox.addEventListener('change', () => {
      setSliderBoxVisibility(block, switchCheckbox.checked);
    });
    block.parentElement.prepend(switchBox);
  }

  block.addEventListener('click', (event) => {
    const radio = event.target.closest('.radio-wrapper');
    if (!radio || !block.contains(radio)) return;

    const innerCard = radio.closest('.inner_prod_box');
    const radios = [...innerCard.querySelectorAll('.radio-wrapper')];
    const radioIndex = radios.indexOf(radio);
    if (radioIndex === -1) return;
    const input = radio.querySelector('input');
    const buyzone = innerCard.querySelectorAll('.buyzone')[radioIndex];
    if (input?.checked && buyzone?.style.display === 'grid') return;

    selectRadioBuyzone(innerCard, radioIndex);
  });

  productCards.forEach((card, idx) => {
    if (idx >= limit) card.classList.add('family-box');
    else card.classList.add('individual-box');
    card.classList.add('prod_box');
    const innerCard = card.querySelector(':scope > div');
    if (innerCard) {
      renderNanoBlocks(innerCard, undefined, idx);

      innerCard.classList.add('inner_prod_box');

      const listElements = innerCard.querySelectorAll('li');
      listElements.forEach((li) => {
        li.innerHTML = replacePill(li.innerHTML, /\?green-pill\s+([^?]+)\?/, 'green-pill');
        li.innerHTML = replacePill(li.innerHTML, /\?blue-pill\s+([^?]+)\?/, 'blue-pill');
      });

      const radios = innerCard.querySelectorAll('.radio-wrapper');

      radios.forEach((radio, radioIndex) => {
        if (radioIndex + 1 === Number(checkedRadio)) {
          selectRadioBuyzone(innerCard, radioIndex);
        }
      });
    }
  });

  if (slider) {
    setSliderBoxVisibility(block, switchCheckbox?.checked);
  }

  await decorateIcons(block.closest('.section'));
}
