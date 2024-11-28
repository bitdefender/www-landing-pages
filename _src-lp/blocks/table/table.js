export default function decorate(block) {
    const metaData = block.closest('.section').dataset;
    const {
      type,
    } = metaData;

    if (type && type === 'animation') {
        const animatedTexts = block.querySelector('h1 u');
        const animatedTextsSplit = animatedTexts?.innerText.split('|');
        if (!animatedTextsSplit) return;

        const animatedEl = document.createElement('span');
        animatedEl.className = 'animated_text';
        animatedTexts.innerHTML = `<div class="animated_text">
            ${animatedTextsSplit.map((item, key) => `<span class="${key === 0 ? 'd-show' : ''}">${item}</span>`).join('')}
        </div>`;

        setInterval(() => {
            const show = block.querySelector('.animated_text span.d-show');
            const next = show.nextElementSibling || block.querySelector('.animated_text span:first-child');
            const up = block.querySelector('.animated_text span.d-up');
            if (up) {
              up.classList.remove('d-up');
            }
            show.classList.remove('d-show');
            show.classList.add('d-up');
            next.classList.add('d-show');
          }, 2000);
    }

}