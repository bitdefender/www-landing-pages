export default function decorate(block) {
  const parentBlock = block.closest('.section');
  const parentBlockStyle = parentBlock.style;
  const blockStyle = block.style;
  const metaData = parentBlock.dataset;
  const [, backgroundEl] = block.children;
  const {
    type, backgroundColor, textColor,
  } = metaData;

  // set the back
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
  } else {
    setTimeout(() => {
      const elementLink = block.querySelector('a');
      parentBlockStyle.backgroundColor = '#E4F2FF';
      blockStyle.color = '#006EFF';
      if (elementLink) elementLink.style.color = '#006EFF';
    }, 2000);
  }
}
