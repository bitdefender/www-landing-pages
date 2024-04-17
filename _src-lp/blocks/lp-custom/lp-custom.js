export default function decorate(block) {
  // get data attributes set in metaData
  const parentSelector = block.closest('.section');
  const metaData = parentSelector.dataset;

  // config new elements
  const {
    textColor, backgroundColor, headerTextColor,
  } = metaData;

  // move picture below
  const bannerImage = block.children[1].querySelector('picture');
  bannerImage.classList.add('custom-image');
  // parentSelector.append(bannerImage);

  // update background color if set, if not set default: #000
  const block1 = document.querySelector('.lp-custom-container');
  if (backgroundColor) {
    block1.style.backgroundColor = backgroundColor;
  } else {
    block1.style.backgroundColor = '#000';
  }

  if (textColor) {
    block.style.color = textColor;
    block.children[2].style.color = textColor;
  }

  if (headerTextColor) {
    block.querySelector('h1').style.color = headerTextColor;
  }
}
