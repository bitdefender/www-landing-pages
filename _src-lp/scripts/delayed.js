// eslint-disable-next-line import/no-cycle
import { sampleRUM, getMetadata } from './lib-franklin.js';
import { fetchGeoIP, setTrialLinks } from './utils.js';

fetchGeoIP();

// Core Web Vitals RUM collection
sampleRUM('cwv');

const trialLinkValue = getMetadata('trialbuylinks');
if (trialLinkValue) setTrialLinks();
