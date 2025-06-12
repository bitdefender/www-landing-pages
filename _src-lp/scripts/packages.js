import Target from '@repobit/dex-target';
import { User, Page } from '@repobit/dex-utils';
import { PageLoadStartedEvent } from '@repobit/dex-data-layer';
import Constants from './constants.js';
/* eslint-disable camelcase */

/**
 * Returns the environment based on the hostname
 * @returns {String}
 */
const getEnvironment = () => {
  const hostToInstance = {
    'bitdefender.com': 'prod',
    'hlx.page': 'dev',
    'hlx.live': 'dev',
  };

  // eslint-disable-next-line no-restricted-syntax
  for (const [host, inst] of Object.entries(hostToInstance)) {
    if (window.location.hostname.includes(host)) return inst;
  }

  return 'dev';
};

/**
 * @returns {string} page name
 */
const getPageName = () => window.location.pathname.split('/').filter(Boolean).pop();

export const page = new Page(
  new URLSearchParams(window.location.search)?.get('locale')?.toLowerCase() || await User.locale,
  getPageName(),
  getEnvironment(),
);

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
  pageSectionParts[0] = page.locale;

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
const target = new Target({
  pageLoadStartedEvent: new PageLoadStartedEvent(
    page,
    {
      name: pageName,
      section: sections[0] || '',
      subSection: sections[1] || '',
      subSubSection: sections[2] || '',
      subSubSubSection: sections[3] || '',
      geoRegion: await User.country,
      serverName: 'hlx.live',
      language: navigator.language || navigator.userLanguage || getDefaultLanguage(),
    },
  ),
});

export { target };
window.BD.state.target = target;
