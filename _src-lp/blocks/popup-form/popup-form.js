// blocks/popup-form/popup-form.js
import { updateProductsList } from '../../scripts/utils.js';
import { productAliases } from '../../scripts/scripts.js';
import { renderTurnstile, submitWithTurnstile } from '../../scripts/utils.js';

let exitPopupShown = false;
let exitListenerAttached = false;
let widgetId = null;
let token = null;
let isRenderingTurnstile = false;

function slugifyLabel(label) {
  return label
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '');
}

function buildFormFromTable(popupModal, buttonText = 'Submit') {
  const table = popupModal.querySelector('table');
  if (!table) return null;

  const labels = Array.from(table.querySelectorAll('td'))
    .map((td) => td.textContent.trim())
    .filter((txt) => txt.length > 0);

  if (!labels.length) return null;

  const form = document.createElement('form');
  form.className = 'popup-simple-form';
  form.setAttribute('novalidate', 'novalidate');

  labels.forEach((label, idx) => {
    const name = slugifyLabel(label) || `field-${idx + 1}`;
    const row = document.createElement('div');
    row.className = 'input-row input-row2';

    const box = document.createElement('div');
    box.className = 'input-box';
    box.innerHTML = `
      <label for="input-${name}">${label}</label>
      <input id="input-${name}" name="${name}" type="text" required>
      <em class="input-err" style="display: none;">This field is required</em>
    `;
    row.appendChild(box);
    form.appendChild(row);
  });

  // Container pentru Turnstile
  const turnstileRow = document.createElement('div');
  turnstileRow.className = 'input-row input-row2';
  const turnstileBox = document.createElement('div');
  turnstileBox.className = 'input-box';
  turnstileBox.innerHTML = `<div id="turnstile-container-popup" class="turnstile-box"></div>`;
  turnstileRow.appendChild(turnstileBox);
  form.appendChild(turnstileRow);

  const actionsRow = document.createElement('div');
  actionsRow.className = 'input-row input-row2';
  const actionsBox = document.createElement('div');
  actionsBox.className = 'input-box';
  actionsBox.innerHTML = `<button type="submit" class="submit-btn">${buttonText}</button>`;
  actionsRow.appendChild(actionsBox);
  form.appendChild(actionsRow);

  table.replaceWith(form);
  return form;
}

function handlePopupSubmit(form, fileName) {
  const validateFields = () => {
    let isValid = true;
    const inputs = form.querySelectorAll('input');

    inputs.forEach((input) => {
      const container = input.closest('.input-box');
      const errorEl = container.querySelector('.input-err');
      
      let showError = false;
      const value = input.value?.trim();

      if (input.hasAttribute('required') && !value) {
        showError = true;
      }

      errorEl.style.display = showError ? 'block' : 'none';
      if (showError) isValid = false;
    });

    // Verifică dacă Turnstile este completat
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
    
    const data = new Map();
    const date = new Date().toISOString().replace('T', ' ').slice(0, 19);
    data.set('DATE', date);

    form.querySelectorAll('.input-box input').forEach((input) => {
      if (!input.name) return;
      const key = input.name.toUpperCase().replace(/-/g, '_');
      data.set(key, input.value?.trim() || '');
    });

    // Convert Map to object
    const dataObject = Object.fromEntries(data);

    try {
      // FOR DEVELOPMENT - simulăm success
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('🏗️ DEVELOPMENT MODE: Simulating form submission');
        console.log('📁 File:', fileName);
        console.log('📊 Data:', dataObject);
        console.log('🔑 Token:', token);
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        form.reset();
        form.classList.remove('loading');
        alert('Form submitted successfully! (Simulated in development)');
        
        if (window.turnstile && widgetId) {
          window.turnstile.reset(widgetId);
        }
        return;
      }

      // Pentru producție - folosește funcția reală
      await submitWithTurnstile({
        widgetId,
        token,
        data: dataObject,
        fileName,
        successCallback: () => {
          form.reset();
          form.classList.remove('loading');
          alert('Form submitted successfully!');
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
  if (!container) {
    console.error('❌ Turnstile container not found');
    return;
  }

  // Verifică dacă se renderează deja
  if (isRenderingTurnstile) {
    console.log('⏳ Turnstile is already rendering, skipping...');
    return;
  }

  // Verifică dacă widget-ul există deja
  if (container.querySelector('.cf-turnstile')) {
    console.log('✅ Turnstile already rendered, skipping...');
    return;
  }

  isRenderingTurnstile = true;

  try {
    console.log('🔄 Rendering Turnstile...');
    
    // Resetează containerul înainte de render
    container.innerHTML = '';
    
    const result = await renderTurnstile('turnstile-container-popup', { 
      invisible: false 
    });
    
    widgetId = result.widgetId;
    token = result.token;
    console.log('✅ Turnstile rendered with widgetId:', widgetId);
  } catch (error) {
    console.error('❌ Turnstile render failed:', error);
    
    // Fallback pentru development
    container.innerHTML = `
      <div style="color: #666; text-align: center; padding: 20px; border: 2px dashed #ccc; border-radius: 8px;">
        <div>🔒 Security Check</div>
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

  let form = null;
  
  if (savedata) {
    form = buildFormFromTable(block, buttontext || 'Submit');
  }

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
    if (form && savedata) {
      // Așteaptă ca DOM-ul să se actualizeze
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
  if (form && savedata) {
    handlePopupSubmit(form, savedata);
  }

  // prețuri/selectorClass
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

  // overlay
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