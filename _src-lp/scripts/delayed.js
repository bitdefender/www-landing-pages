// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';
import { fetchGeoIP } from './utils.js';

fetchGeoIP();

document.getElementById('banner').href = 'sadfdasgsfdgsdgfsd';
document.getElementById('banner').setAttribute('data-href', 'asdfadgdf')

// Core Web Vitals RUM collection
sampleRUM('cwv');
