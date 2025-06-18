import {
  sendAnalyticsPageLoadedEvent,
} from '../../scripts/adobeDataLayer.js';
import pagePromise from '../../scripts/page.js';

import {
  GLOBAL_EVENTS,
} from '../../scripts/utils.js';

const page = await pagePromise;

// check eligibility
const checkEligibility = async (block, optionCode, neeligibilText) => {
  try {
    const serviceId = page.getParamValue('service_id');
    const upgradeBundle = page.getParamValue('upgrade_bundle');
    const productCode = page.getParamValue('product_code');
    const paramOptionCode = page.getParamValue('option_code');
    let updatedOptionCode = optionCode;
    if (paramOptionCode) {
      updatedOptionCode = paramOptionCode;
    }
    const url = `https://www.bitdefender.com/site/Main/proRata?service_id=${serviceId}&option_code=${updatedOptionCode}&product_code=${productCode}&upgrade_bundle=${upgradeBundle}`;
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await fetch(url, options);
    if (!response.ok) {
      console.error('Response Status:', response.status);
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    // if eligible - redirect
    if (data.eligible && data.url) {
      setTimeout(() => {
        window.location.href = data.url;
      }, 2000);
    } else {
      // if not eligible - display message
      block.innerHTML = `
        <div class="container">
          <div class="row">
            <div class="text-center">
              ${neeligibilText.innerHTML}
            </div>
          </div>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error during fetch:', error);
  }
};

export default function decorate(block) {
  if (window.ADOBE_MC_EVENT_LOADED) {
    sendAnalyticsPageLoadedEvent(true);
  } else {
    document.addEventListener(GLOBAL_EVENTS.ADOBE_MC_LOADED, () => {
      sendAnalyticsPageLoadedEvent(true);
    });
  }

  const { optionCode } = block.closest('.section').dataset;
  const [eligibil, neeligibil] = [...block.children];

  if (!optionCode) {
    block.innerHTML = 'option_code must be set';
    return;
  }

  // service_id must be set
  if (!page.getParamValue('service_id')) {
    block.innerHTML = `
      <div class="container">
        <div class="row">
          <div class="text-center">
            ${neeligibil.innerHTML}
          </div>
        </div>
      </div>
    `;
  } else {
    block.innerHTML = `
      <div class="container">
        <div class="row">
          <div class="text-center">
            <div id="loading">
              ${eligibil.innerHTML}
              <div id="loading-container">
                <div id="loading-bar"></div>
              </div>
            </div>

            <div id="noteligible">
              ${neeligibil.innerHTML}
            </div>
          </div>
        </div>
      </div>
    `;

    checkEligibility(block, optionCode, neeligibil);
  }
}
