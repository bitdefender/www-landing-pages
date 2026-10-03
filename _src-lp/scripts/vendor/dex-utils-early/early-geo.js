/**
 * Standalone entry point: load it from the page <head> as its own module, e.g.
 *   <script type="module" src="https://esm.sh/@repobit/dex-utils@VERSION/dist/src/early-geo.js"></script>
 * It starts the geo lookup while the rest of the page's modules are still downloading.
 * User reuses the result instead of making the same requests again.
 */
import { startGeoLookup } from './geo.js';
const w = window;
w.BD = w.BD || {};
w.BD.earlyGeo = w.BD.earlyGeo || startGeoLookup();
