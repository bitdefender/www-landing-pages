export default function decorate(block) {
  block.querySelectorAll('table').forEach((table) => {
    const firstRow = table.querySelector('tr');

    if (!firstRow) return;

    const styles = firstRow.textContent
      .trim()
      .toLowerCase()
      .split(',')
      .map((style) => style.trim())
      .filter(Boolean);

    if (styles.length) {
      table.classList.add(...styles);
      firstRow.remove();
    }

    const headingRow = table.querySelector('tr');

    if (headingRow) {
      headingRow.classList.add('table-heading');
    }

    table.querySelectorAll('td').forEach((cell) => {
      const icon = cell.querySelector('.icon') || cell.querySelector('picture');

      // Save the original content before changing the cell
      const originalContent = document.createElement('div');

      while (cell.firstChild) {
        originalContent.appendChild(cell.firstChild);
      }

      const content = document.createElement('div');
      content.className = 'cell-content';

      // ICON
      if (icon) {
        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'cell-icon';

        iconWrapper.appendChild(icon);
        content.appendChild(iconWrapper);
      }

      // TEXT
      const textWrapper = document.createElement('div');
      textWrapper.className = 'cell-text';

      /*
       * The expected structure is:
       *
       * <p>
       *   <strong>Title</strong>
       *   <u>NEW</u>
       * </p>
       * <p>Description</p>
       *
       * If the authoring gives us:
       *
       * <strong>Title</strong>
       * <br>
       * Description
       *
       * we create the <p> elements ourselves.
       */

      const paragraphs = originalContent.querySelectorAll('p');

      if (paragraphs.length) {
        paragraphs.forEach((paragraph) => {
          textWrapper.appendChild(paragraph);
        });
      } else {
        const firstParagraph = document.createElement('p');
        const secondParagraph = document.createElement('p');

        const elements = [...originalContent.childNodes];

        let isFirst = true;

        elements.forEach((node) => {
          if (
            node.nodeType === Node.TEXT_NODE
            && !node.textContent.trim()
          ) {
            return;
          }

          if (
            node.nodeType === Node.ELEMENT_NODE
            && node.tagName === 'BR'
          ) {
            isFirst = false;
            return;
          }

          if (isFirst) {
            firstParagraph.appendChild(node);
          } else {
            secondParagraph.appendChild(node);
          }
        });

        if (firstParagraph.childNodes.length) {
          textWrapper.appendChild(firstParagraph);
        }

        if (secondParagraph.childNodes.length) {
          textWrapper.appendChild(secondParagraph);
        }
      }

      // Add NEW badge
      textWrapper.querySelectorAll('u').forEach((element) => {
        element.classList.add('badge-new');
      });

      content.appendChild(textWrapper);
      cell.appendChild(content);
    });
  });
}
