export default function decorate(block) {
  block.querySelectorAll('table').forEach((table) => {
    const firstRow = table.querySelector('tr');

    if (!firstRow) return;

    const style = firstRow.textContent
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-');

    if (style) {
      table.classList.add(style);
      firstRow.remove();
    }

    const headingRow = table.querySelector('tr');

    if (headingRow) {
      headingRow.classList.add('table-heading');
    }

    table.querySelectorAll('td').forEach((cell) => {
      const icon = cell.querySelector('.icon') || cell.querySelector('picture');

      if (!icon) return;

      const content = document.createElement('div');
      content.className = 'cell-content';

      const iconWrapper = document.createElement('div');
      iconWrapper.className = 'cell-icon';

      iconWrapper.appendChild(icon);

      const textElements = [...cell.children].filter(
        (element) => !element.contains(icon) && element.textContent.trim(),
      );

      content.appendChild(iconWrapper);

      if (textElements.length) {
        const textWrapper = document.createElement('div');
        textWrapper.className = 'cell-text';

        textElements.forEach((element) => {
          textWrapper.appendChild(element);
        });

        content.appendChild(textWrapper);
      }
      cell.replaceChildren(content);
    });

    table.querySelectorAll('u').forEach((element) => {
      if (element.textContent.trim().toUpperCase() === 'NEW') {
        element.classList.add('badge-new');
      }
    });
  });
}
