/* eslint-disable no-template-curly-in-string */

export default function decorate(block) {
  // get data attributes set in metaData
  const parentSelector = block.closest('.section');
  const metaData = parentSelector.dataset;

  // config new elements
  const {
    textColor, backgroundColor, counterSwitchOn, counterHeadings, counterTheme,
  } = metaData;

  // move picture below
  const bannerImage = block.children[1].querySelector('picture');
  bannerImage.classList.add('banner-image');
  parentSelector.append(bannerImage);

  if (counterSwitchOn) {
    bannerImage.id = 'blackFriday';
    bannerImage.classList.add('flipClock-image');

    // adding neccessary scripts:
    // js
    const flipClockJs = document.createElement('script');
    flipClockJs.src = 'https://cdn.jsdelivr.net/npm/flipdown@0.3.2/src/flipdown.min.js';
    document.head.appendChild(flipClockJs);

    // css
    const flipClockCss = document.createElement('link');
    flipClockCss.rel = 'stylesheet';
    flipClockCss.type = 'text/css';
    flipClockCss.href = 'https://cdn.jsdelivr.net/npm/flipdown@0.3.2/dist/flipdown.min.css';
    document.head.appendChild(flipClockCss);

    const flipClockConfig = {
      dataTheme: counterTheme || 'dark',
      dataSwitchOn: new Date(counterSwitchOn).getTime() / 1000,
      dataHeadings: counterHeadings ? `data-headings="${counterHeadings}"` : '',
    };

    block.innerHTML = block.innerHTML.replace('[counter]', `
      <div id="flipdown" class="flipdown" data-theme=${flipClockConfig.dataTheme} data-switchOn=${flipClockConfig.dataSwitchOn} data-headings=${flipClockConfig.dataHeadings}></div>
    `);

    if (block.children.length === 3) {
      const bannerImage2 = block.children[2].querySelector('picture');
      bannerImage2.classList.add('banner-image', 'flipClock-image');
      bannerImage2.style.display = 'none';
      bannerImage2.id = 'cyberMonday';
      parentSelector.append(bannerImage2);
    }
  }

  // update background color if set, if not set default: #000
  if (backgroundColor) {
    parentSelector.style.backgroundColor = backgroundColor;
  }

  if (textColor) {
    block.style.color = textColor;
    block.children[2].style.color = textColor;
  }

}
