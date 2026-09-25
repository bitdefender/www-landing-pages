export default function decorate(block) {
  console.log(block.closest('.section').innerHTML);
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

      // Save original content
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

      const paragraphs = [...originalContent.querySelectorAll('p')];

      if (paragraphs.length) {
        paragraphs.forEach((paragraph) => {
          // Ignore empty paragraphs
          if (!paragraph.textContent.trim()) {
            return;
          }

          const strong = paragraph.querySelector('strong');

          /*
           * Paragraph containing a title:
           *
           * <p>
           *   <strong>Scamio Pro</strong>
           *   Spezialisierter KI-Chatbot...
           * </p>
           *
           * becomes:
           *
           * <p class="cell-title">
           *   <strong>Scamio Pro</strong>
           * </p>
           *
           * <p class="cell-description">
           *   Spezialisierter KI-Chatbot...
           * </p>
           */
          if (strong) {
            const titleParagraph = document.createElement('p');
            titleParagraph.className = 'cell-title';

            const descriptionParagraph = document.createElement('p');
            descriptionParagraph.className = 'cell-description';

            let titleFound = false;

            [...paragraph.childNodes].forEach((node) => {
              // Ignore whitespace
              if (
                node.nodeType === Node.TEXT_NODE
                && !node.textContent.trim()
              ) {
                return;
              }

              // STRONG = title
              if (
                node.nodeType === Node.ELEMENT_NODE
                && node.tagName === 'STRONG'
              ) {
                titleParagraph.appendChild(node);
                titleFound = true;
                return;
              }

              // U = NEW badge
              if (
                node.nodeType === Node.ELEMENT_NODE
                && node.tagName === 'U'
              ) {
                node.classList.add('badge-new');
                titleParagraph.appendChild(node);
                return;
              }

              // Everything else = description
              if (titleFound) {
                descriptionParagraph.appendChild(node);
              }
            });

            if (titleParagraph.textContent.trim()) {
              textWrapper.appendChild(titleParagraph);
            }

            if (descriptionParagraph.textContent.trim()) {
              textWrapper.appendChild(descriptionParagraph);
            }
          } else {
            /*
             * Paragraph without a title
             * stays as a description.
             */
            paragraph.classList.add('cell-description');
            textWrapper.appendChild(paragraph);
          }
        });
      } else {
        /*
         * Fallback when there are no <p> elements.
         *
         * Example:
         *
         * <strong>Scamio Pro</strong>
         * <br>
         * Description
         */
        const titleParagraph = document.createElement('p');
        titleParagraph.className = 'cell-title';

        const descriptionParagraph = document.createElement('p');
        descriptionParagraph.className = 'cell-description';

        let descriptionStarted = false;

        [...originalContent.childNodes].forEach((node) => {
          // Ignore whitespace
          if (
            node.nodeType === Node.TEXT_NODE
            && !node.textContent.trim()
          ) {
            return;
          }

          // BR means description starts
          if (
            node.nodeType === Node.ELEMENT_NODE
            && node.tagName === 'BR'
          ) {
            descriptionStarted = true;
            return;
          }

          // STRONG / U belong to title
          if (
            node.nodeType === Node.ELEMENT_NODE
            && (
              node.tagName === 'STRONG'
              || node.tagName === 'U'
            )
            && !descriptionStarted
          ) {
            if (node.tagName === 'U') {
              node.classList.add('badge-new');
            }

            titleParagraph.appendChild(node);
            return;
          }

          // Everything else = description
          descriptionStarted = true;
          descriptionParagraph.appendChild(node);
        });

        if (titleParagraph.textContent.trim()) {
          textWrapper.appendChild(titleParagraph);
        }

        if (descriptionParagraph.textContent.trim()) {
          textWrapper.appendChild(descriptionParagraph);
        }
      }

      content.appendChild(textWrapper);
      cell.appendChild(content);
    });
  });

  // CUSTOM COLUMNS
  block.querySelectorAll('.custom-columns').forEach((columns) => {
    const columnsWrapper = columns.querySelector(':scope > div');

    if (!columnsWrapper) return;

    const columnItems = [...columnsWrapper.children];

    columnItems.forEach((column) => {
      const content = document.createElement('div');
      content.className = 'custom-column-content';

      while (column.firstChild) {
        content.appendChild(column.firstChild);
      }

      column.appendChild(content);
    });
  });
}
