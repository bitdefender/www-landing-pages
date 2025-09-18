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

    const SPEED = 1;
    let offset = 0;
    const gap = parseFloat(getComputedStyle(ribbon).gap) || 0;
    const tick = () => {
      offset -= SPEED;

      const first = ribbon.firstElementChild;
      if (first) {
        const containerLeft = ribbon.parentElement.getBoundingClientRect().left;
        const firstBox = first.getBoundingClientRect();

        if (firstBox.right <= containerLeft) {
          offset += first.offsetWidth + gap;
          ribbon.appendChild(first);
          ribbon.style.transform = `translateX(${offset}px)`;
          parentBlock.style.visibility = 'visible';
        } else {
          ribbon.style.transform = `translateX(${offset}px)`;
          parentBlock.style.visibility = 'visible';
        }
      }

      requestAnimationFrame(tick);
    }

    tick();

    parentBlockStyle.setProperty('--reveal-delay', '1s');
  } else {
    setTimeout(() => {
      const elementLink = block.querySelector('a');
      parentBlockStyle.backgroundColor = '#E4F2FF';
      blockStyle.color = '#006EFF';
      if (elementLink) elementLink.style.color = '#006EFF';
    }, 2000);
  }
}
