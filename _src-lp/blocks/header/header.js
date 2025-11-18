import { getMetadata, decorateIcons2, decorateButtons } from '../../scripts/lib-franklin.js';
import {
  adobeMcAppendVisitorId, getLocalizedResourceUrl, getDefaultBaseUrl, getDefaultSection, getLocale,
} from '../../scripts/utils.js';
import { getDefaultLanguage } from '../../scripts/target.js';

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

function createButton(element) {
  const elementCopy = element.cloneNode(true);
  const p = document.createElement('p');
  p.className = 'button-container';
  p.appendChild(elementCopy);
  return p;
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // header logo should be svg
  // fetch nav content
  const navMeta = getMetadata('nav');
  const linklessNav = getMetadata('linkless-nav');
  const navPath = navMeta ? new URL(navMeta).pathname : getLocalizedResourceUrl('nav');
  const resp = await fetch(`${navPath}.plain.html`);

  if (resp.ok) {
    const html = await resp.text();
    const spanSvg = [...await extractSpanSvgs(html)];
    // DEX-20933 - if section is business should redirect to the bd business
    let homeUrl = getDefaultBaseUrl();
    const locale = getLocale(getDefaultLanguage());
    homeUrl += locale;
    if (getDefaultSection() === 'business') {
      homeUrl += '/business';
    }

    const headerWrapper = block.closest('header');

    checkForRevolut(spanSvg, block);

    block.classList.add('lp-header', 'py-3');
    if (html.indexOf('bigger-logo') !== -1) {
      headerWrapper.classList.add('biggerLogo');
    }
    console.log("html.indexOf('custom_nav') ", html.indexOf('custom_nav'), html);
    console.log(block)
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

      if (html.indexOf('employee-benefits') !== -1) {
        headerWrapper.classList.add('employee-benefits');
      }

      block.innerHTML = html;
      const logoEl = block.querySelector('p');
      const imgEl = block.querySelectorAll('img');
      let anchorEl = `<a title="Bitdefender" href="${linklessNav ? '#' : homeUrl}">${imgEl[0].cloneNode(true).outerHTML}</a>`;

      if (html.indexOf('no-link') !== -1) {
        headerWrapper.classList.add('no-link');
        anchorEl = imgEl[0].cloneNode(true).outerHTML;
      }

      // clear first paragraf
      logoEl.innerHTML = '';
      // add the new content logo with anchor
      logoEl.innerHTML = anchorEl;

      block.querySelector('.section-metadata').remove();
    } else if (html.indexOf('custom_nav') !== -1 || html.indexOf('custom_nav_white') !== -1) {
      headerWrapper.classList.add('customNav');
      if (html.indexOf('transparent_bck') !== -1) headerWrapper.classList.add('transparent_bck');
      if (html.indexOf('custom_nav') !== -1) headerWrapper.classList.add('dark1');
      if (html.indexOf('custom_nav_white') !== -1) headerWrapper.classList.add('white');
      if (html.indexOf('custom_nav_blue') !== -1) headerWrapper.classList.add('blue');
      if (html.indexOf('they-wear-our-faces') !== -1) {
        headerWrapper.classList.add('they-wear-our-faces');
        block.innerHTML = html;
        let logo = block.querySelector('img').getAttribute('src');
        const headerDiv = block.querySelector('p');
        headerDiv.className = 'd-flex justify-content-between';

        const anchorEl = document.createElement('a');
        anchorEl.href = linklessNav ? '#' : homeUrl;
        anchorEl.innerHTML = `<img src="${logo}" alt="Bitdefender">`;

        const link = block.querySelector('a');
        link.outerHTML = createButton(link).outerHTML;
        decorateButtons(block);
        logo = anchorEl;
        block.querySelector('.section-metadata').remove();
        return;
      }
      block.innerHTML = html;

      const logo = block.querySelector('img').getAttribute('src');
      const logoEl = block.querySelector('p');
      const anchorEl = document.createElement('a');
      anchorEl.className = 'd-flex justify-content-between';
      anchorEl.href = linklessNav ? '#' : homeUrl;
      anchorEl.innerHTML = `<img src="${logo}" alt="Bitdefender">`;
      logoEl.outerHTML = anchorEl.outerHTML;

      block.querySelector('.section-metadata').remove();
    } else {
      headerWrapper.classList.add('dark2');
      block.innerHTML = `
      <a class="d-flex justify-content-between" href="${linklessNav ? '#' : homeUrl}">
        ${spanSvg.map((svg) => `
            ${svg.outerHTML}
        `).join('')}
      </a>`;
    }

    adobeMcAppendVisitorId('header');
  }
}
