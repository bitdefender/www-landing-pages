import { productAliases } from '../../scripts/scripts.js';
import { updateProductsList } from '../../scripts/utils.js';

function initializeSlider(block) {
  const slidesContainer = block.closest('.slider-container');
  const slidesWrapper = slidesContainer.querySelector('.slides-wrapper');
  const slides = slidesContainer.querySelectorAll('.slide');
  const leftArrow = slidesContainer.querySelector('.arrow.left');
  const rightArrow = slidesContainer.querySelector('.arrow.right');
  const bullets = slidesContainer.querySelectorAll('.bulletsSlider .bullet');

  let currentIndex = 0;
  const updateSlider = () => {
    // Update slide position
    slidesWrapper.style.transform = `translateX(-${currentIndex * 91}%)`;

    // Update bullets' active state
    bullets.forEach((bullet, index) => {
      bullet.classList.toggle('active', index === currentIndex);
    });

    // Update arrow states
    leftArrow.disabled = currentIndex === 0;
    rightArrow.disabled = currentIndex === slides.length - 1;

    // inactive arrows
    leftArrow.classList.toggle('inactive', currentIndex === 0);
    rightArrow.classList.toggle('inactive', currentIndex === slides.length - 1);
  };

  // Event listeners for arrows
  leftArrow.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex -= 1;
      updateSlider();
    }
  });

  rightArrow.addEventListener('click', () => {
    if (currentIndex < slides.length - 1) {
      currentIndex += 1;
      updateSlider();
    }
  });

  // Event listeners for bullets
  bullets.forEach((bullet) => {
    bullet.addEventListener('click', () => {
      const index = parseInt(bullet.dataset.index, 10);
      if (index >= 0 && index < slides.length) {
        currentIndex = index;
        updateSlider();
      }
    });
  });

  // Initialize the slider
  updateSlider();
}

