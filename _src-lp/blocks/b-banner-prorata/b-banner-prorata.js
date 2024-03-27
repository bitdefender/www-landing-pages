import { getDefaultLanguage } from '../../scripts/utils.js';

export default function decorate(block) {
  const parentSelector = block.closest('.section');
  // const metaData = parentSelector.dataset;
  // const {
  //   product, discountStyle, discountText, textColor, backgroundColor, bottom, imageVariation, bannerDiscount,
  //   headerTextColor, blueBorder, logo, config, productBox, counterSwitchOn, counterHeadings, counterTheme, biggerBanner,
  // } = metaData;

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

  // move picture below
  const bannerImage = block.children[1].querySelector('picture');
  if (!parentSelector.classList.contains('counter')) {
    bannerImage.classList.add('banner-image');
  }
  parentSelector.append(bannerImage);

  // console.log(parentSelector);

  const proRataContent = parentSelector.querySelector('.b-banner-prorata.block'); // Get the container element
  const table = proRataContent.querySelector('table'); // Find all tables within the container

  // console.log(proRataContent);

  // Create a new div to replace the table
  const proRataHeader = document.createElement('div');
  proRataHeader.classList.add('prorata-table');

  // Process and replace table content:
  const tableBody = table.querySelector('tbody'); // Get the table body

  const heading = tableBody.querySelector('tr:first-child td').innerHTML;
  const headingSubtitle = tableBody.querySelector('tr:nth-child(2) td').innerHTML;
  const currentPlan = tableBody.querySelector('tr:nth-child(3) td').innerHTML;
  const firstProduct = tableBody.querySelector('tr:nth-child(4) td').innerHTML;
  const firstProductButton = tableBody.querySelector('tr:nth-child(5) td').innerHTML;
  const bestValuePlan = tableBody.querySelector('tr:nth-child(6) td').innerHTML;
  const secondProduct = tableBody.querySelector('tr:nth-child(7) td').innerHTML;
  const secondProductDevices = tableBody.querySelector('tr:nth-child(8) td').innerHTML;
  const secondProductFree = tableBody.querySelector('tr:nth-child(9) td').innerHTML;
  const secondProductInfo = tableBody.querySelector('tr:nth-child(10) td').innerHTML;
  const secondProductButton = tableBody.querySelector('tr:nth-child(11) td').innerHTML;
  const productFeature1 = tableBody.querySelector('tr:nth-child(12) td').innerHTML;
  const productFeature1Option1 = tableBody.querySelector('tr:nth-child(13) td').innerHTML;
  const productFeature1Option2 = tableBody.querySelector('tr:nth-child(14) td').innerHTML;
  const productFeature2 = tableBody.querySelector('tr:nth-child(15) td').innerHTML;
  const productFeature2Option1 = tableBody.querySelector('tr:nth-child(16) td').innerHTML;
  const productFeature2Option2 = tableBody.querySelector('tr:nth-child(17) td').innerHTML;
  const productFeature3 = tableBody.querySelector('tr:nth-child(18) td').innerHTML;
  const productFeature3Option1 = tableBody.querySelector('tr:nth-child(19) td').innerHTML;
  const productFeature3Option2 = tableBody.querySelector('tr:nth-child(20) td').innerHTML;

  proRataHeader.innerHTML = `
    <div>
      <div class="emptySpace"></div>
      <div class="currentPlan"><span>${currentPlan}</span></div>
      <div class="bestValue"><span>${bestValuePlan}</span></div>
    </div>
    <div>
      <div class="prorataTitle">${heading}${headingSubtitle}</div>
      <div class="prorata-table-column">
        <h4>${firstProduct}</h4>
      </div>
      <div class="prorata-table-column">
        <h4>${secondProduct}</h4>
        <div class="prorataDevices">${secondProductDevices}</div>
        <div class="prorataPrice"></div>
        <div class="prorataFree">${secondProductFree}</div>
        <div class="prorataInfo">${secondProductInfo}</div>
      </div>
    </div>
    <div>
      <div class="emptySpace"></div>
      <div class="prorata-table-column"><span class="currentPlanButton">${firstProductButton}</span></div>
      <div class="prorata-table-column"><a href="#" class="renewButton">${secondProductButton}</a></div>
    </div>
    <div class="featureRow">
      <div class="prorataFeature"><div>${productFeature1}</div></div>
      <div class="prorata-table-column">${productFeature1Option1}</div>
      <div class="prorata-table-column">${productFeature1Option2}</div>
    </div>
    <div class="featureRow">
      <div class="prorataFeature"><div>${productFeature2}</div></div>
      <div class="prorata-table-column">${productFeature2Option1}</div>
      <div class="prorata-table-column">${productFeature2Option2}</div>
    </div>
    <div class="featureRow">
      <div class="prorataFeature"><div>${productFeature3}</div></div>
      <div class="prorata-table-column">${productFeature3Option1}</div>
      <div class="prorata-table-column">${productFeature3Option2}</div>
    </div>
    `;

  table.parentNode.replaceChild(proRataHeader, table);

  const prorataPrice = parentSelector.querySelector('.prorataPrice');
  const renewPrice = parentSelector.querySelector('.prorataInfo strong');
  console.log(renewPrice);
  if (currency === 'USD') {
    prorataPrice.innerHTML = `${price} ${currency}`;
    renewPrice.innerHTML = `${price} ${currency}`;
  } else {
    prorataPrice.innerHTML = `${currency} ${price}`;
    renewPrice.innerHTML = `${currency} ${price}`;
  }

  const buybutton = parentSelector.querySelector('.renewButton');
  buybutton.href = `https://store.bitdefender.com/order/upgrade.php?LICENSE=${license}&UPGRADEPROD=${upgradeprod}&UPGRADEOPT=${upgradeopt}&ORDERSTYLE=nLWw45SpnHI=&LANG=${lang}&CURRENCY=${currency}&DCURRENCY=${currency}&SRC=${src}`;
}
