import { getMetadata, decorateIcons2 } from '../../scripts/lib-franklin.js';
import {
  adobeMcAppendVisitorId, getLocalizedResourceUrl, getDefaultBaseUrl, getDefaultSection,
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
    // DEX-20933 - if section is business should redirect to the bd business
    const homeUrl = `${getDefaultBaseUrl()}${getDefaultSection() === 'business' ? 'business' : ''}`;
    const headerWrapper = block.closest('header');

    checkForRevolut(spanSvg, block);

    block.classList.add('lp-header', 'py-3');
    if (window.location.href.indexOf('scuderiaferrari') !== -1) {
      headerWrapper.id = 'headerFerrari';
      headerWrapper.classList.add('headerSpurs', 'dark');
      block.innerHTML = html;

      const lpHeader = block.closest('.lp-header');
      lpHeader.addEventListener('click', () => {
        lpHeader.classList.toggle('active', !lpHeader.classList.contains('active'));
      });

      block.querySelector('.section-metadata').remove();
    } else if (html.indexOf('blue-logo') !== -1) {
      headerWrapper.id = 'headerBlue';
      if (html.indexOf('affiliate') !== -1) {
        headerWrapper.classList.add('affiliate');
      }

      block.innerHTML = html;
      const logoEl = block.querySelector('p');
      const imgEl = block.querySelector('p:first-child img');

      const anchorEl = `<a title="Bitdefender" href="${homeUrl}">${imgEl.cloneNode(true).outerHTML}</a>`;
      // clear first paragraf
      logoEl.innerHTML = '';
      // add the new content logo with anchor
      logoEl.innerHTML = anchorEl;

      block.querySelector('.section-metadata').remove();
    } else if (html.indexOf('custom_nav') !== -1 || html.indexOf('custom_nav_white') !== -1) {
      headerWrapper.classList.add('customNav');
      if (html.indexOf('custom_nav') !== -1) headerWrapper.classList.add('dark');
      if (html.indexOf('custom_nav_white') !== -1) headerWrapper.classList.add('white');
      block.innerHTML = html;

      const logo = block.querySelector('img').getAttribute('src');
      const logoEl = block.querySelector('p');
      const anchorEl = document.createElement('a');
      anchorEl.className = 'd-flex justify-content-between';
      anchorEl.href = homeUrl;
      anchorEl.innerHTML = `<img src="${logo}" alt="Bitdefender">`;
      logoEl.outerHTML = anchorEl.outerHTML;

      block.querySelector('.section-metadata').remove();
    } else {
      headerWrapper.classList.add('dark');
      block.innerHTML = `
      <a class="d-flex justify-content-between" href="${homeUrl}">
        ${spanSvg.map((svg) => `
            ${svg.outerHTML}
        `).join('')}
      </a>`;
    }

    adobeMcAppendVisitorId('header');
  }
}
