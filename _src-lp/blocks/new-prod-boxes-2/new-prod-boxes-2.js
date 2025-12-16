/* eslint-disable indent */
import { matchHeights, wrapChildrenWithStoreContext } from '../../scripts/utils.js';

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

function extractBuyLinks(tdElement) {
  const result = [];
  const paragraphs = tdElement.querySelectorAll('p');
  if (paragraphs.length > 0) {
    // Process p
    paragraphs.forEach((p) => {
      const link = p.querySelector('a');
      if (link) {
        result.push({
          text: link.innerText.trim(),
          href: link.getAttribute('href'),
        });
      } else {
        const text = p.textContent.trim();
        if (text) {
          result.push({ text, href: null });
        }
      }
    });
  } else {
    // process td
    tdElement.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim() || tdElement.textContent;
        if (text) {
          result.push({ text, href: tdElement.querySelector('a')?.getAttribute('href') || null });
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName.toLowerCase() === 'a') {
          result.push({
            text: node.innerText.trim(),
            href: node.getAttribute('href'),
          });
        } else {
          node.childNodes.forEach((child) => {
            if (child.nodeType === Node.TEXT_NODE) {
              const text = child.textContent.trim();
              if (text) result.push({ text, href: null });
            } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName.toLowerCase() === 'a') {
              result.push({
                text: child.innerText.trim(),
                href: child.getAttribute('href'),
              });
            }
          });
        }
      }
    });
  }

  return result;
}

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

