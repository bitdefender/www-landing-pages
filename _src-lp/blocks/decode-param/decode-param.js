const decodeUpgrade = (encoded) => {
  if (!encoded) return null;

  try {
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');

    while (base64.length % 4) {
      base64 += '=';
    }

    return atob(base64);
  } catch (error) {
    return null;
  }
};

const getParam = (param) => {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
};

const createLoader = () => {
  const wrapper = document.createElement('div');
  wrapper.className = 'upgrade-loader';

  const progress = document.createElement('div');
  progress.className = 'upgrade-loader-progress';

  wrapper.append(progress);

  return wrapper;
};

// the decoded value comes from the query string, so only http(s) URLs may reach an href
const toSafeUrl = (value) => {
  try {
    const url = new URL(value, window.location.href);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch (error) {
    return null;
  }
};

// the encoded cart URL doesn't carry the page's SRC, so forward it unless the cart URL already sets one
const withSrc = (value) => {
  const src = getParam('SRC');
  if (!src) return value;
  try {
    // appended as a string so the rest of the query (e.g. ORDERSTYLE=...=) is not re-encoded
    if (new URL(value, window.location.href).searchParams.has('SRC')) return value;
    const [base, hash] = value.split('#');
    const separator = base.includes('?') ? '&' : '?';
    return `${base}${separator}SRC=${encodeURIComponent(src)}${hash !== undefined ? `#${hash}` : ''}`;
  } catch (error) {
    return value;
  }
};

const isTryFamilyButton = (link) => link.textContent.replace(/\s+/g, '').toLowerCase() === 'tryfamilyforfree';

const setTryFamilyLinks = (root, url) => {
  // marked once set, so later tracking params added by other scripts are not overwritten
  root.querySelectorAll('a:not([data-upgrade-link])').forEach((link) => {
    if (!isTryFamilyButton(link)) return;
    link.href = url;
    link.dataset.upgradeLink = '';
  });
};

// table items are authored as "title<br>description"; wrap the title so it can be styled as its own line
const wrapItemTitles = (block) => {
  block.querySelectorAll('table td:last-child').forEach((cell) => {
    const [first, second] = cell.childNodes;
    if (first?.nodeType !== Node.TEXT_NODE || second?.nodeName !== 'BR') return;
    const title = document.createElement('strong');
    title.textContent = first.textContent.trim();
    first.replaceWith(title);
  });
};

export default function decorate(block) {
  if (block.closest('.superapp')) wrapItemTitles(block);

  const upgrade = getParam('upgrade');
  if (!upgrade) return;

  const decoded = decodeUpgrade(upgrade);
  if (!decoded) return;
  const redirectUrl = withSrc(decoded);

  // superapp: no auto-redirect, the decoded URL goes on every "Try Family for Free" button instead,
  // including buttons of sections decorated after this block
  if (block.closest('.superapp')) {
    const url = toSafeUrl(redirectUrl);
    if (!url) return;
    const main = block.closest('main') || document.body;
    setTryFamilyLinks(main, url);
    new MutationObserver(() => setTryFamilyLinks(main, url)).observe(main, { childList: true, subtree: true });
    return;
  }

  const loader = createLoader();
  block.append(loader);

  const progress = loader.querySelector('.upgrade-loader-progress');

  // reset + trigger animation
  progress.style.width = '0';
  setTimeout(() => {
    progress.style.transition = 'width 8s linear';
    progress.style.width = '100%';
  }, 50);

  setTimeout(() => {
    window.location.href = redirectUrl;
  }, 10000);
}
