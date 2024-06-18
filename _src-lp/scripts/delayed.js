// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';
import { getInstance, addScript, fetchGeoIP } from './utils.js';

if (getInstance() === 'prod') {
  if ((Math.random() * 100) < 1) {
    addScript('https://js.sentry-cdn.com/31155ca43cab4235b06e5da92992eef0.min.js');
  }
}

fetchGeoIP();

// Core Web Vitals RUM collection
sampleRUM('cwv');
