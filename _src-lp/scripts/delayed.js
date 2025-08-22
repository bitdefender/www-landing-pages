// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';
import { fetchGeoIP } from './utils.js';

fetchGeoIP();

// Core Web Vitals RUM collection
sampleRUM('cwv');