export default function decorate(block) {
  const parentSection = block.closest('.section');
  const metaData = parentSection.dataset;
  const {
    products, priceType, optionsType, type, textBulina, individual, titleText, trialSaveText, subText, set, openModalButton, switchText, replaceBuyLinks, bundles,
  } = metaData;
  const isShowMoreShowLess = block.closest('.section').classList.contains('show-more-show-less');
  const productsAsList = products && products.split(',');
  const bundlesArray = bundles.split(',').map((entry) => entry.trim());

  if (productsAsList.length) {
    const defaultContentWrapperElements = parentSection.querySelector('.default-content-wrapper')?.children;
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
    if (titleText || subText) {
      titleBox.classList.add('titleBox');
      titleBox.innerHTML = `
      <h2>${titleText}</h2>
      ${subText ? `<p>${subText}</p>` : ''}`;

      if (titleBox.innerHTML.includes('0%')) {
        titleBox.innerHTML = titleBox.innerHTML.replace('0%', '<span class=\'max-discount\'></span>');
      }

      block.parentNode.insertBefore(titleBox, block);
    }

    const switchBox = document.createElement('div');
    if (individualSwitchText && familySwitchText) {
      const partsIndividual = individualSwitchText.split('|');
      const partsFamily = familySwitchText.split('|');
      switchBox.classList.add('switchBox');
      switchBox.innerHTML = `
        ${switchText ? `<div class="switch-text"><strong>${switchText}</strong></div>` : ''}
        <label class="switch">
          
          <input type="checkbox" id="switchCheckbox">
          <span class="slider round">
          </span>
          <span class="label right">
            ${partsIndividual[0]}
            ${partsIndividual[1] ? `<hr><p>${partsIndividual[1]}</p>` : ''}
          </span>

          <span class="label left">
            ${partsFamily[0]}
            ${partsFamily[1] ? `<hr><p>${partsFamily[1]}</p>` : ''}
          </span>
        </label>
      `;

      // Get the checkbox inside the switchBox
      const switchCheckbox = switchBox.querySelector('#switchCheckbox');

      // Check if individualSwitchText includes 'reverted'
      if (individual === 'reverted') {
        switchCheckbox.checked = true; // Set the checkbox to checked by default
      }
      // Add an event listener to the checkbox
      switchCheckbox.addEventListener('change', () => {
        if (set && set === 'height') {
          [1, 2, 3].forEach((i) => {
            // eslint-disable-next-line no-use-before-define
            matchHeights(targetNode, `.benefitsLists > ul:nth-of-type(${i})`);
          });
        }

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
      const [prodName, prodUsers, prodYears] = (productsAsList[key] ?? '').split('/').map((entry) => entry.trim());
      const buyLinksObj = extractBuyLinks(buyLink);
      const buyLinkText = buyLink.innerText.trim();

      [...block.children][key].innerHTML = '';
      // create procent - bulina
      let divBulina = '';
      let bundleInfoContent = '';
      if (textBulina) {
        divBulina = `<div class='bulina' data-store-hide="!it.option.price.discounted">
          ${textBulina.replace('0%', '<span data-store-render data-store-discount="percentage" div-percent"></span>')}
        </div>`;
      }

      // if we have a bundle
      if (billed.innerText.includes('[bundle_box]')) {
        // add bundle
        const boxBundle = bundlesArray[key];
        const billedUL = billed.querySelector('ul');

        if (!boxBundle || boxBundle === 'null') {
          const emptyBundleBox = document.createElement('div');
          emptyBundleBox.classList.add('bundle_box');
          billedUL.parentElement.appendChild(emptyBundleBox);
          billedUL.remove();
        } else {
          const [bundleId, bundleDevices, bundleSubscription] = boxBundle.split('/').map((entry) => entry.trim());
          /* eslint-disable-next-line no-unused-vars */
          const [_, text1, text2, bundleInfo] = billedUL.querySelectorAll('li');
          const modifiedText1 = text1.innerHTML
            .replace('0', '<span data-store-render data-store-price="discounted||full"></span>');
          const modifiedText2 = text2.innerHTML
            .replace('0', '<span data-store-hide="!it.option.price.discounted" data-store-price="full"></span>')
            .replace('0%', '<span data-store-hide="!it.option.price.discounted" data-store-discount="percentage"></span>');
          if (bundleInfo) {
            const bundleInfoText = bundleInfo.innerText;
            if (bundleInfoText.trim()) {
              bundleInfoContent = `
              <div class="bundle-info-container">
                <div class="bundle-icon"></div>
                <ul>${bundleInfoText.split(',').map((info) => `<li>${info.trim()}</li>`).join('')}</ul>
              </div>`;
            }
          }

          const labelId = `checkbox-bundle-${key}`;
          const bundleBox = document.createElement('div');
          bundleBox.className = 'bundle_box';

          const loaderWrapper = document.createElement('div');
          loaderWrapper.className = 'await-loader new-store';

          // create the bundle Input
          const bundleInput = document.createElement('input');
          bundleInput.setAttribute('data-store-action', '');
          bundleInput.setAttribute('data-store-set-id', bundleId);
          bundleInput.setAttribute('data-store-set-bundle', '');
          bundleInput.setAttribute('data-store-set-devices', bundleDevices);
          bundleInput.setAttribute('data-store-set-subscription', bundleSubscription);
          bundleInput.id = labelId;
          bundleInput.className = `${labelId} checkboxBundle`;
          bundleInput.type = 'checkbox';

          // create the bundle label
          const bundleLabel = document.createElement('label');
          bundleLabel.htmlFor = labelId;
          const optionSpan = document.createElement('span');
          optionSpan.innerHTML = `${modifiedText1} ${modifiedText2}`;

          bundleLabel.appendChild(optionSpan);
          wrapChildrenWithStoreContext(bundleLabel, {
            productId: bundleId,
            devices: bundleDevices,
            subscription: bundleSubscription,
            ignoreEventsParent: true,
            storeEvent: 'info',
          });

          loaderWrapper.append(bundleInput, bundleLabel);
          bundleBox.appendChild(loaderWrapper);

          billedUL.before(bundleBox);
          billedUL.remove();
        }
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
            const pillRegExp = /\?pill (\w+)/;
            firstTdContent = replacePill(firstTdContent, pillRegExp, 'blue-pill');
          }

          if (firstTdContent.indexOf('?green-pill') !== -1) {
            const greenPillRegExp = /\?green-pill (\w+)/;
            firstTdContent = replacePill(firstTdContent, greenPillRegExp, 'green-pill');
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
        title.innerHTML = `<a href="${title.querySelector('tr a').getAttribute('href')}" title="${title.innerText}">${title.querySelector('tr a').innerHTML}</a>`;
      }

      let percentOff = Array.from(saveOldPrice.querySelectorAll('td'))[1].innerText.replace('0%', '<span data-store-render data-store-discount="percentage"></span>');
      if (!saveOldPrice.querySelectorAll('td')[1].innerText.includes('0%') && saveOldPrice.querySelectorAll('td')[1].innerText.includes('0')) {
        percentOff = Array.from(saveOldPrice.querySelectorAll('td'))[1].innerText.replace('0', '<span data-store-render data-store-discount="value"></span>');
      }
      if (!saveOldPrice.querySelectorAll('td')[1].innerText.includes('0%') && !saveOldPrice.querySelectorAll('td')[1].innerText.includes('0')) {
        percentOff = saveOldPrice.querySelectorAll('td')[1].innerText;
      }

      const optionList = subtitle.querySelector('ul');
      if (optionList) {
        const optionSelector = document.createElement('select');
        optionSelector.setAttribute('data-store-action', '');
        optionList.querySelectorAll('li').forEach((li, idx) => {
          const [labelText, variationText, bluePill] = li.textContent.trim().split('+');
          const [pname, pusers, pyears] = variationText.split('/').map((entry) => entry.trim());
          const value = variationText.trim();
          const isChecked = idx === 0 ? 'checked' : '';

          percentOff = Array.from(saveOldPrice.querySelectorAll('td'))[1].innerText.replace('0%', '<span data-store-render data-store-discount="percentage"></span>');
          if (!saveOldPrice.querySelectorAll('td')[1].innerText.includes('0%') && saveOldPrice.querySelectorAll('td')[1].innerText.includes('0')) {
            percentOff = Array.from(saveOldPrice.querySelectorAll('td'))[1].innerText.replace('0', '<span data-store-render data-store-discount="value"></span>');
          }
          if (!saveOldPrice.querySelectorAll('td')[1].innerText.includes('0%') && !saveOldPrice.querySelectorAll('td')[1].innerText.includes('0')) {
            percentOff = saveOldPrice.querySelectorAll('td')[1].innerText;
          }

          // TODO: remove these lines if they end up being obsolete and serve no purpose
          // li.setAttribute('data-store-action', '');
          // li.setAttribute('data-store-set-id', pname);
          // li.setAttribute('data-store-set-devices', pusers);
          // li.setAttribute('data-store-set-subscription', pyears);

          if (optionsType && optionsType === 'dropdown') {
            optionSelector.innerHTML += `<option data-store-set-id="${pname}" data-store-set-devices="${pusers}" data-store-set-subscription="${pyears}" ${idx === 0 ? 'selected' : ''}>${labelText.trim()}</option>`;
          } else {
            const priceSpan = type === 'dropdown-benefits'
              ? '<span class="prod-oldprice" data-store-hide="!it.option.price.discounted" data-store-price="full"></span><span class="prod-newprice radio-price" data-store-render data-store-price="discounted||full"></span>'
              : '';

            if (type === 'dropdown-benefits') {
              li.innerHTML = `
                <label for="${value}">${priceSpan}${labelText.trim()} ${bluePill ? `<span class="blue-pill-tag">+${bluePill}</span>` : ''}</label>
                <input type="radio" name="card-radio-${key}" id="${value}" data-store-set-id="${pname}" data-store-set-devices="${pusers}" data-store-set-subscription="${pyears}" ${isChecked}>
              `;
            } else {
              li.innerHTML = `
                <input type="radio" name="${pname.trim()}" id="${value}" data-store-set-id="${pname}" data-store-set-devices="${pusers}" data-store-set-subscription="${pyears}" ${isChecked}>
                <label for="${value}">${labelText.trim()}</label>
              `;
            }
          }
        });

        if (optionsType && optionsType === 'dropdown') {
          block.classList.add('optionsDropdown');
          optionList.innerHTML = '';
          optionList.appendChild(optionSelector);
        }
      }

      const newBlueTag = document.createElement('div');
      if (blueTag) {
        let blueTagChildren = blueTag.children;
        blueTagChildren = Array.from(blueTagChildren);
        blueTagChildren?.forEach((child) => {
          // create a different blueTag element
          child.innerHTML.split('||').forEach((tag, idx) => {
            newBlueTag.innerHTML += `<div class="blueTag" ${(isShowMoreShowLess && idx !== 0) ? 'style="display:none"' : ''}>${tag}</div>`;
          });
        });
      }

      const buyLinkObj = buyLinksObj[key] || buyLinksObj[0];
      const [alias, selector, btnText] = (buyLinkObj?.text || '').trim().split('|');
      let demoBtn = '';
      if (alias.trim() === 'popup') {
        demoBtn = `<span class="demoBtn" data-show="${selector}" onclick="document.querySelector('.${selector.replace(/\s+/g, '')}').style.display = 'block'">${btnText}</span>`;
      }

      const newCard = document.createElement('div');
      newCard.classList.add(
        ...[
          'prod_box',
          greenTag.innerText.trim() ? 'hasGreenTag' : '',
          `index${key}`,
          individual ? (key < productsAsList.length / 2 && 'individual-box') || 'family-box' : '',
          type === 'mobileSlider' ? 'slide' : '',
        ].filter(Boolean),
      );

      newCard.innerHTML = `
        <div class="inner_prod_box ${parentSection.classList.contains(`blue-header-${key + 1}`) ? 'blue-header' : ''}">
          ${divBulina}
            ${greenTag.innerText.trim() ? `<div class="greenTag2">${greenTag.innerText.trim()}</div>` : ''}
            <div class="header-box">
              ${title.innerText.trim() ? `<h2>${title.innerHTML}</h2>` : ''}
              <div class="tag-subtitle">
                ${newBlueTag.innerText.trim() ? `<div class="blueTagsWrapper">${newBlueTag.innerHTML.trim()}</div>` : ''}
                ${subtitle.innerText.trim() ? `<div class="subtitle">${subtitle.innerHTML.trim()}</div>` : ''}
              </div>
              <hr />

              ${`
                ${saveOldPrice.innerText.trim() && `<div class="save_price_box await-loader new-store" data-store-hide="!it.option.price.discounted">
                  <span class="prod-oldprice" data-store-render data-store-price="full"></span>
                  <strong class="prod-percent">
                    ${percentOff}
                  </strong>
                </div>`}

                ${priceType === 'combined' && price.innerText.trim() ? `<div class="prices_box await-loader new-store">
                  <span class="prod-newprice" data-store-render data-store-price="discounted-monthly||full-monthly"></span>
                  <sup>${price.innerText.trim().replace('0', '')}</sup>
                </div>` : `<div class="prices_box await-loader new-store">
                  <span class="prod-newprice" data-store-render data-store-price="discounted||full"></span>
                  <sup>${price.innerText.trim().replace('0', '')}</sup>
                </div>`}

  ${billed ? (() => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = billed.innerHTML.replace(/\[percent\]/g, '<span data-store-render data-store-discount="percentage"></span>');
            const firstP = tempDiv.querySelector('p');
            if (firstP) {
              firstP.innerHTML = firstP.innerHTML
                .replace(/(^|[^0-9])0([^0-9%]|$)/g, '$1<span data-store-render data-store-price="discounted||full"></span>$2')
                .replace(/\[percent\]/g, '<span data-store-render data-store-discount="percentage"></span>')
                .replace(/\[discmonthly\]/g, '<span data-store-render data-store-price="discounted-monthly||full-monthly"></span>')
                .replace(/\[discyearly\]/g, '<span data-store-render data-store-price="discounted||full"></span>')
                .replace(/\[fullmonthly\]/g, '<span data-store-render data-store-price="full-monthly"></span>')
                .replace(/\[fullyearly\]/g, '<span data-store-render data-store-price="full"></span>')
                .replace(/\[fullprice\]/g, '<span data-store-render data-store-price="full"></span>')
                .replace(/\[discprice\]/g, '<span data-store-render data-store-price="discounted||full"></span>')
                .replace(/\[saveprice\]/g, '<span data-store-render data-store-discount="value"></span>')
                .replace(/\*(.*?)\*/g, '<br><span class="black-text">$1</span>');
            } else {
              tempDiv.innerHTML = tempDiv.innerHTML
                .replace(/(^|[^0-9])0([^0-9%]|$)/g, '$1<span data-store-render data-store-price="discounted||full"></span>$2')
                .replace(/\[percent\]/g, '<span data-store-render data-store-discount="percentage"></span>')
                .replace(/\[discmonthly\]/g, '<span data-store-render data-store-price="discounted-monthly||full-monthly"></span>')
                .replace(/\[discyearly\]/g, '<span data-store-render data-store-price="discounted||full"></span>')
                .replace(/\[fullmonthly\]/g, '<span data-store-render data-store-price="full-monthly"></span>')
                .replace(/\[fullyearly\]/g, '<span data-store-render data-store-price="full"></span>')
                .replace(/\[fullprice\]/g, '<span data-store-render data-store-price="full"></span>')
                .replace(/\[discprice\]/g, '<span data-store-render data-store-price="discounted||full"></span>')
                .replace(/\[saveprice\]/g, '<span data-store-render data-store-discount="value"></span>')
                .replace(/\*(.*?)\*/g, '<br><span class="black-text">$1</span>');
            }
            return `<div class="billed">${tempDiv.innerHTML}</div>`;
          })() : ''}
  </div><!-- end header-box --> 

              ${trialSaveText ? `<div class="save-trial-text"><hr><div data-store-hide="!it.option.price.discounted">${trialSaveText.replace(/0%/g, '<span data-store-render data-store-discount="percentage"></span>')}</div></div>` : ''}
              ${bundleInfoContent && bundleInfoContent}
              
              ${replaceBuyLinks
                ? `<div class="buy-btn">
                    <a class="red-buy-button"
                      ${buyLinkObj.href ? 'data-store-buy-link data-store-render' : ''}
                      href="${buyLinkObj.href || '#'}"
                      title="Bitdefender">
                      ${buyLinkObj.text.includes('0%')
                        ? buyLinkObj.text.replace('0%', '<span data-store-hide="!it.option.price.discounted" data-store-discount="percentage"></span>')
                        : buyLinkObj.text}
                    </a>
                  </div>`
                : `<div class="buy-btn">
                    <a data-store-buy-link data-store-render class="red-buy-button" href="#" title="Bitdefender">
                      ${buyLinkText.includes('0%')
                        ? buyLinkText.replace('0%', '<span data-store-hide="!it.option.price.discounted" data-store-discount="percentage"></span>')
                        : buyLinkText}
                    </a>
                  </div>`
                }

              ${openModalButton ? `<a class="open-modal-button">${openModalButton}</a>` : ''}
            `}

            ${underBuyLink.innerText.trim() ? `<div class="underBuyLink">${demoBtn !== '' ? demoBtn : underBuyLink.innerHTML.trim()}</div>` : ''}
            <hr />
            ${benefitsLists.innerText.trim() ? `<div class="benefitsLists">${featureList}</div>` : ''}
        </div>`;

      wrapChildrenWithStoreContext(newCard, {
        productId: prodName,
        devices: prodUsers,
        subscription: prodYears,
        ignoreEventsParent: true,
        storeEvent: newCard.classList.contains('family-box') ? '' : 'info',
      });

      block.appendChild(newCard);
    });

    if (type === 'mobileSlider') {
      const arrowsSlider = document.createElement('div');
      arrowsSlider.className = 'arrowsSlider';
      arrowsSlider.innerHTML = `<button class="arrow left" aria-label="Previous Product"></button>
        <button class="arrow right" aria-label="Next Product"></button>`;
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

  function toggleElements(elements, { display = null, addClass = null, removeClass = null }) {
    elements.forEach((element) => {
      if (display !== null) element.style.display = display;
      if (addClass) element.classList.add(...addClass);
      if (removeClass) element.classList.remove(...removeClass);
    });
  }

  function modifyAdobeDataLayer() {
    const campaignEvent = window.adobeDataLayer.find((event) => event.event === 'campaign product');

    if (campaignEvent && Array.isArray(campaignEvent.product.info)) {
      const storedPrices = JSON.parse(localStorage.getItem('originalPrices')) || {};

      campaignEvent.product.info.forEach((product) => {
        // Save original values if not already saved
        if (!storedPrices[product.ID]) {
          storedPrices[product.ID] = {
            discountValue: product.discountValue,
            grossPrice: product.grossPrice,
          };
        }

        product.discountRate = 0;
        product.discountValue = 0;
        product.grossPrice = product.basePrice;
      });
      localStorage.setItem('originalPrices', JSON.stringify(storedPrices));
    }
  }

  function restoreOriginalPrices() {
    const storedPrices = JSON.parse(localStorage.getItem('originalPrices')) || {};
    const campaignEvent = window.adobeDataLayer.find((event) => event.event === 'campaign product');

    if (campaignEvent && Array.isArray(campaignEvent.product.info)) {
      campaignEvent.product.info.forEach((product) => {
        if (storedPrices[product.ID]) {
          product.discountValue = storedPrices[product.ID].discountValue;
          product.grossPrice = storedPrices[product.ID].grossPrice || storedPrices[product.ID].priceWithTax;
          product.discountRate = Math.floor((product.discountValue / product.basePrice) * 100);
        }
      });
    }
  }

  function restoreCouponsToButtons() {
    const removedCoupons = JSON.parse(localStorage.getItem('removedCoupons')) || {};
    block.querySelectorAll('[class*="buylink-"]').forEach((button) => {
      const originalUrl = removedCoupons[button.href];

      if (originalUrl) {
        button.href = originalUrl;
      }
    });
  }

  function applyDiscount(modalButtons, pricesBoxes, discountsBoxes, billedBoxes) {
    toggleElements(modalButtons, { display: 'none' });
    toggleElements([...pricesBoxes, ...discountsBoxes], { addClass: ['await-loader', 'new-store'] });

    setTimeout(() => {
      toggleElements([...pricesBoxes, ...discountsBoxes], { removeClass: ['await-loader', 'new-store'], display: 'flex' });
      toggleElements(billedBoxes, { display: 'block' });

      pricesBoxes.forEach((box) => {
        const newSpan = document.createElement('span');
        newSpan.classList.add('additional-price-info');
        newSpan.textContent = 'With your discount applied';
        box.appendChild(newSpan);
      });

      discountsBoxes.forEach((element) => {
        const spanElement = element.querySelector('span');
        if (spanElement) toggleElements([spanElement], { display: 'block', removeClass: ['main-price'] });

        const strongElement = element.querySelector('strong');
        if (strongElement) toggleElements([strongElement], { display: 'flex' });
      });
      restoreOriginalPrices();
      restoreCouponsToButtons();
    }, 3000);
  }

  if (openModalButton) {
    const modalButtons = block.querySelectorAll('.open-modal-button');
    modalButtons.forEach((button) => {
      button.addEventListener('click', () => {
        document.dispatchEvent(new Event('openModalEvent'));
      });
    });

    const discountsBoxes = Array.from(block.querySelectorAll('.save_price_box'));
    const pricesBoxes = Array.from(block.querySelectorAll('.prices_box'));
    const billedBoxes = Array.from(block.querySelectorAll('.billed'));

    toggleElements([...billedBoxes, ...pricesBoxes], { display: 'none' });

    discountsBoxes.forEach((element) => {
      const spanElement = element.querySelector('span');
      if (spanElement) spanElement.classList.add('main-price');

      const strongElement = element.querySelector('strong');
      if (strongElement) strongElement.style.display = 'none';
    });

    document.addEventListener('formSubmittedEvent', () => {
      applyDiscount(modalButtons, pricesBoxes, discountsBoxes, billedBoxes);
    });

    if (localStorage.getItem('discountApplied') === 'true') {
      applyDiscount(modalButtons, pricesBoxes, discountsBoxes, billedBoxes);
    }

    const observer = new MutationObserver(() => {
      if (window.adobeDataLayer?.some((event) => event.event === 'page loaded')) {
        localStorage.removeItem('removedCoupons');
        const removedCoupons = {}; // Reset storage object
        let couponsWereRemoved = false;

        document.querySelectorAll('[class*="buylink-"]').forEach((button) => {
          const url = button.href;
          const couponMatch = url.match(/(COUPON=[^&]*&?)/);

          if (couponMatch) {
            const cleanUrl = url.replace(couponMatch[1], '').replace(/[?&]$/, '');

            if (!removedCoupons[cleanUrl]) {
              removedCoupons[cleanUrl] = url; // Store original URL
            }

            localStorage.setItem('removedCoupons', JSON.stringify(removedCoupons));

            button.href = cleanUrl;
            couponsWereRemoved = true;
          }
        });

        if (couponsWereRemoved) {
          localStorage.setItem('couponRemoved', 'true');
        }
        modifyAdobeDataLayer();
        observer.disconnect(); // Stop observing after first execution
      }
    });
    observer.observe(document, { childList: true, subtree: true });
  }

  const targetNode = document.querySelector('.new-prod-boxes-2');
  matchHeights(targetNode, '.tag-subtitle');
  matchHeights(targetNode, '.subtitle');
  matchHeights(targetNode, '.subtitle p:first-of-type');
  matchHeights(targetNode, 'h2');
  matchHeights(targetNode, '.save-trial-text');
  matchHeights(targetNode, '.benefitsLists ul:first-of-type');
  matchHeights(targetNode, '.benefitsLists ul:first-of-type li:first-of-type');

  const storeRoot = block.closest('bd-root');
  storeRoot.updateComplete.then(() => {
    matchHeights(targetNode, '.save_price_box');
    matchHeights(targetNode, '.bundle_box');
  });

  // set max height for benefits
  if (set && set === 'height') {
    [1, 2, 3].forEach((i) => {
      matchHeights(targetNode, `.benefitsLists > ul:nth-of-type(${i})`);
    });
  }

  // TODO: if these lines are obsolete delete them
  // block.addEventListener('change', (event) => {
  //   const { target } = event;
  //   if (target.type === 'radio' || target.type === 'select-one') {
  //     const {
  //       selectorU,
  //       valueU,
  //       selectorY,
  //       valueY,
  //     } = target.closest('li')?.dataset || target.options[target.selectedIndex]?.dataset || {};

  //     target.closest('.inner_prod_box').querySelectorAll('.combinedPricesBox').forEach((item) => {
  //       item.style.display = 'none';
  //     });

  //     if (isShowMoreShowLess) {
  //       const tagSubtitle = target.closest('.tag-subtitle');
  //       if (tagSubtitle) {
  //         const blueTags = [...tagSubtitle.querySelectorAll('.blueTag')];

  //         const visibleTag = blueTags.find((tag) => window.getComputedStyle(tag).display !== 'none');
  //         const hiddenTag = blueTags.find((tag) => window.getComputedStyle(tag).display === 'none');

  //         if (visibleTag && hiddenTag) {
  //           visibleTag.style.display = 'none';
  //           hiddenTag.style.display = 'flex';
  //         }
  //       }
  //     }

  //     target.closest('.inner_prod_box').querySelector(`.combinedPricesBox-${target.value}`).style.display = 'block';

  //     if (selectorU && selectorY) {
  //       const selectorUsers = document.getElementById(selectorU);
  //       const selectorYears = document.getElementById(selectorY);

  //       if (selectorUsers) selectorUsers.value = valueU;
  //       if (selectorYears) selectorYears.value = valueY;
  //     }
  //   }
  // });

  // slider:
  if (type === 'mobileSlider') initializeSlider(block);
  function updateMargin() {
    const switchTextEl = block.parentElement?.querySelector('.switch-text');
    const switchBoxEl = block.parentElement?.querySelector('.switchBox');

    if (switchTextEl && switchBoxEl) {
      if (window.innerWidth >= 989) {
        switchBoxEl.style.marginLeft = `-${switchTextEl.offsetWidth}px`;
      } else {
        switchBoxEl.style.marginLeft = 'unset'; // Reset margin for small screens
      }
    }
  }

  if (type === 'dropdown-benefits') {
    const benefitsLists = block.querySelectorAll('.benefitsLists');
    benefitsLists.forEach((list) => {
      const listItems = list.querySelectorAll('li');
      if (listItems.length === 0) return;
      const firstLi = listItems[0];
      const secondLi = listItems[4];
      // Add dropdown icon
      if (!isShowMoreShowLess) {
        firstLi.innerHTML += '<svg style="height: 20px; margin-left: 0.5rem; transition: transform 0.3s;" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="chevron-down" class="svg-inline--fa fa-chevron-down fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"></path></svg>';
      }
      // Hide all li except first
      listItems.forEach((li, index) => {
        if (isShowMoreShowLess ? index > 4 : index > 0) li.style.display = 'none';
      });

      const innerBoxes = block.querySelectorAll('.inner_prod_box');
      innerBoxes.forEach((box) => {
        box.style.height = 'auto';
      });

      // Set expanded flag individually on the list element
      list.dataset.expanded = 'false';

      // Toggle this specific list only
      const toggleList = isShowMoreShowLess ? secondLi : firstLi;
      toggleList.classList.add('list-toggle');
      if (isShowMoreShowLess) toggleList.nextElementSibling.classList.add('list-toggle');
    });
  }

  const resizeObserver = new ResizeObserver(() => {
    updateMargin();
  });
  resizeObserver.observe(document.body);
  window.addEventListener('resize', () => {
    updateMargin();
  });

  window.addEventListener('resize', updateMargin());
  setTimeout(() => updateMargin(), 0);

  block.addEventListener('click', (e) => {
    const clickedButton = e.target.closest('.list-toggle');
    if (!clickedButton) return;

    const list = clickedButton.closest('.benefitsLists');
    const listItems = list.querySelectorAll('li');

    const section = block.closest('.section');
    const hasShowMoreLogic = section.classList.contains('show-more-show-less');
    const threshold = hasShowMoreLogic ? 4 : 0;

    list.style.flexDirection = list.style.flexDirection === 'column' ? '' : 'column';
    const isExpanded = list.dataset.expanded === 'true';
    const newExpanded = !isExpanded;
    list.dataset.expanded = newExpanded.toString();

    listItems.forEach((li, index) => {
      const shouldBeVisible = newExpanded || index <= threshold;
      li.style.display = shouldBeVisible ? 'block' : 'none';
    });

    // Handle toggle visibility: show one .list-toggle and hide the other
    const toggleButtons = list.querySelectorAll('.list-toggle');
    if (isShowMoreShowLess) {
      toggleButtons.forEach((btn) => {
        btn.style.display = btn === clickedButton ? 'none' : 'flex';
      });
    }

    // Rotate the icon inside the clicked button, if present
    const icon = clickedButton.querySelector('svg');
    if (icon) icon.style.transform = newExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
  });
}
