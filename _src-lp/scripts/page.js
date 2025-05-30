/* eslint-disable camelcase */
import { Page, User } from '@repobit/dex-utils';

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

export default new Page(
  new URLSearchParams(window.location.search)?.get('locale') || await User.locale,
  getPageName(),
  getEnvironment(),
);
