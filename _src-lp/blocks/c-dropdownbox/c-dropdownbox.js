/*
  Information:
  - the tab is open by default
  - <u>IMPROVED</u> - will be treated as green tag
  - <i>NEW</i> - will be treated as red tag

  Parameters:
  - (closed) : for tab to be closed by default
*/

export default function decorate(block) {
  const parentSelector = block.closest('.section');
  const metaData = parentSelector.dataset;

  // search for [] to replace with span greeenTag class
  const getFirstDivs = block.querySelectorAll('.c-dropdownbox-container .block > div > div:nth-child(1)');
  [].forEach.call(getFirstDivs, (item) => {
    item.innerHTML = item.innerHTML.replace('[', '<span class="greenTag">');
    item.innerHTML = item.innerHTML.replace(']', '</span>');
  });

  // make slideUp slideDown functionality
  const getFirstTabs = block.querySelectorAll('.c-dropdownbox-container .block > div:first-child');
  [].forEach.call(getFirstTabs, (tab) => {
    tab.addEventListener('click', () => {
      tab.parentNode.classList.toggle('inactive');
    });
  });

  // add bottom text if is set
  if (typeof metaData.bottomText !== 'undefined') {
    const bottomLine = document.createElement('p');
    bottomLine.innerHTML = metaData.bottomText;
    bottomLine.classList = 'bottom-text';
    block.append(bottomLine);
  }

  // if 3rd div does not exists => has 2 elements
  if (!block.querySelector('.c-dropdownbox-container .block > div > div:nth-child(3)')) {
    block.classList.add('has2divs');
  }
}
