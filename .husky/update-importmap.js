/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-extraneous-dependencies */
const { exec } = require('child_process');
const { readdirSync, readFileSync, writeFileSync } = require('fs');
const { XMLSerializer, Window } = require('happy-dom');

const window = new Window({
  settings: {
    // Prevent any <script>…</script> from running:
    disableJavaScriptEvaluation: true,
    // Prevent external .js files from even being fetched:
    disableJavaScriptFileLoading: true,
    // (Optional) if you'd rather get a "load" event instead of an error
    // when loading is disabled, you can also set:
    // handleDisabledFileLoadingAsSuccess: true,
  }
});
const { document } = window;

// Function to run the npm ls command and return parsed JSON
function execNpmLs() {
  return new Promise((resolve, reject) => {
    exec('npm ls --json -all --omit=dev', (err, stdout) => {
      if (err) {
        // Sometimes npm ls returns an error code even if the JSON output is usable.
        try {
          const parsed = JSON.parse(stdout);
          return resolve(parsed);
        } catch (parseErr) {
          return reject(err);
        }
      }
      return resolve(JSON.parse(stdout));
    });
  });
}

// Recursively collect unique dependencies from the npm ls JSON
function collectDependencies(deps, result = {}) {
  Object.entries(deps).forEach(([name, info]) => {
    result[name] = info.version;
  });
  return result;
}

// Packages imported statically by the core scripts load on every page, so their
// whole esm.sh module graph is preloaded. Block-only packages (e.g. glide) are not.
const ESM_ORIGIN = 'https://esm.sh';
// esm.sh picks the build target from the User-Agent; modern browsers get es2022.
const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const PRELOAD_MARKER = 'data-esm-preload';

function getEagerPackages(deps) {
  const scriptsDir = '_src-lp/scripts';
  const source = readdirSync(scriptsDir)
    .filter((file) => file.endsWith('.js'))
    .map((file) => readFileSync(`${scriptsDir}/${file}`, 'utf-8'))
    .join('\n');
  return Object.keys(deps).filter((name) => source.includes(`from '${name}'`));
}

// Walks the static imports of each esm.sh entry point and returns every module URL,
// so the browser can fetch them in parallel instead of one import level at a time.
async function crawlEsmGraph(entryUrls) {
  const seen = new Set();
  let queue = [...entryUrls];
  while (queue.length) {
    const batch = queue.filter((url) => !seen.has(url));
    batch.forEach((url) => seen.add(url));
    // eslint-disable-next-line no-await-in-loop
    const sources = await Promise.all(batch.map(async (url) => {
      const resp = await fetch(url, { headers: { 'User-Agent': BROWSER_UA } });
      if (!resp.ok) throw new Error(`${resp.status} for ${url}`);
      return resp.text();
    }));
    queue = sources.flatMap((source) => [...source.matchAll(/(?:\bimport|\bfrom)\s*["']((?:\/|https:\/\/esm\.sh\/)[^"']+)["']/g)]
      .map(([, spec]) => new URL(spec, ESM_ORIGIN).href));
  }
  return [...seen];
}

let preloadUrlsPromise;
function getPreloadUrls(deps) {
  if (!preloadUrlsPromise) {
    const entryUrls = getEagerPackages(deps).map((name) => `${ESM_ORIGIN}/${name}@${deps[name]}`);
    preloadUrlsPromise = crawlEsmGraph(entryUrls).catch((err) => {
      console.error('Could not crawl esm.sh, keeping existing modulepreload links:', err.message);
      return null;
    });
  }
  return preloadUrlsPromise;
}

function updatePreloadLinks(doc, urls) {
  doc.querySelectorAll(`link[${PRELOAD_MARKER}]`).forEach((link) => {
    if (link.nextSibling?.nodeType === 3 && !link.nextSibling.textContent.trim()) link.nextSibling.remove();
    link.remove();
  });
  const anchor = doc.querySelector('link[href$="/styles/styles.css"]') || doc.querySelector('script[type="importmap"]');
  let ref = anchor;
  urls.forEach((url) => {
    const link = doc.createElement('link');
    link.setAttribute('rel', 'modulepreload');
    link.setAttribute('href', url);
    link.setAttribute(PRELOAD_MARKER, '');
    ref.after(link);
    link.before(doc.createTextNode('\n'));
    ref = link;
  });
}

// Main function that updates the import map in an HTML file
async function updateHtmlImportMap(htmlFilePath) {
  try {
    // Get the npm dependency tree for production dependencies
    const npmLsOutput = await execNpmLs();
    const deps = collectDependencies(npmLsOutput.dependencies);

    // Build an import map object.
    // For demonstration purposes, we create a mapping where each dependency is mapped
    // to a dummy CDN URL using its version. Adjust the URL format as needed.
    const importMap = {
      imports: {},
    };
    for (const [name, version] of Object.entries(deps)) {
      importMap.imports[`${name}`] = `https://esm.sh/${name}@${version}`;
      importMap.imports[`${name}/`] = `https://esm.sh/${name}@${version}/`;
    }

    // Read the HTML file
    const htmlContent = readFileSync(htmlFilePath, 'utf-8');
    const parser = new window.DOMParser();
    let newDocument = parser.parseFromString(htmlContent, 'text/html');
    const isCompleteHTMLFile = Boolean(newDocument.head.innerHTML);

    if (!isCompleteHTMLFile) {
      newDocument = document;
      newDocument.head.innerHTML = htmlContent;
    }

    // Find the <script> element with type="importsmap"
    let scriptElement = newDocument.querySelector('script[type="importmap"]');
    if (!scriptElement) {
      scriptElement = newDocument.createElement('script');
      scriptElement.type = 'importmap';
      newDocument.head.prepend(scriptElement);
    }

    // Update the script element's content with the new import map (formatted as JSON)
    scriptElement.textContent = JSON.stringify(importMap, null, 2);

    const preloadUrls = await getPreloadUrls(deps);
    if (preloadUrls) updatePreloadLinks(newDocument, preloadUrls);

    // Serialize the updated HTML and write it back to the file
    const serializer = new XMLSerializer();
    let content = '';
    const childNodes = isCompleteHTMLFile ? newDocument.childNodes : newDocument.head.childNodes;
    childNodes.forEach((child) => {
      content += serializer.serializeToString(child).replace(/\s+xmlns="[^"]*"/, '');
    });

    writeFileSync(htmlFilePath, content, 'utf-8');
    console.log(`Updated ${htmlFilePath} with the new import map.`);
  } catch (err) {
    console.error('Error updating the import map:', err);
  }
}

// Usage: Pass the HTML file path as the first argument, or it defaults to 'index.html'
updateHtmlImportMap('head.html');
updateHtmlImportMap('404.html');