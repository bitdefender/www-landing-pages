import { getMetadata, decorateIcons2 } from '../../scripts/lib-franklin.js';
import {
  getDefaultLanguage, instance, adobeMcAppendVisitorId, GLOBAL_EVENTS,
} from '../../scripts/utils.js';

async function extractSpanSvg(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  await decorateIcons2(div);
  return div.querySelector('span.icon');
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // header logo should be svg
  // fetch nav content
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta).pathname : '/nav';
  const resp = await fetch(`${navPath}.plain.html`);

  if (resp.ok) {
    const html = await resp.text();

    const spanSvg = await extractSpanSvg(html);
    const dynamicLanguage = instance === 'dev' ? 'com' : getDefaultLanguage();
    const homeUrl = `https://www.bitdefender.${dynamicLanguage}/`;

    block.className = 'lp-header py-3';
    block.innerHTML = `
      <div class="container">
        <a class="d-inline-block" href="${homeUrl}">
          ${spanSvg.outerHTML}
        </a>
      </div>`;

    document.addEventListener(GLOBAL_EVENTS.ADOBE_MC_LOADED, () => {
      adobeMcAppendVisitorId('header');
    });
  }
}
