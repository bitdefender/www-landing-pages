export default function decorate(block) {
  const extraClasses = block.classList[1];
  document.querySelector('.b-boxes-container').classList.add(extraClasses);
  document.querySelector('.b-boxes').classList.remove('blue-gradient');
  document.querySelector('.b-boxes-container').setAttribute('id', 'blockSection');
  document.querySelector('.b-boxes-wrapper').classList.add('container');
}
