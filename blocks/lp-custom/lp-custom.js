function appendIBMplex() {
  const head = document.head || document.getElementsByTagName('head')[0];
  const link1 = document.createElement('link');
  const link2 = document.createElement('link');
  const link3 = document.createElement('link');
  const metaTag = document.createElement('meta');

  link1.rel = 'preconnect';
  link1.href = 'https://fonts.googleapis.com';

  link2.rel = 'preconnect';
  link2.href = 'https://fonts.gstatic.com';
  link2.crossOrigin = '';

  link3.rel = 'stylesheet';
  link3.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;600&display=swap';

  metaTag.name = 'referrer';
  metaTag.content = 'no-referrer-when-downgrade';

  head.appendChild(metaTag);
  head.appendChild(link1);
  head.appendChild(link2);
  head.appendChild(link3);
}

export default function decorate(block) {
  appendIBMplex();

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
  parentSelector.append(bannerImage);

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
