function createAccordion(text, content) {
  const button = document.createElement('div');
  button.classList.add('accordion');
  button.innerHTML = text;

  const panel = document.createElement('div');
  panel.classList.add('panel');
  panel.innerHTML = `<p>${content}</p>`;

  return { button, panel };
}

function replaceListWithAccordions(ul) {
  const div = document.createElement('div');
  div.classList.add('feature-list');

  // eslint-disable-next-line arrow-parens
  Array.from(ul.children).forEach(li => {
    const [title, content] = li.innerHTML.split('<br>');
    // eslint-disable-next-line prefer-const
    let [newTitle, improved] = title.split('*');
    if (typeof improved !== 'undefined') {
      newTitle = `${newTitle} <span class="improved">${improved}</span>`;
    }
    const { button, panel } = createAccordion(newTitle, content.trim());
    div.appendChild(button);
    div.appendChild(panel);
  });

  ul.parentNode.replaceChild(div, ul);
}

export default function decorate(block) {
  // get data attributes set in metaData
  const parentSelector = block.closest('.section');
  const metaData = parentSelector.dataset;

  // config new elements
  // eslint-disable-next-line no-unused-vars
  const { style } = metaData;

  const firstRow = block.querySelector('.features.block > div:first-of-type');
  block.parentNode.insertBefore(firstRow, block);

  block.querySelectorAll('.features ul').forEach(replaceListWithAccordions);
  const acc = block.getElementsByClassName('accordion');
  for (let i = 0; i < acc.length; i += 1) {
    acc[i].addEventListener('click', function toggle() {
      this.classList.toggle('active');
      const panel = this.nextElementSibling;
      if (panel.style.display === 'block') {
        panel.style.display = 'none';
      } else {
        panel.style.display = 'block';
      }
    });
  }
}
