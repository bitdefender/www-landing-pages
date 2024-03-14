import {
  sendAnalyticsPageLoadedEvent,
} from '../../scripts/adobeDataLayer.js';

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

  const getParameterValue = (parameterName) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(parameterName);
  };

  // check eligibility
  async function checkEligibility() {
    try {
      const serviceId = getParameterValue('service_id');
      const url = `https://www.bitdefender.com/site/Main/proRata?service_id=${serviceId}&option_code=${optionCode}`;
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
        window.location.href = data.url;
      } else {
        // if not eligible - display message
        block.innerHTML = `
          <div class="container">
            <div class="row">
              <div class="text-center">
                ${neeligibil.innerHTML}
              </div>
            </div>
          </div>
        `;
      }
    } catch (error) {
      console.error('Error during fetch:', error);
    }
  }

  // service_id must be set
  if (!getParameterValue('service_id')) {
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

    checkEligibility();
  }
}
