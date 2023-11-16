// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';
import { addScript } from './utils.js';

addScript('https://js.sentry-cdn.com/31155ca43cab4235b06e5da92992eef0.min.js');

// Core Web Vitals RUM collection
sampleRUM('cwv');
