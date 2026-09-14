import { PageLoadStartedEvent } from '@repobit/dex-data-layer';
import Target from '@repobit/dex-target';
import userPromise from './user.js';
import Constants from './constants.js';
import pagePromise from './page.js';
import { sampleRUM, getMetadata } from './lib-franklin.js';

const user = await userPromise;

export function getDefaultLanguage() {
  const currentPathUrl = window.location.pathname;
  return Object.keys(Constants.LOCALISATIONS).find((lang) => currentPathUrl.includes(`/${lang}/`)) || Constants.DEFAULT_LANGUAGE;
}

/**
 * Returns the page name and sections based on the current URL
 * @returns {Object}
 */
export async function getPageNameAndSections() {
  const pageSectionParts = window.location.pathname.split('/').filter((subPath) => subPath !== '' && subPath !== 'pages');
  const subSubSection = pageSectionParts[0];
  pageSectionParts[0] = (await pagePromise).locale;

  try {
    if (pageSectionParts[1].length === 2) pageSectionParts[1] = 'offers'; // landing pages

    pageSectionParts.splice(2, 0, subSubSection);

    const pageName = pageSectionParts.join(':') || 'Home';
    return {
      pageName,
      sections: pageSectionParts,
    };
  } catch (e) {
    return {
      pageName: 'us:404',
      section: 'us',
      sections: [],
      subSection: '404',
    };
  }
}

const { pageName, sections } = await getPageNameAndSections();
const createTarget = async () => {
  const target = new Target({
    pageLoadStartedEvent: new PageLoadStartedEvent(
      await pagePromise,
      {
        name: pageName,
        section: sections[0] || '',
        subSection: sections[1] || '',
        subSubSection: sections[2] || '',
        subSubSubSection: sections[3] || '',
        geoRegion: await user.country,
        serverName: 'hlx.live',
        language: navigator.language || navigator.userLanguage || getDefaultLanguage(),
      },
    ),
  });

  window.target = target;
  return target;
};

const targetPromise = createTarget();
const target = await targetPromise;

/**
 * Convert a URL to a relative URL.
 * @param url
 * @returns {*|string}
 */
function getPlainPageUrl(url) {
  const { pathname, search, hash } = new URL(url, window.location.href);
  const plainPagePathname = pathname.endsWith('/') ? `${pathname}index.plain.html` : `${pathname}.plain.html`;
  return `${plainPagePathname}${search}${hash}`;
}

/**
 * Replace the current page with the challenger page.
 * @param url The challenger page url.
 * @returns {Promise<boolean>}
 */
async function navigateToChallengerPage(url) {
  const plainPath = getPlainPageUrl(url);

  const resp = await fetch(plainPath);
  if (!resp.ok) {
    throw new Error(`Failed to fetch challenger page: ${resp.status}`);
  }

  const mainElement = document.querySelector('main');
  if (!mainElement) {
    throw new Error('Main element not found');
  }

  mainElement.innerHTML = await resp.text();
}

/**
* @param {string} experimentUrl
* @param {string} experimentId
* @return {Promise<{
*  experimentId: string;
*  experimentVariant: string;
* }|null>}
*/
// eslint-disable-next-line import/prefer-default-export
export async function runTargetExperiment(experimentUrl, experimentId) {
  if (!experimentUrl) {
    return null;
  }

  try {
    await navigateToChallengerPage(experimentUrl);

    sampleRUM('target-experiment', {
      source: `target:${experimentId}`,
      target: experimentUrl,
    });

    return {
      experimentId,
      experimentVariant: experimentUrl,
    };
  } catch (e) {
    return null;
  }
}

export function appendAdobeMcLinks(selector) {
  try {
    const wrapperSelector = typeof selector === 'string' ? document.querySelector(selector) : selector;
    const isFooterSelector = Boolean(wrapperSelector.querySelector('.footer-2025__content'));

    // mimic production hostname on local env
    const pageUrlHostname = window.location.hostname === 'localhost'
      ? 'www.bitdefender.com'
      : window.location.hostname;

    const hrefSelector = 'a[href*=".bitdefender."]';
    wrapperSelector.querySelectorAll(hrefSelector).forEach(async (link) => {
      if (link.hostname !== pageUrlHostname
        && !Constants.DOMAINS_WITHOUT_ADOBE_MC.includes(link.hostname)) {
        if (isFooterSelector) {
          link.addEventListener('click', async (e) => {
            e.preventDefault();
            window.location.assign(await target.appendVisitorIDsTo(link.href));
          });
          return;
        }

        const destinationURLWithVisitorIDs = await target.appendVisitorIDsTo(link.href);
        link.href = destinationURLWithVisitorIDs.replace(/MCAID%3D.*%7CMCORGID/, 'MCAID%3D%7CMCORGID');
      }
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
}

/**
 *
 * @returns {boolean} returns wether A/B tests should be disabled or not
 */
export const shouldABTestsBeDisabled = () => {
  /** This is a special case for when adobe.target is disabled using dotest query param */
  const windowSearchParams = new URLSearchParams(window.location.search);
  if (windowSearchParams.get(Constants.DISABLE_TARGET_PARAMS.key)
    === Constants.DISABLE_TARGET_PARAMS.value) {
    return true;
  }

  return false;
};

/**
* get experiment details from Target
* @returns {Promise<{
*  experimentId: string;
*  experimentVariant: string;
* } | null>}
  */
export const getTargetExperimentDetails = async () => {
  /**
   * @type {{
   *  experimentId: string;
   *  experimentVariant: string;
   * }|null}
   */
  let targetExperimentDetails = null;

  async function loadCSS(href) {
    return new Promise((resolve, reject) => {
      if (!document.querySelector(`head > link[href="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = resolve;
        link.onerror = reject;
        document.head.append(link);
      } else {
        resolve();
      }
    });
  }

  const targetExperimentLocation = getMetadata('target-experiment-location');
  const targetExperimentId = getMetadata('target-experiment');
  if (targetExperimentLocation && targetExperimentId && !shouldABTestsBeDisabled()) {
    const offer = await target.getOffers({ mboxNames: targetExperimentLocation });
    const { url, template, metadata } = offer || {};
    if (template) {
      loadCSS(`${window.hlx.codeBasePath}/scripts/template-factories/${template}.css`);
      document.body.classList.add(template);
    }

    // Update meta tags from the page if an experiment is encountered
    if (metadata) {
      Object.entries(metadata).forEach(([name, value]) => {
        const headMetaElement = document.head.querySelector(`meta[name="${name}"]`);
        if (headMetaElement) {
          headMetaElement.content = value;
        }
      });
    }
    targetExperimentDetails = await runTargetExperiment(url, targetExperimentId);
  }

  return targetExperimentDetails;
};

export const getPageExperimentKey = () => getMetadata(Constants.TARGET_EXPERIMENT_METADATA_KEY);

/**
 *
 * @returns {object} - get experiment information
 */
export const getExperimentDetails = () => {
  if (!window.hlx || !window.hlx.experiment) {
    return null;
  }

  const { id: experimentId, selectedVariant: experimentVariant } = window.hlx.experiment;
  return { experimentId, experimentVariant };
};

export { targetPromise };
