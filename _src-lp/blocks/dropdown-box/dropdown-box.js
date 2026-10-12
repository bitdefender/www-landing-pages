/*
  Information:
  - the tab is open by default
  - [add-on] - will be treated as green tag

  Parameters:
  - (closed) : for tab to be closed by default
*/

const AUTO_ROTATE_MS = 4000;
const START_DELAY_MS = 1000;
const LOADING_BAR_STEP_MS = 30;

/**
 * Initializes the slider behaviour ONCE per container.
 * decorate() runs for every block in the section, so this is guarded
 * and rows are looked up on demand (later blocks append more slides).
 */
function initSlider(container) {
  if (container.dataset.sliderInit) return;
  container.dataset.sliderInit = 'true';

  const hasLoadBar = container.classList.contains('has-load-bar');
  let activeIndex = 0;
  let autoTimer = null;
  let startDelayTimer = null;
  let barTimer = null;

  const getRows = () => [...container.querySelectorAll(':scope > .slider-box > .row')];

  function animateLoadingBar(row) {
    clearInterval(barTimer);
    container.querySelectorAll('.loading-bar').forEach((bar) => {
      bar.style.width = '0';
    });

    const bar = row.querySelector('.loading-bar');
    if (!bar) return;

    let width = 0;
    barTimer = setInterval(() => {
      width += 1;
      bar.style.width = `${width}%`;
      if (width >= 100) clearInterval(barTimer);
    }, LOADING_BAR_STEP_MS);
  }

  function setActive(index) {
    const rows = getRows();
    if (!rows.length) return;

    activeIndex = ((index % rows.length) + rows.length) % rows.length;
    rows.forEach((row, i) => row.classList.toggle('active', i === activeIndex));

    const description = rows[activeIndex].querySelector('.description');
    if (description) {
      container.style.minHeight = `${description.offsetHeight + 50}px`;
    }

    if (hasLoadBar) animateLoadingBar(rows[activeIndex]);
  }

  function stopAutomaticMovement() {
    clearTimeout(startDelayTimer);
    clearInterval(autoTimer);
  }

  function startAutomaticMovement() {
    stopAutomaticMovement();
    autoTimer = setInterval(() => setActive(activeIndex + 1), AUTO_ROTATE_MS);
  }

  // initial active item
  setActive(0);

  // only the load-bar variant rotates automatically and is clickable
  if (!hasLoadBar) return;

  startDelayTimer = setTimeout(startAutomaticMovement, START_DELAY_MS);

  // one delegated listener for all titles (present and future)
  container.addEventListener('click', (e) => {
    const title = e.target.closest('.slider-box .title');
    if (!title || !container.contains(title)) return;

    const index = getRows().indexOf(title.closest('.row'));
    if (index === -1) return;

    setActive(index);
    startAutomaticMovement(); // restart the 4s countdown from the click
  });
}

export default function decorate(block) {
  const parentSelector = block.closest('.section');
  const { type, topBackgroundColor, topTextColor } = parentSelector.dataset;

  // search for [] to replace with span greeenTag class
  const getFirstDivs = block.querySelectorAll('.dropdown-box-container .block > div > div:nth-child(1)');
  getFirstDivs.forEach((item) => {
    item.innerHTML = item.innerHTML.replace('[', '<span class="greenTag">');
    item.innerHTML = item.innerHTML.replace(']', '</span>');
  });

  // make slideUp slideDown functionality
  const getFirstTabs = block.querySelectorAll('.dropdown-box-container .block > div:first-child');
  getFirstTabs.forEach((tab) => {
    tab.parentNode.classList.remove('inactive');
    tab.addEventListener('click', () => {
      tab.parentNode.classList.toggle('inactive');
    });
  });

  if (block.children.length >= 2) {
    const childrenNr = block.children[1].children.length;
    block.classList.add(`has${childrenNr}divs`);

    if (topBackgroundColor) {
      block.querySelector('div:nth-child(1) > div > div').style.backgroundColor = topBackgroundColor;
    }

    if (topTextColor) {
      block.querySelector('div:nth-child(1) > div').style.color = topTextColor;
    }
  }

  // slider variants
  if (type === 'slider' || type === 'slider-no-load-bar') {
    const withLoadBar = type === 'slider';
    const container = block.closest('.dropdown-box-container');
    container.classList.add('container', 'dropdown-slider', withLoadBar ? 'has-load-bar' : 'no-load-bar');

    const sliderBox = document.createElement('div');
    sliderBox.className = 'slider-box';

    const infoTextEl = block.children[0].children[0];
    const infoTextEl2 = block.children[1].children[0];
    sliderBox.innerHTML = `
          <div class="row">
            <div class="col-12 col-md-5 title">
              ${withLoadBar ? '<div class="loading-bar"></div>' : ''}
              ${infoTextEl.innerHTML}
            </div>
            <div class="col-12 col-md-7 description">${infoTextEl2.innerHTML}</div>
          </div>
      `;

    container.appendChild(sliderBox);
    initSlider(container);
  }
}
