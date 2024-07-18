export default function decorate(block) {
  setTimeout(() => {
    const element = block.closest('.section');
    const elementLink = block.querySelector('a');
    element.style.backgroundColor = '#E4F2FF';
    block.style.color = '#006EFF';
    if (elementLink) elementLink.style.color = '#006EFF';
  }, 2000);
}
