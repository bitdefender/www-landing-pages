export default function decorate(block) {
  const [, iconSubtitle, , subtitle, , columnTitle, columnSubtitle, columns] = block.children;

  columns.classList.add('columns-class');
  subtitle.classList.add('subtitle');
  columnTitle.classList.add('columns-title');
  columnSubtitle.classList.add('columns-subtitle');
  iconSubtitle.classList.add('icon-subtitle');
}
