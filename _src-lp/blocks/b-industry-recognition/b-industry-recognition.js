export default function decorate(block) {
  const [heading, subtitle, imagesWrapperElement] = block.children;

  block.innerHTML = `
    <div class="main-wrapper">
      <div class="container">
        <h4>${heading.innerText}</h4>
        <p class="subtitle col-md-10 col-lg-9">${subtitle.innerText}</p>
      </div>
      ${[...imagesWrapperElement.children].map((item) => `<div class="item">${item.children[0].outerHTML}</div>`).join('')}
  `;
}
