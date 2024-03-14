/*
 * Fragment Block
 * Include content from one Helix page in another.
 * https://www.hlx.live/developer/block-collection/fragment
 */

import {
  decorateMain,
} from '../../scripts/scripts.js';

import {
  loadCSS,
} from '../../scripts/lib-franklin.js';

/**
   * Loads a fragment.
   * @param {string} path The path to the fragment
   * @returns {HTMLElement} The root element of the fragment
   */
async function loadFragment(path) {
  const resp = await fetch(`${path}.plain.html`);
  if (resp.ok) {
    const url = new URL(path);
    const baseUrl = `${url.protocol}//${url.hostname}`;
    const codeBaseUrl = `${baseUrl}/_src`; // specific to www-websites

    resp.text()
      .querySelectorAll('source')
      // eslint-disable-next-line no-return-assign
      .forEach((source) => source.srcset = new URL(source.getAttribute('srcset'), origin).href);

    resp.text()
      .querySelectorAll('img')
      // eslint-disable-next-line no-return-assign
      .forEach((image) => image.src = new URL(image.getAttribute('src'), origin).href);

    const main = document.createElement('main');
    main.innerHTML = await resp.text();
    decorateMain(main);

    const blocks = main.querySelectorAll('div.block');
    for (let i = 0; i < blocks.length; i += 1) {
      const block = blocks[i];
      const status = block.dataset.blockStatus;
      if (status !== 'loading' && status !== 'loaded') {
        block.dataset.blockStatus = 'loading';
        const { blockName } = block.dataset;
        try {
          const cssLoaded = new Promise((resolve) => {
            loadCSS(`${codeBaseUrl}/blocks/${blockName}/${blockName}.css`, resolve);
          });
          const decorationComplete = new Promise((resolve) => {
            (async () => {
              try {
                const mod = await import(`${codeBaseUrl}/blocks/${blockName}/${blockName}.js`);
                if (mod.default) {
                  await mod.default(block);
                }
              } catch (error) {
                // eslint-disable-next-line no-console
                console.log(`failed to load module for ${blockName}`, error);
              }
              resolve();
            })();
          });
          // eslint-disable-next-line no-await-in-loop
          await Promise.all([cssLoaded, decorationComplete]);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(`failed to load block ${blockName}`, error);
        }
        block.dataset.blockStatus = 'loaded';
      }
    }

    const sections = [...main.querySelectorAll(':scope > div.section')];
    for (let j = 0; j < sections.length; j += 1) {
      const section = sections[j];
      const status = section.dataset.sectionStatus;
      if (status !== 'loaded') {
        const loadingBlock = section.querySelector('.block[data-block-status="initialized"], .block[data-block-status="loading"]');
        if (loadingBlock) {
          section.dataset.sectionStatus = 'loading';
          break;
        } else {
          section.dataset.sectionStatus = 'loaded';
          section.style.display = null;
        }
      }
    }

    return main;
  }

  return null;
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const fragment = await loadFragment(path);
  if (fragment) {
    const fragmentSection = fragment.querySelector(':scope .section');
    if (fragmentSection) {
      block.closest('.section').classList.add(...fragmentSection.classList);
      block.closest('.fragment-ext-wrapper').replaceWith(...fragmentSection.childNodes);
    }
  }
}
