export default function decorate(block) {
  const [heading, subtitle, list, imagesWrapperElement] = block.children;

  block.innerHTML = `
    <div class="main-wrapper">
      <div class="container">
        <h4>${heading.innerText}</h4>
        <p class="subtitle col-md-10 col-lg-9">${subtitle.innerText}</p>
        <p class="list col-md-10 col-lg-9">${list.innerHTML}</p>
      </div>
    </div>
  `;

  const bckImg = document.createElement('div');
  bckImg.className = 'bckImg';
  bckImg.innerHTML = [...imagesWrapperElement.children].map((item) => `${item.children[0].outerHTML}`).join('');
  block.closest('.section').appendChild(bckImg);
}
