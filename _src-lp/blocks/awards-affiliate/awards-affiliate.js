export default function decorate(block) {
  const childrenArray = block.children;
  if (childrenArray.length < 2) {
    console.error('Not enough children to select the second-to-last element.');
    return;
  }
  const iconSubtitle = childrenArray[1];
  const subtitble = childrenArray[3];
  const columnTitle = childrenArray[5];
  const columnSubtitle = childrenArray[6];
  const columns = childrenArray[childrenArray.length - 2];

  columns.classList.add('columns-class');
  subtitble.classList.add('subtitle');
  columnTitle.classList.add('columns-title');
  columnSubtitle.classList.add('columns-subtitle');
  iconSubtitle.classList.add('icon-subtitle');
}
