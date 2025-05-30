import Target from '@repobit/dex-target';
import { User } from '@repobit/dex-utils';
import { PageLoadStartedEvent } from '@repobit/dex-data-layer';
import Constants from './constants.js';
import page from './page.js';

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
  console.log(page.locale);

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
export const target = new Target({
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

window.BD.state.target = target;
