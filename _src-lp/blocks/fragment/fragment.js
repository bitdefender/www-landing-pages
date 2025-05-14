/*
 * Fragment Block
 * Include content from one Helix page in another.
 * https://www.aem.live/developer/block-collection/fragment
 */

import {
  decorateMain,
} from '../../scripts/scripts.js';

import {
  loadSections,
} from '../../scripts/lib-franklin.js';
import { getDefaultLanguage } from '../../scripts/utils.js';

/**
   * Loads a fragment.
   * @param {string} path The path to the fragment
   * @returns {HTMLElement} The root element of the fragment
   */
async function loadFragment(path) {
  const language = getDefaultLanguage();
  if (path && path.startsWith('/')) {
    /**
     * this makes fragments work on the www.bitdefender.com domain
     * once we move everything to www, we sghould remove this
     */
    const loc = window.location;
    if (loc.hostname === 'www.bitdefender.com' && !path.startsWith('/pages')) {
      // eslint-disable-next-line no-param-reassign
      path = `/pages${path}`;
    }

    try {
      // eslint-disable-next-line no-param-reassign
      path = path.replace(/lang/g, language);
    } catch (error) {
      console.log(error);
    }
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = await resp.text();
      decorateMain(main);
      await loadSections(main);
      return main;
    }
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
      block.closest('.fragment-wrapper').replaceWith(...fragmentSection.childNodes);
    }
  }
}
