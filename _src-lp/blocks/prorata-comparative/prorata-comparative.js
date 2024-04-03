import { getDefaultLanguage } from '../../scripts/utils.js';

export default function decorate(block) {
  const parentSelector = block.closest('.section');
  const urlParams = window.location.search;

  // Remove the leading '?' character
  const params = new URLSearchParams(urlParams.substring(1));
  const price = params.get('PRICE');
  const currency = params.get('CURRENCY');
  const src = params.get('SRC');
  const license = params.get('LICENSE');
  const upgradeprod = params.get('UPGRADEPROD');
  const upgradeopt = params.get('UPGRADEOPT');
  const lang = getDefaultLanguage();
  let prorataPrice = 0;
  let renewPrice = 0;
  const buybutton = `https://store.bitdefender.com/order/upgrade.php?LICENSE=${license}&UPGRADEPROD=${upgradeprod}&UPGRADEOPT=${upgradeopt}&ORDERSTYLE=nLWw45SpnHI=&LANG=${lang}&CURRENCY=${currency}&DCURRENCY=${currency}&SRC=${src}`;

  if (currency === 'USD') {
    prorataPrice = `${price} ${currency}`;
    renewPrice = `${price} ${currency}`;
  } else {
    prorataPrice = `${currency} ${price}`;
    renewPrice = `${currency} ${price}`;
  }

  block.innerHTML = block.innerHTML.replace('0.0', prorataPrice);
  block.innerHTML = block.innerHTML.replace('XX', renewPrice);
  block.querySelector('table a').setAttribute('href', buybutton);
}
