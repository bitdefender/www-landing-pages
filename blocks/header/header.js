import { getMetadata, decorateIcons2 } from '../../scripts/lib-franklin.js';
import {
  adobeMcAppendVisitorId, getLocalizedResourceUrl, getDefaultBaseUrl,
} from '../../scripts/utils.js';

/**
 * extracts the span svg's from the nav html
 * @param {string} html The nav html
 * @returns {Promise<HTMLElement[]>} The span svg elements
 */
async function extractSpanSvgs(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  await decorateIcons2(div);
  return div.querySelectorAll('span.icon');
}

/**
 * checks if the header is the revolut header
 * @param {HTMLElement[]} spanSvgs The span svg elements
 * @param {Element} block The header block element
 * @returns {void}
 */
function checkForRevolut(spanSvgs, block) {
  if (spanSvgs.length === 2 && spanSvgs[1].classList.contains('icon-revolut')) {
    spanSvgs.map((svg) => svg.classList.add('reverse-filter'));
    block.closest('.header-wrapper').classList.add('rev-header');
  }
}

function checkForFerrari(block) {
  if (window.location.href.contains('scuderiaferrari')) {
    block.closest('.header-wrapper').classList.add('ferrari-header');
  }
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // header logo should be svg
  // fetch nav content
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta).pathname : getLocalizedResourceUrl('nav');
  const resp = await fetch(`${navPath}.plain.html`);

  if (resp.ok) {
    const html = await resp.text();

    const spanSvg = [...await extractSpanSvgs(html)];

    checkForRevolut(spanSvg, block);

    checkForFerrari(block); 

    const homeUrl = getDefaultBaseUrl();

    block.classList.add('lp-header', 'py-3');
    block.innerHTML = `
      <a class="d-flex justify-content-between" href="${homeUrl}">
        ${spanSvg.map((svg) => `
            ${svg.outerHTML}
        `).join('')}
      </a>`;

    adobeMcAppendVisitorId('header');
  }
}
