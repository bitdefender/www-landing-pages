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
            const icon = cell.querySelector('.icon');

            if (!icon) return;

            const content = document.createElement('div');
            content.className = 'cell-content';

            const iconWrapper = document.createElement('div');
            iconWrapper.className = 'cell-icon';

            const textWrapper = document.createElement('div');
            textWrapper.className = 'cell-text';

            iconWrapper.appendChild(icon);

            [...cell.children].forEach((element) => {
                if (!element.contains(icon)) {
                    textWrapper.appendChild(element);
                }
            });

            content.append(iconWrapper, textWrapper);
            cell.replaceChildren(content);
        });

        table.querySelectorAll('u').forEach((element) => {
            if (element.textContent.trim().toUpperCase() === 'NEW') {
                element.classList.add('badge-new');
            }
        });
    });
}
