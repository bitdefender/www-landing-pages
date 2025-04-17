import { Page } from '@repobit/dex-utils';
import { Locale } from './vendor/product.js';

/**
 * Returns the environment based on the hostname
 * @returns {String}
 */
const getEnvironment = () => {
  const hostToInstance = {
    'bitdefender.com': 'prod',
    'hlx.page': 'stage',
    'hlx.live': 'stage',
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

/**
 *
 * @returns {Promise<Page>}
 */
const getPage = async () => new Page(await Locale.get(), getPageName(), getEnvironment());

export default getPage();
