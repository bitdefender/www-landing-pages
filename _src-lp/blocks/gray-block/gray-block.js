export default function decorate(block) {
  const contentBlock = block.closest('.block');
  const metaData = block.closest('.section').dataset;
  const {
    backgroundColor,
  } = metaData;
  if (backgroundColor) contentBlock.style.backgroundColor = backgroundColor;
}
