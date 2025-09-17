/*
  Information:
  - the tab is open by default
  - [add-on] - will be treated as green tag

  Parameters:
  - (closed) : for tab to be closed by default
*/

export default function decorate(block) {
  const parentSelector = block.closest('.section');
  const {
    type,
    loader,
    topBackgroundColor,
    topTextColor,
  } = parentSelector.dataset;

  // search for [] to replace with span greeenTag class
  const getFirstDivs = block.querySelectorAll('.b-dropdownbox-container .block > div > div:nth-child(1)');
  getFirstDivs.forEach((item) => {
    item.innerHTML = item.innerHTML.replace('[', '<span class="greenTag">');
    item.innerHTML = item.innerHTML.replace(']', '</span>');
  });

  // make slideUp slideDown functionality
  if (type !== 'inactive') {
    const getFirstTabs = block.querySelectorAll('.b-dropdownbox-container .block > div:first-child');
    getFirstTabs.forEach((tab) => {
      tab.parentNode.classList.remove('inactive');
      tab.parentNode.addEventListener('click', () => {
        tab.parentNode.classList.toggle('inactive');
      });
    });
  }

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

  // if it's slider
  if (type === 'slider') {
    block.closest('.b-dropdownbox-container').classList.add('container', 'dropdownSlider', loader && 'no-loader');
    const sliderBox = document.createElement('div');
    sliderBox.className = 'slider_box';

    const infoTextEl = block.children[0].children[0];
    const infoTextEl2 = block.children[1].children[0];
    sliderBox.innerHTML = `
      <div class="container">
        <div class="row">
          <div class="col-12 col-md-5 title">
            ${!loader ? '<div class="loading-bar"></div>' : ''}
            ${infoTextEl.innerHTML}
          </div>
          <div class="col-12 col-md-7 description">${infoTextEl2.innerHTML}</div>
        </div>
      </div>
    `;

    block.closest('.b-dropdownbox-container').appendChild(sliderBox);
  }

  if (type === 'slider') {
    // Get all images from all slider boxes
    const pictures = parentSelector.querySelectorAll('.slider_box img');

    if (!pictures.length) return;

    const heights = Array.from(pictures)
      .map((img) => parseInt(img.getAttribute('height'), 10))
      .filter((h) => !Number.isNaN(h));

    if (!heights.length) return;

    // Check if all the images already have the same height
    const uniqueHeights = [...new Set(heights)];
    if (uniqueHeights.length === 1) {
      return;
    }

    const minHeight = Math.min(...heights);

    pictures.forEach((img) => {
      img.style.minHeight = `${minHeight}px`;
      img.style.maxHeight = `${minHeight}px`;
      img.style.objectFit = 'contain';
      img.style.height = 'auto';
    });
  }

  if (parentSelector.classList.contains('closed')) {
    block.classList.add('inactive');
  }

  if (parentSelector.classList.contains('inactive')) block.classList.add('inactive');
}
