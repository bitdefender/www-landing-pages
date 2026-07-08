export default function decorate(block) {
  const accordion = document.createElement('div');
  accordion.className = 'accordion';

  [...block.children].forEach((row, index) => {
    const [headerCell, contentCell] = row.children;
    if (!headerCell || !contentCell) return;

    const details = document.createElement('details');

    if (block.classList.contains('first-open') && index === 0) {
      details.open = true;
    }

    const summary = document.createElement('summary');
    summary.textContent = headerCell.textContent.trim();

    const content = document.createElement('div');
    content.className = 'accordion-content';

    [...contentCell.childNodes].forEach((node) => {
      content.append(node.cloneNode(true));
    });

    details.append(summary, content);
    accordion.append(details);
  });

  block.replaceChildren(accordion);
}
