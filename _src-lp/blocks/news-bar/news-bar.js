export default function decorate(block) {
  setTimeout(() => {
    const element = block.querySelector('.news-bar');
    const elementLink = block.querySelector('.news-bar a');
    element.style.backgroundColor = '#E4F2FF';
    element.style.color = '#006EFF';
    if (elementLink) elementLink.style.color = '#006EFF';
  }, 2000);
}
