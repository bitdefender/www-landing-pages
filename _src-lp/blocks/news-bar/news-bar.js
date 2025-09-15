export default function decorate(block) {
  const parentBlock = block.closest('.section');
  const parentBlockStyle = parentBlock.style;
  const blockStyle = block.style;
  const metaData = parentBlock.dataset;
  const [, backgroundEl] = block.children;
  const {
    type, backgroundColor, textColor,
  } = metaData;

  // set the background
  if (backgroundEl) {
    const backgroundImgEl = backgroundEl.querySelector('img');
    const backgroundImgSrc = backgroundImgEl?.getAttribute('src');

    if (backgroundImgSrc) {
      parentBlockStyle.backgroundImage = `url("${backgroundImgSrc}")`;
      // Remove the row after setting background
      backgroundEl.remove();
    }
  }

  if (type && type === 'ribbon') {
    parentBlock.classList.add('topRibbon');
    parentBlockStyle.backgroundColor = backgroundColor || 'black';
    blockStyle.color = textColor || 'white';
  } else if (type && type === 'ribbon-carousel') {
    parentBlock.classList.add('ribbonCarousel');
    parentBlockStyle.backgroundColor = backgroundColor || 'black';
    blockStyle.color = textColor || 'white';

    const ribbon = block.querySelector('ul');
    if (!ribbon) return;

    const SPEED = 60;
    const items = [...ribbon.children];
    if (!items.length) return;

    // width - one full set (items + gaps)
    const gap = parseFloat(getComputedStyle(ribbon).gap) || 0;
    const setWidth = items.reduce((w, li, idx) => w + li.offsetWidth + (idx ? gap : 0), 0);

    // clone
    const frag = document.createDocumentFragment();
    items.forEach((n) => frag.appendChild(n.cloneNode(true)));
    ribbon.appendChild(frag);

    // set the distance and duration
    ribbon.style.setProperty('--loop', `${setWidth}px`);
    ribbon.style.setProperty('--dur', `${setWidth / SPEED}s`);
  } else {
    setTimeout(() => {
      const elementLink = block.querySelector('a');
      parentBlockStyle.backgroundColor = '#E4F2FF';
      blockStyle.color = '#006EFF';
      if (elementLink) elementLink.style.color = '#006EFF';
    }, 2000);
  }
}
