async function fetchData(url, body) {
  const resp = await fetch(url, { method: 'POST', body: JSON.stringify(body) });
  const json = await resp.json();
  return json.result;
}

export default function decorate(block) {
  const [title, subtitle, check1, check2, estimated, formButton, leaksTitle, leaksSubtitle, noLeaksTitle, noLeaksSubtitle, productTitle, productDescription, productButton, moneyBack, salesTax, tos] = block.children;
  const elementsToHide = [...block.children].slice(5);

  elementsToHide.forEach((element) => {
    element.classList.add('hide');
  });
  title.classList.add('title-class');
  subtitle.classList.add('subtitle-class');

  //  handler function
  async function submitHandler(event) {
    event.preventDefault();
    try {
      const emailInput = block.querySelector('input[type="email"]');
      const emailValue = emailInput.value;

      block.querySelector('.frame-1').classList.remove('show');
      block.querySelector('.frame-1').classList.add('hide');
      block.querySelector('.frame-2').classList.remove('hide');
      block.querySelector('.frame-2 h4:nth-child(1)').classList.add('show');
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve('done');
        }, 1000);
      });
      block
        .querySelector('.frame-2 h4:nth-child(1)')
        .classList.remove('show');
      block.querySelector('.frame-2 h4:nth-child(2)').classList.add('show');
      // Make the first request to fetchData
      const firstRequest = await fetchData(
        'https://nimbus.bitdefender.net/lid/privacy_check',
        {
          id: 1,
          jsonrpc: '2.0',
          method: 'on_demand_scan',
          params: {
            app_id: 'com.bitdefender.vpn',
            type: 'emails',
            value: emailValue,
          },
        },
      );
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve('done');
        }, 1000);
      });
      block
        .querySelector('.frame-2 h4:nth-child(2)')
        .classList.remove('show');
      block.querySelector('.frame-2 h4:nth-child(3)').classList.add('show');
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve('done');
        }, 1000);
      });
      //  Make the second request using the scan_id from the first request
      const secondRequest = await fetchData(
        'https://nimbus.bitdefender.net/lid/privacy_check',
        {
          id: 2,
          jsonrpc: '2.0',
          method: 'get_on_demand_issues',
          params: {
            scan_id: firstRequest.scan_id,
          },
        },
      );

      // const secondRequest = { total_count: 0 };

      block
        .querySelector('.frame-2 h4:nth-child(3)')
        .classList.remove('show');
      block.querySelector('.frame-2').classList.add('hide');
      block.querySelector('.frame-3').classList.remove('hide');
      block.querySelector('.frame-3').classList.add('show');
      if (secondRequest.total_count === 0) {
        block
          .querySelector('.frame-3 div:nth-child(1)')
          .classList.add('show');

        block.querySelector('.frame-3 h3:nth-child(1)').textContent = block.querySelector('.frame-3 h3:nth-child(1)').textContent.replace('{numberOfLeaks}', secondRequest.total_count);
      } else {
        block
          .querySelector('.frame-3 div:nth-child(2)')
          .classList.add('show');
        block.querySelector('.frame-3 > div:nth-of-type(2) > h3').textContent = block.querySelector('.frame-3 div:nth-of-type(2) > h3').textContent.replace('{numberOfLeaks}', secondRequest.total_count);
      }
    } catch (error) {
      block.querySelector('.frame-1').classList.remove('show');
      block.querySelector('.frame-1').classList.add('hide');
      block.querySelector('.frame-2').classList.add('hide');
      block.querySelector('.frame-2').classList.remove('show');
      block.querySelector('.frame-3').classList.add('show');
      const divsToHide = block.querySelectorAll('.frame-3 > div:not(:last-child)');

      divsToHide.forEach((div) => {
        div.classList.add('hide');
        div.classList.remove('show');
      });
      const lastDiv = block.querySelector('.frame-3 > div:last-child');
      lastDiv.classList.remove('hide');
    }
  }
  //  create form
  const form = document.createElement('form');
  form.classList.add('form');
  form.setAttribute('method', 'post');
  form.setAttribute('id', 'form-exposed');
  form.addEventListener('submit', submitHandler);

  //  add email
  const emailInput = document.createElement('input');
  emailInput.setAttribute('type', 'email');
  emailInput.setAttribute('placeholder', 'EMAIL ADDRESS');
  emailInput.setAttribute('required', '');
  emailInput.setAttribute('name', 'email');

  //  add checkbox
  const checkboxInput1 = document.createElement('input');
  checkboxInput1.setAttribute('type', 'checkbox');
  checkboxInput1.setAttribute('id', 'checkbox1');
  checkboxInput1.setAttribute('required', '');

  const checkboxInput2 = document.createElement('input');
  checkboxInput2.setAttribute('type', 'checkbox');
  checkboxInput2.setAttribute('id', 'checkbox2');

  //  add label
  const checkboxLabel1 = document.createElement('label');
  checkboxLabel1.setAttribute('for', 'checkbox1');
  checkboxLabel1.textContent = check1.textContent;
  block.removeChild(check1);

  const checkboxLabel2 = document.createElement('label');
  checkboxLabel2.setAttribute('for', 'checkbox2');
  checkboxLabel2.textContent = check2.textContent;
  block.removeChild(check2);

  //  add label+checkbox to div
  const checkboxDiv1 = document.createElement('div');
  checkboxDiv1.classList.add('checkbox');
  checkboxDiv1.appendChild(checkboxInput1);
  checkboxDiv1.appendChild(checkboxLabel1);

  const checkboxDiv2 = document.createElement('div');
  checkboxDiv2.classList.add('checkbox');
  checkboxDiv2.appendChild(checkboxInput2);
  checkboxDiv2.appendChild(checkboxLabel2);

  //  add submit button
  const submitButton = document.createElement('button');
  submitButton.setAttribute('type', 'submit');
  submitButton.textContent = formButton.querySelector('div').textContent;
  submitButton.setAttribute('value', 'Submit');
  // submitButton.addEventListener('click', submitHandler);

  //  append to form
  form.appendChild(emailInput);
  form.appendChild(checkboxDiv1);
  form.appendChild(checkboxDiv2);
  form.appendChild(submitButton);

  // Move estimated element after the form
  block.insertBefore(estimated, form.nextSibling);
  estimated.classList.add('estimated-time');

  // create a 1st frame container
  const firstDiv = document.createElement('div');
  firstDiv.classList.add('frame-1', 'show');
  firstDiv.appendChild(title);
  firstDiv.appendChild(subtitle);
  firstDiv.appendChild(form);
  firstDiv.appendChild(estimated);
  block.appendChild(firstDiv);

  // create second frame container
  const secondDiv = document.createElement('div');
  secondDiv.classList.add('frame-2', 'hide');
  secondDiv.innerHTML = '<h4 class = "hide">Searching through the deep web...</h4><h4 class = "hide">Launching dark web scan...</h4><h4 class = "hide">Analysing Data...</h4><p><span class="icon icon-wave"><!--?xml version="1.0" encoding="UTF-8"?--><svg height="60px" viewBox="5 0 80 60" width="80px" xmlns="http://www.w3.org/2000/svg"><style type="text/css">.wave {animation: move-the-wave 1s linear infinite;}@keyframes move-the-wave {0% {stroke-dashoffset: 0;transform: translate3d(0, 0, 0);}to {stroke-dashoffset: -133;transform: translate3d(-90px, 0, 0);}}</style><path class="wave" fill="none" stroke="#205fff" stroke-linecap="round" stroke-width="4" d="M 0 37.5 c 7.684299348848887 0 7.172012725592294 -15 15 -15 s 7.172012725592294 15 15 15 s 7.172012725592294 -15 15 -15 s 7.172012725592294 15 15 15 s 7.172012725592294 -15 15 -15 s 7.172012725592294 15 15 15 s 7.172012725592294 -15 15 -15 s 7.172012725592294 15 15 15 s 7.172012725592294 -15 15 -15 s 7.172012725592294 15 15 15 s 7.172012725592294 -15 15 -15 s 7.172012725592294 15 15 15 s 7.172012725592294 -15 15 -15 s 7.172012725592294 15 15 15 s 7.172012725592294 -15 15 -15 s 7.172012725592294 15 15 15 s 7.172012725592294 -15 15 -15"></path></svg></span></p>  ';
  block.appendChild(secondDiv);

  // create third frame container
  const thirdDiv = document.createElement('div');
  thirdDiv.classList.add('frame-3', 'hide');

  thirdDiv.innerHTML = `
  <div class="hide">
    <h3>${noLeaksTitle.innerText}</h3>
    ${noLeaksSubtitle.innerText}
  </div>
  <div class="hide">
      <h3>${leaksTitle.innerText}</h3>
      ${leaksSubtitle.innerHTML}
  </div>
  <div class="product-wrapper">
      <div class="product">
          <div class="highlight" style="display=none"><span></span></div>
          <p>${productTitle.innerHTML}</p>
          <p>${productDescription.innerText}</p>
          <hr>
          ${productButton.innerHTML}
          <p>${moneyBack.innerText}</p>
          <p>${salesTax.innerText}</p>
          <p>${tos.innerText}</p>
      </div>
  </div>
  <div class="error hide">
      <h3>Error</h3>
      <p>Please try again after sometime.</p>
  </div>`;
  block.appendChild(thirdDiv);
  // Scroll to section
  function scrollToExposedForm() {
    const exposedForm = document.getElementById('exposed-form');
    if (exposedForm) {
      console.log('Scrolling to exposed-form');
      exposedForm.scrollIntoView({ behavior: 'smooth' });
      console.log('Scrolled to exposed-form:', exposedForm);
    } else {
      console.error('Element with ID "exposed-form" not found.');
    }
  }

  function observeDOM() {
    const observer = new MutationObserver((mutationsList, obs) => {
      mutationsList.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const exposedForm = document.getElementById('exposed-form');
          if (exposedForm) {
            obs.disconnect();
            scrollToExposedForm();
          }
        }
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
  observeDOM();
}
