import { loadFragment } from '../../scripts/scripts.js';
import { adobeMcAppendVisitorId, getLocalizedResourceUrl } from '../../scripts/utils.js';

export default async function decorate(block) {
  const fragment = await loadFragment(getLocalizedResourceUrl('footer'));
  const footer = block.closest('.footer-wrapper');

  if (window.location.href.indexOf('scuderiaferrari') !== -1) {
    block.closest('.footer-wrapper').id = 'footerFerrari';
  }

  if (fragment) {
    const fragmentSections = fragment.querySelectorAll(':scope .section');
    if (fragmentSections) {
      footer.replaceChildren(...fragmentSections);
    }
  }

  const replacements = [
    [/\[year\]/g, new Date().getFullYear()],
    [/>Twitter Bitdefender</, '><img src="/icons/twitter.svg" /><'],
    [/>Linkedin Bitdefender</, '><img src="/icons/linkedin.svg" /><'],
    [/>Facebook Bitdefender</, '><img src="/icons/facebook.svg" /><'],
    [/>Youtube Bitdefender</, '><img src="/icons/youtube.svg" /><'],
  ];
  
  replacements.forEach(([pattern, replacement]) => {
    footer.innerHTML = footer.innerHTML.replace(pattern, replacement);
  });

  adobeMcAppendVisitorId('footer');
}
