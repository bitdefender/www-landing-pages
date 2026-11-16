/*
 * Fragment Block
 * Include content from one Helix page in another.
 * https://www.aem.live/developer/block-collection/fragment
 */

import {
  decorateMain,
} from '../../scripts/scripts.js';

import {
  loadCSS,
} from '../../scripts/lib-franklin.js';

// one promise per www-websites code base, so several fragment-ext blocks share one fetch
const designTokensLoaded = new Map();

/**
 * www-websites blocks take their sizes (page column, heading scale, spacing) from custom
 * properties declared on `:root, :host` in its global styles.css, which landing pages don't load.
 * Copies only those custom properties (with their media queries) onto the sections that hold
 * external fragments, so the landing page's own styles and tokens stay as they are.
 * @param {string} codeBaseUrl The www-websites code base, e.g. https://www.bitdefender.com/_src
 */
function loadDesignTokens(codeBaseUrl) {
  if (designTokensLoaded.has(codeBaseUrl)) return designTokensLoaded.get(codeBaseUrl);

  const promise = (async () => {
    try {
      const resp = await fetch(`${codeBaseUrl}/styles/styles.css`);
      if (!resp.ok) return;
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(await resp.text());

      const scope = '.fragment-ext-container';
      const isRootSelector = (selectorText) => selectorText
        .split(',')
        .every((selector) => [':root', ':host'].includes(selector.trim()));

      const collect = (rules) => [...rules].flatMap((rule) => {
        if (rule instanceof CSSStyleRule && isRootSelector(rule.selectorText)) {
          const declarations = [...rule.style]
            .filter((property) => property.startsWith('--'))
            .map((property) => `${property}: ${rule.style.getPropertyValue(property)};`);
          return declarations.length ? [`${scope} { ${declarations.join(' ')} }`] : [];
        }
        if (rule instanceof CSSMediaRule || rule instanceof CSSSupportsRule) {
          const inner = collect(rule.cssRules);
          const atRule = rule instanceof CSSMediaRule ? '@media' : '@supports';
          return inner.length ? [`${atRule} ${rule.conditionText} { ${inner.join(' ')} }`] : [];
        }
        return [];
      });

      const style = document.createElement('style');
      style.dataset.source = `${codeBaseUrl}/styles/styles.css`;
      style.textContent = collect(sheet.cssRules).join('\n');
      document.head.append(style);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(`failed to load design tokens from ${codeBaseUrl}`, error);
    }
  })();

  designTokensLoaded.set(codeBaseUrl, promise);
  return promise;
}

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
    const tokensLoaded = loadDesignTokens(codeBaseUrl);

    const main = document.createElement('main');
    main.innerHTML = await resp.text();
    main
      .querySelectorAll('source')
      // eslint-disable-next-line no-return-assign
      .forEach((source) => source.srcset = new URL(source.getAttribute('srcset'), path).href);

    main
      .querySelectorAll('img')
      // eslint-disable-next-line no-return-assign
      .forEach((image) => image.src = new URL(image.getAttribute('src'), path).href);
    decorateMain(main);
    // add a copy temporarily to the document to ensure multi-section blocks are decorated correctly
    document.body.append(main);

    const blocks = main.querySelectorAll('div.block');
    for (let i = 0; i < blocks.length; i += 1) {
      const block = blocks[i];
      const status = block.dataset.blockStatus;
      if (status !== 'loading' && status !== 'loaded') {
        block.dataset.blockStatus = 'loading';
        const { blockName } = block.dataset;
        const templateConfig = block.closest('.section').dataset.templateConfig;

        try {
          const cssPromises = [
            new Promise((resolve) => {
              loadCSS(`${codeBaseUrl}/blocks/${blockName}/${blockName}.css`, resolve);
            }),
          ];

          if (templateConfig) {
            cssPromises.push(new Promise((resolve) => {
              loadCSS(`${codeBaseUrl}/scripts/template-factories/${templateConfig}.css`, resolve);
              document.body.classList.add(templateConfig);
            }));
          }

          const cssLoaded = Promise.all(cssPromises);
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
    // remove copy
    document.body.removeChild(main);

    await tokensLoaded;

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

  // this gets changed by lib-franklin.js in www-websites, we need to reset it to default for the next blocks
  window.hlx.codeBasePath = '/_src-lp';
}
