import { getMetadata } from '../../lib-franklin.js';
import { decorateMain, isView } from '../../scripts.js';

const isMobileView = isView('mobile');

let attemptsToInformUser = 0;
let emailHasBeenSubmitted = false;

function isDialogVisible() {
  return document.body.classList.contains('modal-open');
}

function isInLimitOfAttempts() {
  return attemptsToInformUser > 0;
}

async function openDialog() {
  if (isDialogVisible() || isInLimitOfAttempts() || emailHasBeenSubmitted) return;

  attemptsToInformUser += 1;
  const popupUrl = getMetadata('popup-url');
  const popupSuccessUrl = getMetadata('popup-url-success');
  const { openModal } = await import(`${window.hlx.codeBasePath}/blocks/modal-lp/modal-lp.js`);
  const modalInstance = await openModal(popupUrl);

  const buttonLink = modalInstance.querySelector('a');
  const defaultContentWrapper = modalInstance.querySelector('.default-content-wrapper');

  const inputParent = modalInstance.querySelector('input').parentNode.parentNode;
  inputParent.classList.add('input-wrapper');

  buttonLink.addEventListener('click', async (e) => {
    e.preventDefault();
    const input = modalInstance.querySelector('input');
    const email = input.value;

    const emailIsValid = email && /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email);

    if (inputParent.classList.contains('invalid') && !emailIsValid) {
      return;
    }

    if (!emailIsValid) {
      inputParent.classList.add('invalid');
      inputParent.innerHTML += '<span class="error-message">Invalid email address</span>';
      return;
    }

    // const data = {
    //   email,
    //   flow: 'EMM_DIP_POPUP_OFFER',
    // };
    //
    // const promise = await fetch('https://www.bitdefender.com/site/Store/offerSubscribe', {
    //   method: 'POST',
    //   body: JSON.stringify(data),
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    // });
    //
    // const result = await promise.json();
    //
    // if (result.ok) {
    if (true) {
      emailHasBeenSubmitted = true;
      // fetch the other fragment and update modal-lp content
      const path = popupSuccessUrl.startsWith('http')
        ? new URL(popupSuccessUrl, window.location).pathname
        : popupSuccessUrl;

      // const fragment = await loadFragment(path);
      let newPath = path;
      if (window.location.hostname === 'www.bitdefender.com' && !path.startsWith('/pages')) {
        // eslint-disable-next-line no-param-reassign
        newPath = `/pages${path}`;
      }

      const result = await fetch(`${newPath}.plain.html`);
      const fragment = document.createElement('main');
      fragment.innerHTML = await result.text();
      decorateMain(fragment);
      const newDefaultContentWrapper = fragment.querySelector('.default-content-wrapper');

      newDefaultContentWrapper.classList.add('success');
      defaultContentWrapper.replaceWith(newDefaultContentWrapper);

      const newInput = modalInstance.querySelector('input');
      newInput.disabled = true;
      newInput.value = input.value;
      newInput.parentNode.parentNode.classList.add('input-wrapper', 'valid');
    }
  });
}

function detectExitIntent() {
  if (isMobileView) {
    return;
  }

  document.addEventListener('mouseout', (event) => {
    if (event.clientY < 50) {
      // Assuming the user's intent to exit if the mouse is 50 pixels close to the top
      // Trigger your exit intent modal-lp or function here
      openDialog();
    }
  });

  window.addEventListener('blur', () => {
    openDialog();
  });

  document.addEventListener('visibilitychange', () => {
    openDialog();
  });
}

detectExitIntent();
