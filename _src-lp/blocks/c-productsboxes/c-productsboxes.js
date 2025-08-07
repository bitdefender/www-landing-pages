import { productAliases } from '../../scripts/scripts.js';
import { updateProductsList } from '../../scripts/utils.js';

export default function decorate(block) {
  /// ///////////////////////////////////////////////////////////////////////
  // get data attributes set in metaData
  const parentSelector = block.parentNode.parentNode;
  const metaData = parentSelector.dataset;
  const {
    backgroundColor, title, subtitle, titlePosition, products, bulinaText, marginTop, marginBottom, paddingTop, paddingBottom, isCampaign,
  } = metaData;
  const productsAsList = products && products.split(',');

  if (productsAsList.length) {
    /// ///////////////////////////////////////////////////////////////////////
    // set the background-color
    if (backgroundColor) parentSelector.style.backgroundColor = backgroundColor;

    // set the title
    if (title) {
      const divTagTitle = document.createElement('div');
      divTagTitle.classList = `top_title ${typeof titlePosition !== 'undefined' ? `p_${titlePosition}` : ''}`;

      // adding title
      divTagTitle.innerHTML = document.querySelectorAll('h1').length === 0 ? `<h1>${title}</h1>` : `<h2>${title}</h2>`;

      // adding subtitle
      if (subtitle) {
        divTagTitle.innerHTML += `<h2>${subtitle}</h2>`;
      }

      block.parentNode.prepend(divTagTitle);
    }

    if (marginTop) parentSelector.style.marginTop = `${marginTop}rem`;
    if (marginBottom) parentSelector.style.marginBottom = `${marginBottom}rem`;
    if (paddingTop) parentSelector.style.paddingTop = `${paddingTop}rem`;
    if (paddingBottom) parentSelector.style.paddingBottom = `${paddingBottom}rem`;

    /// ///////////////////////////////////////////////////////////////////////
    // check and add products into the final array
    productsAsList.forEach((prod) => updateProductsList(prod));

    /// ///////////////////////////////////////////////////////////////////////
    // set top class with numbers of products
    parentSelector.classList.add(`has${productsAsList.length}boxes`);

    /// ///////////////////////////////////////////////////////////////////////
    // create procent - bulina
    if (typeof bulinaText !== 'undefined') {
      const bulinaSplitted = bulinaText.split(',');
      let divBulina = `<div class='prod-percent green_bck_circle bigger has${bulinaSplitted.length}txt'>`;
      bulinaSplitted.forEach((item, idx) => {
        let newItem = item;
        if (item.indexOf('0%') !== -1) {
          newItem = item.replace(/0%/g, '<b class=\'max-discount\'></b>');
        }
        divBulina += `<span class='bulina_text${idx + 1}'>${newItem}</span>`;
      });
      divBulina += '</div>';

      // add to the previous element
      if (block.parentNode.querySelector('.top_title')) {
        block.parentNode.querySelector('.top_title').innerHTML += divBulina;
      } else {
        block.parentNode.parentNode.previousElementSibling.innerHTML += divBulina;
      }
    }

    /// ///////////////////////////////////////////////////////////////////////
    // create prices sections
    productsAsList.forEach((item, idx) => {
      const prodBox = block.children[idx];
      const [prodName, prodUsers, prodYears] = productsAsList[idx].split('/');
      const onSelectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;
      const pricesDiv = document.createElement('div');
      const saveText = prodBox?.querySelector('table:nth-of-type(2)').innerText.trim();
      const firstYearText = prodBox?.querySelector('table:nth-of-type(3)').innerText.trim();
      // const h2Element = prodBox?.querySelector('h2');

      if (isCampaign === 'jamestowntribe') {
        pricesDiv.classList = 'prices_box';
        pricesDiv.innerHTML += '<span class="prod-newprice">$26.99</span>';
        pricesDiv.innerHTML += '<span class="prod-oldprice">$89.99</span>';
      } else {
        pricesDiv.classList = `prices_box await-loader prodload prodload-${onSelectorClass}`;
        if (saveText && saveText.indexOf('0') !== -1) {
          pricesDiv.innerHTML += `<p class="save-green-pill">
            ${saveText.replace(/0/g, `<span class="save-${onSelectorClass}"></span>`)}
          </p>`;
        } else {
          pricesDiv.innerHTML += `<span>${saveText}</span>`;
        }
        pricesDiv.innerHTML += `<span class="prod-newprice newprice-${onSelectorClass}"></span>`;
        pricesDiv.innerHTML += `<span class="prod-oldprice oldprice-${onSelectorClass}"></span>`;
      }

      if (firstYearText) pricesDiv.innerHTML += `<span class="first_year">${firstYearText}</span>`;

      prodBox.querySelector('table:nth-of-type(3)').innerHTML = '';
      prodBox.querySelector('table').after(pricesDiv);

      /// ///////////////////////////////////////////////////////////////////////
      // adding the elements between h2 and pricesDiv in a new div
      const divTable = document.createElement('div');
      divTable.className = 'div_table';

      const divP = document.createElement('div');
      divP.className = 'p_table';

      const firstContainer = prodBox.children[0];
      let foundH2 = false;
      [...firstContainer.children].some((el) => {
        console.log(el, el.tagName);

        if (el.tagName === 'H2' || el.tagName === 'HR') {
          foundH2 = true;
          return false; // continue iteration after h2
        }

        if (!foundH2) {
          divP.appendChild(el);
          return false; // skip nodes before H2
        }

        // Stop after first TABLE
        if (el.tagName === 'TABLE') {
          return true; // break .some loop
        }

        // After H2 is found, append current element
        divTable.appendChild(el);

        return false; // continue loop
      });

      // Insert divTable after the H2 element
      const h2Element = firstContainer.querySelector('h2:nth-of-type(1)');
      console.log('h2Element', h2Element);
      const hrElement = firstContainer.querySelector('hr:nth-of-type(1)');
      if (h2Element) {
        h2Element.after(divTable);
        h2Element.before(divP);
      } else if (hrElement) {
        hrElement.after(divTable);
        hrElement.before(divP);
      }

      /// ///////////////////////////////////////////////////////////////////////
      // adding top tag to each box
      let tagTextKey = `tagText${idx}`;
      if (idx === 0) {
        tagTextKey = 'tagText';
      }
      if (metaData[tagTextKey]) {
        const divTag = document.createElement('div');
        divTag.innerHTML = metaData[tagTextKey].indexOf('0%') !== -1 || metaData[tagTextKey].indexOf('0 %') !== -1 ? metaData[tagTextKey].replace(/0\s*%/g, `<span class="percent-${onSelectorClass}"></span>`) : metaData[tagTextKey];
        divTag.className = 'tag';
        // prodBox.parentNode.querySelector(`p:nth-child(1)`).before(divTag);
        prodBox?.querySelector('div').before(divTag);
      } else {
        // if no tagText is set, add default tag
        const divTag = document.createElement('div');
        divTag.className = 'tag';
        // set vizibility to hidden
        divTag.style.visibility = 'hidden';
        prodBox?.querySelector('div').before(divTag);
      }

      /// ////////////////////////////////////////////////////////////////////////
      // add buybtn div & anchor
      const tableBuybtn = prodBox?.querySelector('table:last-of-type');

      const aBuybtn = document.createElement('a');
      aBuybtn.innerHTML = tableBuybtn?.innerHTML.replace(/0%/g, `<span class="percent percent-${onSelectorClass} parent-no-hide"></span>`);
      aBuybtn.className = `red-buy-button buylink-${onSelectorClass} await-loader prodload prodload-${onSelectorClass}`;
      aBuybtn.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      aBuybtn.setAttribute('title', 'Buy Now Bitdefender');

      const divBuybtn = document.createElement('div');
      divBuybtn.classList.add('buybtn_box', 'buy_box', `buy_box${idx + 1}`);
      divBuybtn.appendChild(aBuybtn);

      if (isCampaign === 'jamestowntribe') {
        // adding reCaptcha script
        const recaptchaScript = document.createElement('script');
        recaptchaScript.src = 'https://www.google.com/recaptcha/api.js?render=explicit&onload=onRecaptchaLoadCallback';
        recaptchaScript.defer = true;
        document.body.appendChild(recaptchaScript);
        /* global grecaptcha */

        // Create the form element
        const formBox = document.createElement('div');
        const [inputText, buttonText] = parentSelector.querySelectorAll('table td');
        if (inputText && buttonText) {
          formBox.innerHTML = `<form id="formBox" onsubmit="event.preventDefault();">
            <p class="form_err"></p>
            <input class='input' id='formEmail' name='nfo[email]' placeholder='Email' type='email'></input>
            <button class='red-buy-button' type='submit'>${tableBuybtn.innerHTML}</button>
            <div id="captchaBox"></div>
          </form>`;
          window.onRecaptchaLoadCallback = () => {
            window.clientId = grecaptcha.render('captchaBox', {
              sitekey: '6LcEH5onAAAAAH4800Uc6IYdUvmqPLHFGi_nOGeR',
              badge: 'inline',
              size: 'invisible',
            });
          };
        }
        tableBuybtn.innerHTML = '';
        tableBuybtn.append(formBox);
      }

      tableBuybtn?.before(divBuybtn);

      if (isCampaign === 'jamestowntribe') {
        prodBox.querySelector('div.buybtn_box')?.remove();
        const saveBox = document.createElement('div');
        saveBox.innerHTML = 'Save 70%';
        saveBox.className = 'tag';
        const tag = prodBox.querySelector('.tag');
        prodBox.replaceChild(saveBox, tag);
      }

      /// ///////////////////////////////////////////////////////////////////////
      // removing last table
      if (isCampaign !== 'jamestowntribe') {
        tableBuybtn?.remove();
      }

      // add prod class on block
      prodBox?.classList.add(`${onSelectorClass}_box`, 'prod_box');
      prodBox?.setAttribute('data-testid', 'prod_box');

      /// ///////////////////////////////////////////////////////////////////////
      // add the elements after the buy button in a new div
      const divAfterBuy = document.createElement('div');
      divAfterBuy.className = 'after_buy';

      if (isCampaign !== 'jamestowntribe') {
        const children = [...firstContainer.children];
        const buyBtnIndex = children.findIndex((child) => child.classList.contains('buybtn_box'));

        if (buyBtnIndex !== -1 && buyBtnIndex < children.length - 1) {
          // Collect all elements after the buy button
          const elementsAfterBuy = children.slice(buyBtnIndex + 1);

          // Move them into the new div
          elementsAfterBuy.forEach((el) => {
            divAfterBuy.appendChild(el);
          });
        }
        // Insert the after_buy div after the buy button
        const buyBtnElement = children[buyBtnIndex];
        buyBtnElement.after(divAfterBuy);
      }
      // add case for jamestowntribe
      if (isCampaign === 'jamestowntribe') {
        const tables = firstContainer.querySelectorAll('table');
        if (tables.length >= 4) {
          const fourthTable = tables[3]; // index starts from 0

          // Get all siblings after the 4th table
          let current = fourthTable.nextElementSibling;
          while (current) {
            const next = current.nextElementSibling;
            divAfterBuy.appendChild(current);
            current = next;
          }

          fourthTable.after(divAfterBuy);
        }
      }

      /// ///////////////////////////////////////////////////////////////////////
      // get all the li elements and give them text-align left
      const ulElements = prodBox.querySelectorAll('ul');
      ulElements.forEach((ul) => {
        const liElements = ul.querySelectorAll('li');
        liElements.forEach((li) => {
          li.style.setProperty('text-align', 'left', 'important');
        });
      });
    });
  }
  // Event listener for form submission
  block.querySelector('#formBox button').addEventListener('click', async (event) => {
    const { target } = event;

    const allowedDomain = 'jamestowntribe.org';

    // Check if the click event is on a button inside a form
    if (target.tagName === 'BUTTON' && target.closest('form')) {
      event.preventDefault();

      const formBox = block.querySelector('#formBox');
      // Perform validation and reCAPTCHA
      const email = block.querySelector('#formEmail').value;
      const formErr = block.querySelector('#formBox .form_err');
      const formBtn = block.querySelector('#formBox button');
      const formErrData = {
        '001': 'Invalid page',
        '002': 'Invalid email address',
        '003': 'Invalid captcha',
        '004': 'Email successfully sent',
      };

      try {
        const emailDomain = email.split('@')[1];
        // Validate email with allowed domain
        if (emailDomain === allowedDomain) {
          formBtn.disabled = true;
          formBox.classList.add('await-loader');
          formErr.style.display = 'none';

          // Execute reCAPTCHA
          const captchaToken = await grecaptcha.execute(window.clientId, { action: 'submit' });

          // Prepare form data
          const formData = new FormData(block.querySelector('#formBox'));
          formData.append('email_field', email);
          formData.append('captcha', captchaToken);

          // Submit the form via fetch
          const response = await fetch(`https://www.bitdefender.com/site/Main/sendBuyLinkEmail?email_field=${email}&captcha=${captchaToken}`, {
            method: 'GET',
          });
          const jsonObj = await response.json();

          // Handle response
          if (jsonObj.error) {
            formErr.style.display = 'block';
            formErr.innerText = formErrData[jsonObj.error] || 'Please try again later';
          } else if (jsonObj.success) {
            window.location.replace(jsonObj.redirect);
          }

          formBtn.disabled = false;
          formBox.classList.remove('await-loader');
        } else {
          // Show invalid email error
          formErr.style.display = 'block';
          formErr.innerText = 'Invalid email address';
        }
      } catch (error) {
        // Handle errors
        console.error(error);
        formBtn.disabled = false;
        formBox.classList.remove('await-loader');
      }
    }
  });
}
