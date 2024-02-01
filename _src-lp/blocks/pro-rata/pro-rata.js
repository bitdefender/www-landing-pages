export default function decorate(block) {
  const [eligibil, neeligibil] = [...block.children];

  const getParameterValue = (parameterName) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(parameterName);
  }

  async function checkEligibility() {
    try {
      const serviceId = getParameterValue('service_id');
      const url = `https://ltiseanu.bitdefender.com/site/Main/proRata?service_id=${serviceId}`;

      const options = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      console.log('Request URL:', url);
      console.log('Request Options:', options);

      const response = await fetch(url, options);

      if (!response.ok) {
        console.error('Response Status:', response.status);
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Data received:', data);
    } catch (error) {
      console.error('Error during fetch:', error);
    }
  }

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

    const loadingBar = block.querySelector("#loading-bar");

    setTimeout(() => {
      loadingBar.style.width = "30%";
    }, 2000);
    setTimeout(() => {
      loadingBar.style.width = "50%";
    }, 4000);
    setTimeout(() => {
      loadingBar.style.width = "70%";
    }, 6000);

    checkEligibility()
  }
}
