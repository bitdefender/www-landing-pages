export default function decorate(block) {
  const [title, subtitle, button, ...rightColumns] = block.children;
  const leftColumn = document.createElement('div');
  leftColumn.classList.add('left-column');
  leftColumn.appendChild(title);
  leftColumn.appendChild(subtitle);
  leftColumn.appendChild(button);

  const rightColumn = document.createElement('div');
  rightColumn.classList.add('right-column');
  rightColumns.forEach((element) => {
    rightColumn.appendChild(element);
  });
  block.appendChild(leftColumn);
  block.appendChild(rightColumn);
}
