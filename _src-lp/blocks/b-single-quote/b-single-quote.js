import { isView } from '../../scripts/scripts.js';

export default function decorate(block) {
  const [quoteElement, authorElement, positionElement] = block.children;
  const [pictureElement] = block.children[3].getElementsByTagName('picture');
  let isDesktopView = isView('desktop');

  function render() {
    block.innerHTML = `
    <div class="main-wrapper">
      <div class="inner-wrapper">
        <div class="container">
          <div>
            <q>${quoteElement.innerText}</q>
            <div class="separator"></div>
            <div class="author">${authorElement.innerText}</div>
            <span class="position">${positionElement.innerText}</span>
          </div>
        </div>
      </div>
      ${isDesktopView ? pictureElement.outerHTML : ''}
    </div>`;

    const ref = document.querySelector('.b-single-quote-container .main-wrapper');

    const resizeObserver = new ResizeObserver(() => {
      const newViewportView = isView('desktop');

      const viewHasChanged = isDesktopView !== newViewportView;

      if (viewHasChanged) {
        isDesktopView = newViewportView;

        render();
      }
    });

    resizeObserver.observe(ref);
  }

  render();
}
