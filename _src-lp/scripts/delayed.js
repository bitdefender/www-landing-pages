// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';
import { getInstance, addScript, fetchGeoIP } from './utils.js';

if (getInstance() === 'prod') {
  if ((Math.random() * 100) < 1) {
    addScript('https://js.sentry-cdn.com/31155ca43cab4235b06e5da92992eef0.min.js');
  }
}

fetchGeoIP();

export function activateRadios(block, type) {
  console.log('sadfasd')
  const allRadios = block.querySelectorAll('input[type="radio"]');
  allRadios.forEach((radio) => {
    const radioID = radio.id;
    block.addEventListener('click', (event) => {
      const { target } = event;
      if (target.tagName === 'INPUT' && target.id === radioID) {
        const select = target.dataset.select;
        let prodBox = target.closest('.prodBox');

        if (typeof type !== 'undefined' && type === 'combined') {
          prodBox = event.target.closest('.hasProds');
          allRadios.forEach((r) => {
            r.checked = (r.dataset.select === select);
          });
        }

        if (prodBox) {
          ['yearly', 'monthly'].forEach((period) => {
            prodBox.querySelectorAll(`.${period}`).forEach((item) => {
              item.classList.toggle('show');
              item.classList.toggle('hide');
            });
          });
        }
      }
    });
  });
}

// Core Web Vitals RUM collection
sampleRUM('cwv');
