// blocks/popup-form/popup-form.js
import { updateProductsList } from '../../scripts/utils.js';
import { productAliases } from '../../scripts/scripts.js';

let exitPopupShown = false;
let exitListenerAttached = false;

function ensureTurnstileScript() {
  const SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
  if (window.turnstile) return;
  const already = [...document.scripts].some(s => (s.src || '').startsWith(SRC));
  if (already) return;

  const script = document.createElement('script');
  script.src = SRC;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

function buildEmailForm(popupModal, buttonText = 'Submit') {
  const table = popupModal.querySelector('table');
  
  const form = document.createElement('form');
  form.className = 'popup-simple-form';
  form.setAttribute('novalidate', 'novalidate');

  // Titlu din primul rând al tabelului (dacă există)
  let titleText = 'Subscribe';
  if (table) {
    const firstRow = table.querySelector('tr:first-child');
    if (firstRow) {
      titleText = firstRow.textContent.trim();
    }
  }

  // Titlu
  const titleRow = document.createElement('div');
  titleRow.className = 'input-row';
  titleRow.innerHTML = `<h3 style="text-align: center; margin-bottom: 20px;">${titleText}</h3>`;
  form.appendChild(titleRow);

  // Email Field
  const emailRow = document.createElement('div');
  emailRow.className = 'input-row input-row2';
  const emailBox = document.createElement('div');
  emailBox.className = 'input-box';
  emailBox.innerHTML = `
    <label for="input-email">Email address</label>
    <input id="input-email" name="email" type="email" required placeholder="Enter your email">
    <em class="input-err" style="display: none;">Please enter a valid email address</em>
  `;
  emailRow.appendChild(emailBox);
  form.appendChild(emailRow);

  // Turnstile (auto-render) — vizibil
  const turnstileRow = document.createElement('div');
  turnstileRow.className = 'input-row input-row2';
  const turnstileBox = document.createElement('div');
  turnstileBox.className = 'input-box';
  turnstileBox.innerHTML = `
    <div class="cf-turnstile"
         data-sitekey="0x4AAAAAABkTzSd63P7J-Tl_"
         data-theme="light"
         data-size="normal">
    </div>`;
  turnstileRow.appendChild(turnstileBox);
  form.appendChild(turnstileRow);

  // Submit button (fără disabled)
  const actionsRow = document.createElement('div');
  actionsRow.className = 'input-row input-row2';
  const actionsBox = document.createElement('div');
  actionsBox.className = 'input-box';
  actionsBox.innerHTML = `<button type="submit" class="submit-btn">${buttonText}</button>`;
  actionsRow.appendChild(actionsBox);
  form.appendChild(actionsRow);

  // Înlocuiește tabelul (dacă există)
  if (table) {
    table.replaceWith(form);
  } else {
    popupModal.appendChild(form);
  }
  
  return form;
}

function handlePopupSubmit(form, fileName) {
  const ENDPOINT = (window.location.hostname.startsWith('www.'))
    ? 'https://www.bitdefender.com/form'
    : 'https://stage.bitdefender.com/form';

  const validateFields = () => {
    let isValid = true;
    const emailInput = form.querySelector('#input-email');
    const errorEl = emailInput.closest('.input-box').querySelector('.input-err');
    const email = emailInput.value.trim();
    
    if (!email) {
      errorEl.textContent = 'Email is required';
      errorEl.style.display = 'block';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errorEl.textContent = 'Please enter a valid email address';
      errorEl.style.display = 'block';
      isValid = false;
    } else {
      errorEl.style.display = 'none';
    }

    // Tokenul Turnstile este inserat automat ca input hidden
    const token = form.querySelector('input[name="cf-turnstile-response"]')?.value || '';
    if (!token || token.length < 10) {
      alert('Please complete the security challenge.');
      isValid = false;
    }

    return isValid;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateFields()) return;

    form.classList.add('loading');

    const token = form.querySelector('input[name="cf-turnstile-response"]')?.value || '';
    const data = {
      DATE: new Date().toISOString().replace('T', ' ').slice(0, 19),
      LOCALE: window.location.pathname.split('/')[1] || 'en',
      EMAIL: form.querySelector('#input-email').value.trim(),
    };

    const payload = {
      file: `/sites/common/formdata/${fileName}.xlsx`,
      table: 'Table1',
      row: data,
      token,
    };

    try {
      // Dev helper: dacă ești pe localhost, simulăm succes (poți elimina asta)
      if (['localhost', '127.0.0.1'].includes(window.location.hostname)) {
        console.log('DEV MODE: Simulated submit', { ENDPOINT, payload });
        await new Promise(r => setTimeout(r, 800));
        alert('Simulated: entry written.');
        form.classList.remove('loading');
        form.reset();
        try { window.turnstile?.reset(); } catch(_) {}
        return;
      }

      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Server returned ${res.status}${text ? `: ${text}` : ''}`);
      }

      alert('Thank you! Entry written.');
      form.classList.remove('loading');
      form.reset();
      try { window.turnstile?.reset(); } catch(_) {}

    } catch (err) {
      console.error('Submit error:', err);
      form.classList.remove('loading');
      alert(`Error submitting form. ${err.message || err}`);
    }
  });
}

function setupPrices(popupModal, product, buttontext) {
  if (!product) return;
  try {
    const [productName = '', prodUsers = '', prodYears = ''] = String(product).split('/');
    const prodName = productName.trim();
    const selectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;
    try { updateProductsList(product); } catch (e) { /* noop */ }

    if (!popupModal.querySelector('.prices_box')) {
      const priceBox = document.createElement('div');
      priceBox.className = `prices_box await-loader prodload prodload-${selectorClass}`;
      priceBox.innerHTML = `
        <div class="d-flex">
          <div>
            <div class="d-flex">
              <span class="prod-oldprice oldprice-${selectorClass} mr-2"></span>
            </div>
            <div class="d-flex">
              <span class="prod-newprice newprice-${selectorClass}"></span>
            </div>
          </div>
        </div>
        <div class="buy_box">
          <a class="red-buy-button buylink-${selectorClass}" href="#">${buttontext || 'Buy now'}</a>
        </div>
      `;
      popupModal.appendChild(priceBox);
    }
  } catch (e) {
    console.warn('Product setup failed:', e);
  }
}

export default async function decorate(block) {
  const section = block.closest('.popup-form-container') || block.closest('.section');
  const metaData = section?.dataset || {};
  const { product, buttontext, triggermode, savedata } = metaData;
  const triggerMode = (triggermode || 'exit').toLowerCase();

  // Construiește formularul
  const form = buildEmailForm(block, buttontext || 'Subscribe');

  // Modal setup
  const popupModal = block;
  popupModal.classList.add('popup-form-modal');
  popupModal.setAttribute('role', 'dialog');
  popupModal.setAttribute('aria-modal', 'true');
  popupModal.style.display = 'none';

  const showModal = (evt) => {
    if (evt) evt.preventDefault();
    if (section && section.classList.contains('popup-form-container')) {
      section.style.display = 'block';
    }
    popupModal.classList.add('show');
    popupModal.style.display = 'block';
    const overlay = document.querySelector('.popup-form-overlay');
    if (overlay) {
      overlay.classList.add('show');
      overlay.style.display = 'block';
    }
    document.body.style.overflow = 'hidden';

    // Încarcă scriptul Turnstile (dacă nu e deja)
    ensureTurnstileScript();
  };

  const hideModal = () => {
    popupModal.classList.remove('show');
    popupModal.style.display = 'none';
    const overlay = document.querySelector('.popup-form-overlay');
    if (overlay) {
      overlay.classList.remove('show');
      overlay.style.display = 'none';
    }
    document.body.style.overflow = '';

    // Resetăm widgetul pentru următoarea deschidere
    try { window.turnstile?.reset(); } catch(_) {}

    if (section && section.classList.contains('popup-form-container')) {
      section.style.display = 'none';
    }
  };

  if (!popupModal.querySelector('.popup-form-close')) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'popup-form-close';
    closeBtn.setAttribute('aria-label', 'Close popup');
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', hideModal);
    popupModal.appendChild(closeBtn);
  }

  // Submit handler (scriere în fișier)
  if (savedata) {
    handlePopupSubmit(form, savedata);
  }

  // Prețuri (dacă există product)
  setupPrices(popupModal, product, buttontext);

  // overlay (o singură dată)
  let overlay = document.querySelector('.popup-form-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'popup-form-overlay';
    overlay.addEventListener('click', hideModal);
    document.body.appendChild(overlay);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideModal();
  });

  // trigger
  if (triggerMode === 'link') {
    const triggerLinks = document.querySelectorAll('a[href*="open-modal"]');
    triggerLinks.forEach((a) => {
      if (!a.dataset.popupListenerAttached) {
        a.addEventListener('click', showModal);
        a.dataset.popupListenerAttached = 'true';
      }
    });
    if (!document.body.dataset.popupDelegationAttached) {
      document.body.addEventListener('click', (e) => {
        const link = e.target.closest('a[href*="open-modal"]');
        if (link) showModal(e);
      });
      document.body.dataset.popupDelegationAttached = 'true';
    }
  } else {
    if (!exitListenerAttached) {
      document.addEventListener('mouseout', (e) => {
        const nearTop = e.clientY < 50 && !e.relatedTarget;
        if (!exitPopupShown && nearTop) {
          showModal();
          exitPopupShown = true;
        }
      });
      exitListenerAttached = true;
    }
  }
}
