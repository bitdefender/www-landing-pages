import { updateProductsList } from '../../scripts/utils.js';
import { productAliases } from '../../scripts/scripts.js';

let exitPopupShown = false;
let exitListenerAttached = false;

export default function decorate(block) {
  const section = block.closest('.exit-popup-container') || block.closest('.section');
  const metaData = section?.dataset;
  if (!metaData?.product) return;

  const { product, buttontext } = metaData;

  const [productName, prodUsers, prodYears] = product.split('/');
  const prodName = productName.trim();
  const selectorClass = `${productAliases(prodName)}-${prodUsers}${prodYears}`;

  updateProductsList(product);

  const popupModal = block;
  popupModal.classList.add('exit-popup-modal');
  popupModal.setAttribute('role', 'dialog');
  popupModal.setAttribute('aria-modal', 'true');
  popupModal.style.display = 'none';

  let overlay;

  const showModal = () => {
    if (section && section.classList.contains('exit-popup-container')) {
      section.style.display = 'block';
    }
    popupModal.classList.add('show');
    popupModal.style.display = 'block';
    if (overlay) {
      overlay.classList.add('show');
      overlay.style.display = 'block';
    }
    document.body.style.overflow = 'hidden';
  };

  const hideModal = () => {
    popupModal.classList.remove('show');
    popupModal.style.display = 'none';
    if (overlay) {
      overlay.classList.remove('show');
      overlay.style.display = 'none';
    }
    document.body.style.overflow = '';
    if (section && section.classList.contains('exit-popup-container')) {
      section.style.display = 'none';
    }
  };

  if (!popupModal.querySelector('.exit-popup-close')) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'exit-popup-close';
    closeBtn.setAttribute('aria-label', 'Close popup');
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', hideModal);
    popupModal.appendChild(closeBtn);
  }

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

  overlay = document.querySelector('.exit-popup-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'exit-popup-overlay';
    overlay.addEventListener('click', hideModal);
    document.body.appendChild(overlay);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideModal();
  });

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
