/*
  Information:
  - the tab is open by default
  - [add-on] - will be treated as green tag

  Parameters:
  - (closed) : for tab to be closed by default
*/

export default function decorate(block) {
  const parentSelector = block.closest('.section');
  const metaData = parentSelector.dataset;
  const type = metaData.type;

  // search for [] to replace with span greeenTag class
  const getFirstDivs = block.querySelectorAll('.b-dropdownbox-container .block > div > div:nth-child(1)');
  getFirstDivs.forEach((item) => {
    item.innerHTML = item.innerHTML.replace('[', '<span class="greenTag">');
    item.innerHTML = item.innerHTML.replace(']', '</span>');
  });

  // make slideUp slideDown functionality
  const getFirstTabs = block.querySelectorAll('.b-dropdownbox-container .block > div:first-child');
  getFirstTabs.forEach((tab) => {
    tab.parentNode.classList.remove('inactive');
    tab.addEventListener('click', () => {
      tab.parentNode.classList.toggle('inactive');
    });
  });

  if (block.children.length >= 2) {
    const childrenNr = block.children[1].children.length;
    block.classList.add(`has${childrenNr}divs`);
  }

  if (type === 'slider') {
    parentSelector.classList.remove('slider-box');
    /* parentSelector.classList.add('slider');
    if (window.innerWidth > 800) {
      const infoTextEl = block.children[0].children[0];
      const infoTextEl2 = block.children[1].children[0];

      parentSelector.classList.remove('slider');
      parentSelector.classList.add('container', 'dropdownSlider');
      block.closest('.b-dropdownbox-wrapper').innerHTML = `
        <div class="container">
          <div class="row">
            <div class="col-12 col-md-5 title">
              <div class="loading-bar"></div>
              ${infoTextEl.innerHTML}
            </div>
            <div class="col-12 col-md-7 description">${infoTextEl2.innerHTML}</div>
          </div>
        </div>
      `;
    }*/
    

    function handleResize() {
      console.log(window.innerWidth)
      if (window.innerWidth > 800) {
        const infoTextEl = block.children[0].children[0];
        const infoTextEl2 = block.children[1].children[0];
  
        parentSelector.classList.remove('slider');
        parentSelector.classList.add('container', 'dropdownSlider');
        const dropdownWrapper = block.closest('.b-dropdownbox-wrapper');
        if (dropdownWrapper) {
          dropdownWrapper.innerHTML = `
            <div class="container">
              <div class="row">
                <div class="col-12 col-md-5 title">
                  <div class="loading-bar"></div>
                  ${infoTextEl.innerHTML}
                </div>
                <div class="col-12 col-md-7 description">${infoTextEl2.innerHTML}</div>
              </div>
            </div>
          `;
        }
      } else {
        parentSelector.classList.remove('container', 'dropdownSlider');
      }
    }
    
    // Attach the event listener to the window's resize event.
    window.addEventListener('resize', handleResize);
    
    // Initial call to handleResize to set the initial state.
    handleResize();

  }
}

