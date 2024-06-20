/* eslint-disable no-template-curly-in-string */
import { loadCSS } from '../../scripts/lib-franklin.js';
import { addScript, GLOBAL_EVENTS } from '../../scripts/utils.js';

export default function decorate(block) {
  // get data attributes set in metaData
  const parentSelector = block.closest('.section');
  const metaData = parentSelector.dataset;

  // config new elements
  const {
    textColor, backgroundColor, paddingTop, paddingBottom, marginTop,
    marginBottom, counterSwitchOn, counterHeadings, counterTheme,
  } = metaData;

  const [contentEl, pictureBF, pictureCM] = [...block.children];

  if (counterSwitchOn) {
    // adding neccessary scripts: js, css
    loadCSS('https://cdn.jsdelivr.net/npm/flipdown@0.3.2/dist/flipdown.min.css');
    addScript('https://cdn.jsdelivr.net/npm/flipdown@0.3.2/src/flipdown.min.js', {}, 'defer', () => {
      document.dispatchEvent(new Event(GLOBAL_EVENTS.COUNTER_LOADED));
    });

    // config
    const flipClockConfig = {
      theme: counterTheme || 'dark',
      switchOn: new Date(counterSwitchOn).getTime() / 1000,
      headings: counterHeadings ? counterHeadings.split(',') : '',
    };

    // additional classes for each image
    const bannerImageBf = pictureBF.querySelector('picture');
    bannerImageBf.classList.add('pictureBF', 'banner-image', 'flipClock-image');

    if (pictureCM) {
      const bannerImageCM = pictureCM.querySelector('picture');
      bannerImageCM.classList.add('pictureCM', 'banner-image', 'flipClock-image');
      bannerImageCM.style.display = 'none';
    }

    let onePicture = false;
    if (pictureBF && !pictureCM) {
      parentSelector.style.background = `url(${pictureBF.querySelector('img').getAttribute('src').split('?')[0]}) no-repeat right top / auto 100% ${backgroundColor || '#000'}`;
      onePicture = true;
    }


    block.innerHTML = `
      <div class="container-fluid">
        <div class="row d-xs-block d-sm-flex d-md-flex d-lg-flex position-relative">
          <div class="col-12 d-block d-sm-none d-md-none d-lg-none p-0 text-center bck-img">
            ${!onePicture ? pictureBF.innerHTML : ''}
            ${!onePicture ? pictureCM.innerHTML : ''}
          </div>

          <div class="col-xs-12 col-sm-6 col-md-6 col-lg-6 ps-4 counter-text">${contentEl.innerHTML}</div>

          <div class="col-6 d-none d-sm-block d-md-block d-lg-block img-right bck-img">
            ${!onePicture ? pictureBF.innerHTML : ''}
            ${!onePicture ? pictureCM.innerHTML : ''}
          </div>
        </div>
      </div>`;

    // replacing [count]
    block.innerHTML = block.innerHTML.replace('[counter]', `
      <div style="display: none" id="flipdown" class="flipdown"></div>
    `);

    const blockFlopDown = block.querySelector('#flipdown');
    if (blockFlopDown && blockFlopDown.closest('table')) {
      blockFlopDown.closest('table').id = 'flipdownTable';
      if (counterTheme) {
        blockFlopDown.closest('table').classList.add(counterTheme);
      }
    }

    const counterSwitchOnUpdated = new Date(counterSwitchOn).getTime() / 1000;
    const newTime = Number(counterSwitchOnUpdated) + 48 * 60 * 60;
    const currentTime = Math.floor(Date.now() / 1000);

    if (newTime > currentTime) {
      blockFlopDown.style.display = 'block';
      document.addEventListener(GLOBAL_EVENTS.COUNTER_LOADED, () => {
        // eslint-disable-next-line no-undef
        const firstCounter = new FlipDown(Number(counterSwitchOnUpdated), flipClockConfig);
        if (!firstCounter.countdownEnded) {
          block.querySelectorAll('.pictureBF').forEach((elem) => { elem.style.display = 'block'; });
          block.querySelectorAll('.pictureCM').forEach((elem) => { elem.style.display = 'none'; });
        }

        firstCounter.start().ifEnded(() => {
          // The initial counter(Black Friday) has ended; start a new one + 48 hours from now - CyberMOnday
          // switch images:
          blockFlopDown.innerHTML = '';
          block.querySelectorAll('.pictureBF').forEach((elem) => { elem.style.display = 'none'; });
          block.querySelectorAll('.pictureCM').forEach((elem) => { elem.style.display = 'block'; });

          // eslint-disable-next-line no-undef
          const secondCounter = new FlipDown(newTime, flipClockConfig);
          secondCounter.start();
        });
      });
    }

    // update background color if set, if not set default: #000
    console.log('backgroundColor ', backgroundColor)
    if (backgroundColor) {
      parentSelector.style.backgroundColor = backgroundColor;
    }

    if (textColor) {
      block.style.color = textColor;
      block.children[2].style.color = textColor;
    }

    if (paddingTop) block.style.paddingTop = `${paddingTop}rem`;
    if (paddingBottom) block.style.paddingBottom = `${paddingBottom}rem`;
    if (marginTop) block.style.marginTop = `${marginTop}rem`;
    if (marginBottom) block.style.marginBottom = `${marginBottom}rem`;
  } else {
    block.innerHTML = 'Provide a valid counter Section Metadata';
  }
}
