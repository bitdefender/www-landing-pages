let dataApinDomain = 'https://main--helix-poc--enake.hlx.page';
if (import.meta && import.meta.url) {
  const urlObj = new URL(import.meta.url);
  dataApinDomain = urlObj.origin;
}

/**
 * @param {HTMLDivElement} plainHTMLContainer
 * appends the dataApiDomain to the relative links
 */
const updateLinkSources = (plainHTMLContainer) => {
  const allSources = plainHTMLContainer.querySelectorAll('source');
  allSources.forEach((source) => {
    if (source.srcset.startsWith('./') || source.srcset.startsWith('/')) {
      const srcSet = source.srcset.startsWith('.') ? source.srcset.slice(1) : source.srcset;
      source.srcset = `${dataApinDomain}${srcSet}`;
    }
  });

  const allImages = plainHTMLContainer.querySelectorAll('img');
  allImages.forEach((image) => {
    if (image.src.startsWith('./') || image.src.startsWith('/')) {
      const imgSrc = image.src.startsWith('.') ? image.src.slice(1) : image.src;
      image.src = `${dataApinDomain}${imgSrc}`;
    }
  });
};

/**
 * @param {string} offer
 * @returns {Promise<HTMLDivElement>}
 * load the block HTML
 */
const loadBlock = async (offer) => {
  const plainHTMLContainer = document.createElement('div');

  // make a call to get all the plain HTML
  const plainHTMLResponse = await fetch(offer);
  const plainHTML = await plainHTMLResponse.text();

  // fill the div node with HTML
  plainHTMLContainer.innerHTML = plainHTML;
  updateLinkSources(plainHTMLContainer);

  return plainHTMLContainer;
};

/**
 * Loads a CSS file.
 * @param {string} href The path to the CSS file
 * @param {Element} shadowDom
 */
const loadCSS = async (href, shadowDom) => {
  if (!shadowDom.querySelector(`head > link[href="${href}"]`)) {
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', href);

    shadowDom.querySelector('head').appendChild(link);
  }
};

/**
 *
 * @param {string} block
 * @param {Element} shadowDom
 * Franklin decorator logic
 */
const decorateBlock = async (block, shadowDom) => {
  const logicModule = await import(/* webpackIgnore: true */`${dataApinDomain}/blocks/${block}/${block}.js`);
  const blockElement = shadowDom.querySelector(`.${block}`);
  logicModule.default(blockElement);

  blockElement.classList.add('block');
  blockElement.dataset.blockName = block;
  blockElement.dataset.blockStatus = 'initialized';
  const blockWrapper = blockElement.parentElement;
  blockWrapper.classList.add(`${block}-wrapper`);
  const section = blockWrapper.parentElement;
  if (section) section.classList.add(`${block}-container`);
};

/**
 *
 * @param {string} offer -> url to the plain html
 * @param {string} block -> the requested block (needed for css and js)
 * @param {string} containerId
 * adds the requested Franklin component in the container specified through its id
 */
export default async function addFranklinComponentToContainer(offer, block, containerId) {
  // create a shadow DOM in the container
  const container = document.querySelector(`#${containerId}`);
  const shadowDom = container.attachShadow({ mode: 'open' });

  // load the Franklin block plain HTML
  const plainHTMLContainer = await loadBlock(offer, block);

  // add head section to the shadowDom and append the received HTML
  shadowDom.appendChild(document.createElement('head'));
  const shadowDomBody = document.createElement('body');
  shadowDomBody.appendChild(plainHTMLContainer);
  shadowDom.appendChild(shadowDomBody);

  // load the block CSS file
  loadCSS(`${dataApinDomain}/blocks/${block}/${block}.css`, shadowDom, plainHTMLContainer);

  // run the Franklin decorator logic for this block
  await decorateBlock(block, shadowDom);
}
