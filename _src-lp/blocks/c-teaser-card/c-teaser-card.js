export default function decorate(block) {
  const [heading, subtitle, picture] = block.children;

  block.innerHTML = `
    <div class="main-wrapper">
      <div class="inner-wrapper">
        <h3>${heading.innerHTML}</h3>
        <div class="subtitle">${subtitle.innerText}</div>
      </div>
    </div>
    ${picture.children[0].innerHTML}
  `;
}
