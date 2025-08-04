import { updateProductsList } from '../../scripts/utils.js';
import { productAliases } from '../../scripts/scripts.js';

let exitPopupShown = false;
let exitListenerAttached = false;

export default function decorate(block) {
  // 1) Meta + selector
  const section = block.closest('.exit-popup-container') || block.closest('.section');
  const metaData = section?.dataset;
  if (!metaData?.product) return;

  const {
    product, buttontext,
  } = metaData;

  const [productName, prodUsers, prodYears] = product.split('/');
  const prodName = productName.trim();
  const selectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;

  // 2) Înregistrăm produsul pentru încărcare dinamică (prețuri/link)
  updateProductsList(product);

  // 3) Transformăm blocul din content în modal (NU creăm altul)
  const popupModal = block;
  popupModal.classList.add('exit-popup-modal');
  popupModal.setAttribute('role', 'dialog');
  popupModal.setAttribute('aria-modal', 'true');
  popupModal.style.display = 'none'; // ascuns inițial

  // 4) Adăugăm butonul de close dacă lipsește
  if (!popupModal.querySelector('.exit-popup-close')) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'exit-popup-close';
    closeBtn.setAttribute('aria-label', 'Close popup');
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', hideModal);
    popupModal.appendChild(closeBtn);
  }

  // 5) Injectăm price box (o singură dată)
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
        <a class="red-buy-button buylink-${selectorClass}" href="#">${buttontext}</a>
      </div>
    `;
    popupModal.appendChild(priceBox);
  }

  // 6) Overlay global (creat o singură dată)
  let overlay = document.querySelector('.exit-popup-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'exit-popup-overlay';
    overlay.addEventListener('click', hideModal); // click pe overlay închide
    document.body.appendChild(overlay);
  }

  // 7) Funcții show/hide — gestionează și containerul (care e ascuns inițial)
  function showModal() {
    // Afișăm containerul ca să nu moștenească display:none de la părinte
    if (section && section.classList.contains('exit-popup-container')) {
      section.style.display = 'block';
    }
    popupModal.classList.add('show');
    popupModal.style.display = 'block';
    overlay.classList.add('show');
    overlay.style.display = 'block';
    document.body.style.overflow = 'hidden'; // blochează scroll-ul
  }

  function hideModal() {
    popupModal.classList.remove('show');
    popupModal.style.display = 'none';
    overlay.classList.remove('show');
    overlay.style.display = 'none';
    document.body.style.overflow = ''; // repornește scroll-ul
    // opțional: reascundem containerul
    if (section && section.classList.contains('exit-popup-container')) {
      section.style.display = 'none';
    }
  }

  // 8) Evenimente — Esc pentru închidere
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideModal();
  });

  // 9) Exit intent — atașat o singură dată
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