export default function decorate(block) {
  const metaData = block.closest('.section').dataset;
  const {
    products, priceType, optionsType, type, textBulina, individual, titleText, subText,
  } = metaData;
  const productsAsList = products && products.split(',');
  if (productsAsList.length) {
    productsAsList.forEach((prod) => updateProductsList(prod));

    const defaultContentWrapperElements = block.closest('.section').querySelector('.default-content-wrapper')?.children;
    let individualSwitchText;
    let familySwitchText;
    if (defaultContentWrapperElements) {
      [...defaultContentWrapperElements].forEach((element) => {
        if (element.innerHTML.includes('&lt;slider-1 ')) {
          element.innerHTML = element.innerHTML.replace('&lt;slider-1 ', '');
          individualSwitchText = element.innerHTML;
          element.remove();
        }
        if (element.innerHTML.includes('&lt;slider-2 ')) {
          element.innerHTML = element.innerHTML.replace('&lt;slider-2 ', '');
          familySwitchText = element.innerHTML;
          element.remove();
        }
      });
    }

    const titleBox = document.createElement('div');
    if (titleText && subText) {
      titleBox.classList.add('titleBox');
      titleBox.innerHTML = `
      <h2>${titleText}</h2>
      <p>${subText}</p>`;

      if (titleBox.innerHTML.includes('0%')) {
        titleBox.innerHTML = titleBox.innerHTML.replace('0%', '<span class=\'max-discount\'></span>');
      }
    }
    if (titleText && subText) {
      block.parentNode.insertBefore(titleBox, block);
    }

    const switchBox = document.createElement('div');
    if (individualSwitchText && familySwitchText) {
      const partsIndividual = individualSwitchText.split('|');
      const partsFamily = familySwitchText.split('|');
      switchBox.classList.add('switchBox');
      switchBox.innerHTML = `
        <label class="switch">
          <input type="checkbox" id="switchCheckbox">
          <span class="slider round">
          </span>
          <span class="label right">
          ${partsIndividual[0]}
          <hr>
          <p>${partsIndividual[1]}</p>
          </span>

          <span class="label left">
          ${partsFamily[0]}
          <hr>
          <p>${partsFamily[1]}</p>
          </span>
        </label>
      `;

      // Get the checkbox inside the switchBox
      const switchCheckbox = switchBox.querySelector('#switchCheckbox');
      // Add an event listener to the checkbox
      switchCheckbox.addEventListener('change', () => {
        if (switchCheckbox.checked) {
          const familyBoxes = block.querySelectorAll('.family-box');
          familyBoxes.forEach((box) => {
            box.style.display = 'block';
          });

          const individualBoxes = block.querySelectorAll('.individual-box');
          individualBoxes.forEach((box) => {
            box.style.display = 'none';
          });
        } else {
          const familyBoxes = block.querySelectorAll('.family-box');
          familyBoxes.forEach((box) => {
            box.style.display = 'none';
          });

          const individualBoxes = block.querySelectorAll('.individual-box');
          individualBoxes.forEach((box) => {
            box.style.display = 'block';
          });
        }
      });
    }
    if (individualSwitchText && familySwitchText) {
      block.parentNode.insertBefore(switchBox, block);
    }

    if (type === 'mobileSlider') {
      block.parentNode.classList.add('slider-container');
      block.classList.add('slides-wrapper');
    }

    [...block.children].forEach((prod, key) => {
      const [greenTag, title, blueTag, subtitle, saveOldPrice, price, billed, buyLink, underBuyLink, benefitsLists] = [...prod.querySelectorAll('tbody > tr')];
      const [prodName, prodUsers, prodYears] = productsAsList[key].split('/');
      const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;
      const buyLinkText = buyLink.innerText.trim();

      [...block.children][key].innerHTML = '';
      // create procent - bulina
      let divBulina = '';
      let vpnInfoContent = '';
      if (textBulina) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = textBulina.replace('0%', `<span class="percent-${onSelectorClass} div-percent"></span>`);
        divBulina = `<div class='bulina'>${tempDiv.innerHTML}</div>`;
      }
      // if we have vpn
      if (billed.innerText.includes('[vpn_box]')) {
        // add VPN
        updateProductsList('vpn/10/1');

        const billedUL = billed.querySelector('ul');
        /* eslint-disable-next-line no-unused-vars */
        const [alias, text1, text2, vpnInfo] = billedUL.querySelectorAll('li');
        const modifiedText1 = text1.innerHTML.replace('0', '<span class="newprice-vpn-101"></span>');
        const modifiedText2 = text2.innerHTML.replace('0', '<span class="oldprice-vpn-101"></span>').replace('0%', '<span class="percent-vpn-101"></span>');
        if (vpnInfo) {
          const vpnInfoText = vpnInfo.innerText;
          if (vpnInfoText.trim()) {
            vpnInfoContent = `<div class="vpn-info-container"><div class='vpn-icon'></div><ul>${vpnInfoText.split(',').map((info) => `<li>${info.trim()}</li>`).join('')}</ul></div>`;
          }
        }

        let labelId = `checkboxVPN-${onSelectorClass}`;
        if (document.getElementById(labelId)) {
          labelId = `${labelId}-1`;
        }

        const vpnContent = `
          <input id="${labelId}" class="${labelId} checkboxVPN" type="checkbox" value="">
          <label for="${labelId}">
            <span>${modifiedText1} ${modifiedText2}</span>
          </label>
        `;

        const vpnBox = document.createElement('div');
        vpnBox.classList = `vpn_box prodload prodload-${onSelectorClass}`;
        vpnBox.innerHTML = `<div>${vpnContent}</div>`;

        billedUL.before(vpnBox);
        billedUL.remove();
      }

      const featuresSet = benefitsLists.querySelectorAll('table');
      const featureList = Array.from(featuresSet).map((table) => {
        const trList = Array.from(table.querySelectorAll('tr'));

        const liString = trList.map((tr) => {
          const tdList = Array.from(tr.querySelectorAll('td'));

          // Extract the content of the first <td> to be placed outside the <li>
          let firstTdContent = tdList.length > 0 && tdList[0].textContent.trim() !== '' ? `${tdList[0].innerHTML}` : '';

          // Extract the content of the second <td> (if present) inside a <span>
          const secondTdContent = tdList.length > 1 && tdList[1].textContent.trim() !== '' ? `<span class="white-pill-content">${tdList[1].innerHTML}</span>` : '';

          // Create the <li> combining the first and second td content
          let liClass = '';
          if (firstTdContent === '') {
            liClass += 'd-none';
          }

          // &lt reffers to '<' character
          if (firstTdContent.indexOf('&lt;-') !== -1 || firstTdContent.indexOf('&lt;') !== -1) {
            liClass += ' has_arrow';
            firstTdContent = firstTdContent.replace('&lt;-', '');
          }

          // &gt reffers to '>' character
          if (firstTdContent.indexOf('-&gt;') !== -1 || firstTdContent.indexOf('&gt;') !== -1) {
            liClass += ' has_arrow_right';
            firstTdContent = firstTdContent.replace('-&gt;', '<span class="arrow-right"></span>');
          }

          if (firstTdContent.indexOf('?pill') !== -1) {
            const pillText = firstTdContent.match(/\?pill (\w+)/);
            const iconElement = firstTdContent.match(/<span class="[^"]*">(.*?)<\/span>/);
            if (pillText) {
              const icon = tdList[0].querySelector('span');
              const pillElement = document.createElement('span');
              pillElement.classList.add('blue-pill');
              pillElement.innerHTML = `${pillText[1]}${iconElement ? iconElement[0] : ''}`;
              firstTdContent = firstTdContent.replace(pillText[0], `${pillElement.outerHTML}`);
              if (icon) {
                let count = 0;
                firstTdContent = firstTdContent.replace(new RegExp(icon.outerHTML, 'g'), (match) => {
                  count += 1;
                  return (count === 2) ? '' : match;
                });
              }
            }
          }
          if (firstTdContent.indexOf('?green-pill') !== -1) {
            const pillText = firstTdContent.match(/\?green-pill (\w+)/);
            const iconElement = firstTdContent.match(/<span class="[^"]*">(.*?)<\/span>/);
            if (pillText) {
              const icon = tdList[0].querySelector('span');
              const pillElement = document.createElement('span');
              pillElement.classList.add('green-pill');
              pillElement.innerHTML = `${pillText[1]}${iconElement ? iconElement[0] : ''}`;
              firstTdContent = firstTdContent.replace(pillText[0], `${pillElement.outerHTML}`);
              if (icon) {
                let count = 0;
                firstTdContent = firstTdContent.replace(new RegExp(icon.outerHTML, 'g'), (match) => {
                  count += 1;
                  return (count === 2) ? '' : match;
                });
              }
            }
          }
          if (firstTdContent.indexOf('-x-') !== -1) {
            liClass += ' nocheck';
            firstTdContent = firstTdContent.replace('-x-', '');
          }
          const liContent = `<li class="${liClass}">${firstTdContent}${secondTdContent}</li>`;

          return liContent;
        }).join('');

        return `<ul>${liString}</ul>`;
      });

      if (title.innerHTML.indexOf('href') !== -1) {
        title.innerHTML = `<a href="#" title="${title.innerText}" class="buylink-${onSelectorClass} await-loader prodload prodload-${onSelectorClass}">${title.querySelector('tr a').innerHTML}</a>`;
      }

      let percentOffFlag = false;
      let percentOff = Array.from(saveOldPrice.querySelectorAll('td'))[1].innerText.replace('0%', `<span class="percent-${onSelectorClass}"></span>`);
      if (!saveOldPrice.querySelectorAll('td')[1].innerText.includes('0%') && saveOldPrice.querySelectorAll('td')[1].innerText.includes('0')) {
        percentOff = Array.from(saveOldPrice.querySelectorAll('td'))[1].innerText.replace('0', `<span class="save-${onSelectorClass}"></span>`);
        percentOffFlag = true;
      }
      if (!saveOldPrice.querySelectorAll('td')[1].innerText.includes('0%') && !saveOldPrice.querySelectorAll('td')[1].innerText.includes('0')) {
        percentOff = saveOldPrice.querySelectorAll('td')[1].innerText;
        percentOffFlag = true;
      }
      if (!percentOff) {
        percentOffFlag = false;
      }

      const optionList = subtitle.querySelector('ul');
      const combinedPricesBox = document.createElement('div');
      if (optionList) {
        const optionSelector = document.createElement('select');
        optionList.querySelectorAll('li').forEach((li, idx) => {
          const [labelText, variationText] = li.textContent.trim().split('+');
          const [pname, pusers, pyears] = variationText.split('/');
          const selectorClass = `${pname.trim()}-${pusers}${pyears}`;
          const value = variationText.trim();
          const isChecked = idx === 0 ? 'checked' : '';

          li.setAttribute('data-selector-u', `u_${selectorClass}`);
          li.setAttribute('data-value-u', pusers);
          li.setAttribute('data-selector-y', `y_${selectorClass}`);
          li.setAttribute('data-value-y', pyears);

          if (optionsType && optionsType === 'dropdown') {
            if (!optionSelector.id) optionSelector.id = `optionSelector_${pname.trim()}`;
            optionSelector.innerHTML += `<option name="${pname.trim()}" id="${value}" value="${selectorClass}" data-selector-u="u_${selectorClass}" data-value-u="u_${pusers}" data-selector-y="y_${selectorClass}" data-value-y="u_${pyears}" ${idx === 0 ? 'selected' : ''}>${labelText.trim()}</option>`;
          } else {
            li.innerHTML = `<input type="radio" name="${pname.trim()}" id="${value}" value="${selectorClass}" ${isChecked}>
            <label for="${value}">${labelText.trim()}</label>`;
          }

          combinedPricesBox.innerHTML += `<div class="combinedPricesBox combinedPricesBox-${selectorClass}" ${idx !== 0 ? 'style="display: none;"' : ''}>
            <div class="save_price_box await-loader prodload prodload-${selectorClass}">
              <span class="prod-oldprice oldprice-${selectorClass}"></span>
              <strong class="save prod-percent">${percentOff}</strong>
            </div>
            <div class="prices_box await-loader prodload prodload-${selectorClass}">
              <span class="prod-newprice newprice-${selectorClass}"></span>
              <sup>${price.innerText.trim().replace('0', '')}</sup>
            </div>

              ${billed ? ` <div class="billed">
                ${billed.innerText.includes('0') ? billed.innerHTML.replace('0', `<span class="newprice-${selectorClass}"></span>`) : billed.innerHTML}
              </div>` : billed.innerText}

              ${buyLinkText && `<div class="buy-btn">
                <a class="red-buy-button buylink-${selectorClass} await-loader prodload prodload-${selectorClass}" href="#" title="Bitdefender">${buyLinkText.includes('0%') ? buyLinkText.replace('0%', `<span class="percent-${onSelectorClass}"></span>`) : buyLinkText}
                </a>
              </div>`}
            </div>`;
        });

        if (optionsType && optionsType === 'dropdown') {
          block.classList.add('optionsDropdown');
          optionList.innerHTML = '';
          optionList.appendChild(optionSelector);
        }
      }

      block.innerHTML += `
        <div class="prod_box${greenTag.innerText.trim() && ' hasGreenTag'} index${key} ${individual ? (key < productsAsList.length / 2 && 'individual-box') || 'family-box' : ''}${type === 'mobileSlider' ? 'slide' : ''}">

          <div class="inner_prod_box">
          ${divBulina}
            ${greenTag.innerText.trim() ? `<div class="greenTag2">${greenTag.innerText.trim()}</div>` : ''}
            ${title.innerText.trim() ? `<h2>${title.innerHTML}</h2>` : ''}
            <div class="tag-subtitle">
              ${blueTag.innerText.trim() ? `<div class="blueTag"><div>${blueTag.innerHTML.trim()}</div></div>` : ''}
              ${subtitle.innerText.trim() ? `<div class="subtitle">${subtitle.innerHTML.trim()}</div>` : ''}
            </div>
            <hr />

            ${combinedPricesBox && combinedPricesBox.innerText ? combinedPricesBox.innerHTML : `
              ${saveOldPrice.innerText.trim() && `<div class="save_price_box await-loader prodload prodload-${onSelectorClass}"">
                <span class="prod-oldprice oldprice-${onSelectorClass}"></span>
                <strong class="percent prod-percent">
                  ${percentOff}
                </strong>
              </div>`}

              ${priceType === 'combined' && price.innerText.trim() ? `<div class="prices_box await-loader prodload prodload-${onSelectorClass}">
                <span class="prod-newprice${!onSelectorClass.includes('monthly') && !onSelectorClass.includes('m-') ? ' calculate_monthly' : ''} newprice-${onSelectorClass}"></span>
                <sup>${price.innerText.trim().replace('0', '')}</sup>
              </div>` : `<div class="prices_box await-loader prodload prodload-${onSelectorClass}">
                <span class="prod-newprice newprice-${onSelectorClass}${priceType ? `-${priceType}` : ''}"></span>
                <sup>${price.innerText.trim().replace('0', '')}</sup>
              </div>`}

              ${billed ? ` <div class="billed">
                ${billed.innerText.includes('0') ? billed.innerHTML.replace('0', `<span class="newprice-${onSelectorClass}"></span>`) : billed.innerHTML}
              </div>` : billed.innerText}

              ${vpnInfoContent && vpnInfoContent}
              ${buyLinkText && `<div class="buy-btn">
                <a class="red-buy-button buylink-${onSelectorClass} await-loader prodload prodload-${onSelectorClass}" href="#" title="Bitdefender">${buyLinkText.includes('0%') ? buyLinkText.replace('0%', `<span class="percent-${onSelectorClass}"></span>`) : buyLinkText}
                </a>
              </div>`}
            `}

            ${underBuyLink.innerText.trim() ? `<div class="underBuyLink">${underBuyLink.innerHTML}</div>` : ''}
            <hr />
            ${benefitsLists.innerText.trim() ? `<div class="benefitsLists">${featureList}</div>` : ''}
          </div>
      </div>`;

      if (percentOffFlag) {
        block.querySelector(`.index${key} .prod-percent`).style.setProperty('visibility', 'visible', 'important');
      }
    });

    if (type === 'mobileSlider') {
      const arrowsSlider = document.createElement('div');
      arrowsSlider.className = 'arrowsSlider';
      arrowsSlider.innerHTML = `<button class="arrow left"></button>
        <button class="arrow right"></button>`;
      block.parentNode.appendChild(arrowsSlider);

      const bulletsSlider = document.createElement('div');
      bulletsSlider.className = 'bulletsSlider';
      bulletsSlider.innerHTML = `<div class="bullets">
        ${[...block.querySelectorAll('.prod_box')].map((prod, idx) => `<span class="bullet" data-index="${idx}"></span>`).join('')}
      </div>`;
      block.parentNode.appendChild(bulletsSlider);
    }
  } else {
    block.innerHTML = `
    <div class="container-fluid">
      add some products
    </div>`;
  }

  // General function to match the height of elements based on a selector
  const matchHeights = (targetNode, selector) => {
    const resetHeights = () => {
      const elements = targetNode.querySelectorAll(selector);
      elements.forEach((element) => {
        element.style.minHeight = '';
      });
    };

    const adjustHeights = () => {
      if (window.innerWidth >= 768) {
        resetHeights();
        const elements = targetNode.querySelectorAll(selector);
        const elementsHeight = Array.from(elements).map((element) => element.offsetHeight);
        const maxHeight = Math.max(...elementsHeight);

        elements.forEach((element) => {
          element.style.minHeight = `${maxHeight}px`;
        });
      } else {
        resetHeights();
      }
    };

    const matchHeightsCallback = (mutationsList) => {
      Array.from(mutationsList).forEach((mutation) => {
        if (mutation.type === 'childList') {
          adjustHeights();
        }
      });
    };

    const observer = new MutationObserver(matchHeightsCallback);

    if (targetNode) {
      observer.observe(targetNode, { childList: true, subtree: true });
    }

    window.addEventListener('resize', () => {
      adjustHeights();
    });
  };

  const targetNode = document.querySelector('.new-prod-boxes');
  matchHeights(targetNode, '.subtitle');
  matchHeights(targetNode, 'h2');

  block.addEventListener('change', (event) => {
    const { target } = event;
    if (target.type === 'radio' || target.type === 'select-one') {
      const { selectorU, valueU, selectorY, valueY } = target.closest('li')?.dataset || target.options[target.selectedIndex]?.dataset || {};

      target.closest('.inner_prod_box').querySelectorAll('.combinedPricesBox').forEach((item) => {
        item.style.display = 'none';
      });

      target.closest('.inner_prod_box').querySelector(`.combinedPricesBox-${target.value}`).style.display = 'block';

      if (selectorU && selectorY) {
        const selectorUsers = document.getElementById(selectorU);
        const selectorYears = document.getElementById(selectorY);

        if (selectorUsers) selectorUsers.value = valueU;
        if (selectorYears) selectorYears.value = valueY;
      }
    }
  });

  // slider:
  if (type === 'mobileSlider') initializeSlider(block);
}
