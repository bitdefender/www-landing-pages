export default function decorate(block) {
  const columns = [...block.children[0].children].map((item, idx) => ({
    title: item.innerHTML,
    content: block.children[1].children[idx].innerHTML,
  }));

  block.innerHTML = `
    <div class="wrapper">
        ${columns.map((col) => `
          <div class="column">
            <div class="title">${col.title}</div>
            <div class="content">${col.content}</div>
          </div>
        `).join('')}
    </div>
  `;
}
