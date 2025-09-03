// blocks/popup-form/popup-form.js
import { updateProductsList } from '../../scripts/utils.js';
import { productAliases } from '../../scripts/scripts.js';
import { renderTurnstile, submitWithTurnstile } from '../../scripts/utils.js';

let exitPopupShown = false;
let exitListenerAttached = false;
let widgetId = null;
let token = null;
let isRenderingTurnstile = false;

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

  // Turnstile
  const turnstileRow = document.createElement('div');
  turnstileRow.className = 'input-row input-row2';
  const turnstileBox = document.createElement('div');
  turnstileBox.className = 'input-box';
  turnstileBox.innerHTML = `<div id="turnstile-container-popup" class="turnstile-box"></div>`;
  turnstileRow.appendChild(turnstileBox);
  form.appendChild(turnstileRow);

  // Submit button
  const actionsRow = document.createElement('div');
  actionsRow.className = 'input-row input-row2';
  const actionsBox = document.createElement('div');
  actionsBox.className = 'input-box';
  actionsBox.innerHTML = `<button type="submit" class="submit-btn" disabled>${buttonText}</button>`;
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

    if (!token) {
      alert('Please complete the security challenge.');
      isValid = false;
    }

    return isValid;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateFields()) return;

    form.classList.add('loading');
    
    // Date automate + Email
    const data = {
      DATE: new Date().toISOString().replace('T', ' ').slice(0, 19),
      LOCALE: window.location.pathname.split('/')[1] || 'en',
      EMAIL: form.querySelector('#input-email').value.trim()
    };

    console.log('📤 Sending data:', data);

    try {
      // FOR DEVELOPMENT - simulăm success
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('🏗️ DEVELOPMENT MODE: Simulating form submission');
        console.log('📁 File:', fileName);
        console.log('📊 Data:', data);
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        form.reset();
        form.classList.remove('loading');
        alert('Thank you for subscribing! (Simulated in development)');
        
        if (window.turnstile && widgetId) {
          window.turnstile.reset(widgetId);
        }
        
        // Dezactivează butonul din nou
        const submitBtn = form.querySelector('.submit-btn');
        if (submitBtn) {
          submitBtn.disabled = true;
        }
        return;
      }

      // Pentru producție - folosește funcția reală
      await submitWithTurnstile({
        widgetId,
        token,
        data: data,
        fileName,
        successCallback: () => {
          form.reset();
          form.classList.remove('loading');
          alert('Thank you for subscribing!');
          
          // Resetează Turnstile după submit
          if (window.turnstile && widgetId) {
            window.turnstile.reset(widgetId);
          }
          
          // Dezactivează butonul din nou
          const submitBtn = form.querySelector('.submit-btn');
          if (submitBtn) {
            submitBtn.disabled = true;
          }
        },
        errorCallback: (err) => {
          form.classList.remove('loading');
          alert(`Error: ${err.message}`);
        }
      });
    } catch (error) {
      form.classList.remove('loading');
      console.error('Error:', error);
      alert('Error submitting form. Please try again.');
    }
  });
}

async function renderTurnstileInPopup() {
  const container = document.getElementById('turnstile-container-popup');
  const submitBtn = document.querySelector('.submit-btn');
  
  if (!container) return;

  if (isRenderingTurnstile) return;
  isRenderingTurnstile = true;

  try {
    container.innerHTML = '';
    
    const result = await renderTurnstile('turnstile-container-popup', { 
      invisible: false,
      callback: (newToken) => {
        // Activează butonul când Turnstile e gata
        token = newToken;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
          submitBtn.style.cursor = 'pointer';
        }
        console.log('✅ Turnstile completed');
      },
      'error-callback': () => {
        console.error('❌ Turnstile error');
      },
      'expired-callback': () => {
        token = null;
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.style.opacity = '0.6';
          submitBtn.style.cursor = 'not-allowed';
        }
        console.log('🔄 Turnstile token expired');
      }
    });
    
    widgetId = result.widgetId;
    console.log('✅ Turnstile rendered with widgetId:', widgetId);
  } catch (error) {
    console.error('Turnstile error:', error);
    container.innerHTML = `
      <div style="color: #666; text-align: center; padding: 20px; border: 2px dashed #ccc; border-radius: 8px;">
        <div>🔒 Security check</div>
        <small style="color: #999;">Cloudflare Turnstile widget</small>
      </div>
    `;
  } finally {
    isRenderingTurnstile = false;
  }
}

export default async function decorate(block) {
  const section = block.closest('.popup-form-container') || block.closest('.section');
  const metaData = section?.dataset || {};
  const { product, buttontext, triggermode, savedata } = metaData;
  const triggerMode = (triggermode || 'exit').toLowerCase();

  // Creează formularul simplu (doar email)
  const form = buildEmailForm(block, buttontext || 'Subscribe');

  const popupModal = block;
  popupModal.classList.add('popup-form-modal');
  popupModal.setAttribute('role', 'dialog');
  popupModal.setAttribute('aria-modal', 'true');
  popupModal.style.display = 'none';

  const originalShowModal = (evt) => {
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

    // Render Turnstile după ce popup este afișat
    if (savedata) {
      setTimeout(() => {
        renderTurnstileInPopup();
      }, 100);
    }
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
    
    // Resetează Turnstile la închidere
    if (widgetId && window.turnstile) {
      window.turnstile.reset(widgetId);
    }
    widgetId = null;
    token = null;
    
    // Dezactivează butonul
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.6';
      submitBtn.style.cursor = 'not-allowed';
    }
    
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

  // Setup form submission
  if (savedata) {
    handlePopupSubmit(form, savedata);
  }

  // prețuri/selectorClass doar dacă există product
  if (product) {
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

  // overlay (creat o singură dată)
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

  // trigger mode
  if (triggerMode === 'link') {
    const triggerLinks = document.querySelectorAll('a[href*="open-modal"]');
    triggerLinks.forEach((a) => {
      if (!a.dataset.popupListenerAttached) {
        a.addEventListener('click', originalShowModal);
        a.dataset.popupListenerAttached = 'true';
      }
    });
    if (!document.body.dataset.popupDelegationAttached) {
      document.body.addEventListener('click', (e) => {
        const link = e.target.closest('a[href*="open-modal"]');
        if (link) originalShowModal(e);
      });
      document.body.dataset.popupDelegationAttached = 'true';
    }
  } else {
    if (!exitListenerAttached) {
      document.addEventListener('mouseout', (e) => {
        const nearTop = e.clientY < 50 && !e.relatedTarget;
        if (!exitPopupShown && nearTop) {
          originalShowModal();
          exitPopupShown = true;
        }
      });
      exitListenerAttached = true;
    }
  }
}