import { parseStoreProduct, wrapChildrenWithStoreContext } from '../../scripts/utils.js';

let exitPopupShown = false;
let exitListenerAttached = false;

export default function decorate(block) {
  const section = block.closest('.exit-popup-container') || block.closest('.section');
  const metaData = section?.dataset;
  if (!metaData?.product) return;

  const { product, buttontext } = metaData;

  const {
    productId, devices, subscription, trialDuration,
  } = parseStoreProduct(product);

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
    priceBox.className = 'prices_box await-loader';
    priceBox.innerHTML = `
      <div class="d-flex">
        <div>
          <div class="d-flex" data-store-hide="!it.option.price.discounted">
            <span class="prod-oldprice mr-2" data-store-render data-store-price="full"></span>
          </div>
          <div class="d-flex">
            <span class="prod-newprice" data-store-render data-store-price="discounted||full"></span>
          </div>
        </div>
      </div>
      <div class="buy_box">
        <a class="red-buy-button" href="#" data-store-render data-store-buy-link="${trialDuration}">${buttontext}</a>
      </div>
    `;
    // the popup is hidden until the exit intent, its product is not counted in analytics
    wrapChildrenWithStoreContext(priceBox, {
      productId, devices, subscription, storeEvent: '',
    });
    popupModal.appendChild(priceBox);
  }

  overlay = document.querySelector('.exit-popup-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'exit-popup-overlay';
    overlay.addEventListener('click', hideModal);
    // inside main (the store root), not document.body
    (block.closest('main') || document.body).appendChild(overlay);
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
