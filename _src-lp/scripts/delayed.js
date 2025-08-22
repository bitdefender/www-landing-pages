// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';
import { fetchGeoIP } from './utils.js';

fetchGeoIP();

document.querySelector('#banner p.button-container a').href = 'sadfdasgsfdgsdgfsd';
document.querySelector('#banner p.button-container').setAttribute('data-hrefp', 'asdfadgdf');
document.querySelector('#banner p.button-container a').setAttribute('data-hrefa', 'asdfadgdf');
alert('sadgfad')

// Core Web Vitals RUM collection
sampleRUM('cwv');
