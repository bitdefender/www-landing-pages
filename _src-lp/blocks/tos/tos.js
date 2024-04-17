export default function decorate(block) {
  const links = block.querySelectorAll('h3');

  for (let i = 0; i < links.length; i += 1) {
    links[i].addEventListener('click', () => {
      const svg = links[i].parentElement.querySelector('svg');
      svg.classList.toggle('tos__link--active');
      links[i].parentElement.parentElement.children[1].children[0].classList.toggle('d-block');
    });
  }

  for (let i = 0; i < links.length; i += 1) {
    links[i].parentElement.classList.add('d-flex', 'justify-content-between', 'justify-content-sm-start', 'w-100');
    links[i].innerHTML += '<svg style="height: 20px; margin-left: 0.5rem; transition: 0.2s all;" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="chevron-down" class="svg-inline--fa fa-chevron-down fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"></path></svg>';
  }
}
