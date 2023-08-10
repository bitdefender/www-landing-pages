export default function decorate(block) {
  const infoTextEl = block.children[0].children[0];
  const carouselSlides = [...block.children[1].children];
  let infoImg = '';
  if (block.children[2]) {
    infoImg = block.children[2].children[0].innerHTML;
  }
  

  block.innerHTML = `
    <div class="container py-5">
      <div class="row">
      <div class="col-12${infoImg ? '' : ' col-md-7 '} description">${infoTextEl.innerHTML}</div>
        <div class="col-12 ${infoImg ? ' col-md-6 ' : ' col-md-5 '}">
          <div id="carouselExampleIndicators" class="carousel slide">
            <div class="carousel-indicators">
              ${carouselSlides.map((slide, idx) => `
                <button 
                  type="button"
                  data-bs-target="#carouselExampleIndicators"
                  data-bs-slide-to="${idx}"
                  class="${idx === 0 ? 'active' : ''}"
                  aria-current="${idx === 0 ? 'true' : 'false'}"
                  aria-label="Slide ${idx + 1}">
                </button>
              `).join('')}
            </div>

            <div class="carousel-inner">
              ${carouselSlides.map((slide, idx) => `
                <div class="carousel-item ${idx === 0 ? 'active' : ''}">
                  <q>${slide.children[0].innerText}</q>
                  <hr class="separator" />
                  <p class="author">${slide.children[1].innerText}</p>
                  <p class="position">${slide.children[2].innerText}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        ${infoImg ? `<div class="col-12 col-md-6 img-right">${infoImg}</div>` : ''}
      </div>
    </div>
  `;
}
