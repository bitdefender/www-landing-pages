export default function decorate(block) {
  const parentBlockStyle = block.closest('.section').style;
  const blockStyle = block.style;
  const metaData = block.closest('.section').dataset;
  const {
    backgroundColor, textColor, underlinedInclinedTextColor, textAlignVertical, imageAlign, paddingTop, paddingBottom, marginTop, marginBottom, imageCover, corners,
  } = metaData;
  const [richTextEl, pictureEl] = [...block.children];

  if (backgroundColor) parentBlockStyle.backgroundColor = backgroundColor;
  if (textColor) blockStyle.color = textColor;
  if (underlinedInclinedTextColor) {
    block.querySelectorAll('em u').forEach((element) => {
      element.style.color = underlinedInclinedTextColor;
      element.style.fontStyle = 'normal';
      element.style.textDecoration = 'none';
    });
  }
  if (paddingTop) blockStyle.paddingTop = `${paddingTop}rem`;
  if (paddingBottom) blockStyle.paddingBottom = `${paddingBottom}rem`;
  if (marginTop) blockStyle.marginTop = `${marginTop}rem`;
  if (marginBottom) blockStyle.marginBottom = `${marginBottom}rem`;

  if (corners && corners === 'round') {
    blockStyle.borderRadius = '20px';
  }

  if (corners && corners === 'round') {
    blockStyle.borderRadius = '20px';
  }

  if (imageCover && imageCover === 'small') {
    blockStyle.background = `url(${pictureEl.querySelector('img').getAttribute('src').split('?')[0]}) no-repeat 0 0 / cover ${backgroundColor || 'transparent'}`;
    block.innerHTML = `
    <div class="container-fluid">
        <div class="row d-none d-lg-flex">
          <div class="col-5 ps-4">${richTextEl.innerHTML}</div>
        </div>
        <div class="row d-lg-none justify-content-center">
          <div class="col-12 col-md-7 text-center">${richTextEl.innerHTML}</div>
          <div class="col-12 p-0 text-center">
            ${pictureEl.innerHTML}
          </div>
        </div>
      </div>
    `;
  } else if (imageCover && imageCover === 'full') {
    parentBlockStyle.background = `url(${pictureEl.querySelector('img').getAttribute('src').split('?')[0]}) no-repeat top right / auto 100% ${backgroundColor || 'transparent'}`;
    block.innerHTML = `
    <div class="container-fluid">
        <div class="row d-none d-lg-flex">
          <div class="col-12 col-md-7">${richTextEl.innerHTML}</div>
        </div>
        <div class="row d-lg-none justify-content-center">
          <div class="col-12 col-md-7 text-center">${richTextEl.innerHTML}</div>
        </div>
      </div>
    `;
  } else {
    block.innerHTML = `
    <div class="container-fluid">
        <div class="row d-none d-lg-flex">
          <div class="col-5 ps-4">${richTextEl.innerHTML}</div>
          <div class="col-7 img-right">
            ${pictureEl.innerHTML}
          </div>
        </div>
        <div class="row d-lg-none justify-content-center">
          <div class="col-12 p-0 text-center">
            ${pictureEl.innerHTML}
          </div>
          <div class="col-12 col-md-7 text-center">${richTextEl.innerHTML}</div>
        </div>
      </div>
    `;
  }

  if (textAlignVertical) {
    block.querySelector('.row').classList.add(`align-items-${textAlignVertical}`);
  }

  if (imageAlign) {
    block.querySelector('.img-right').style.textAlign = imageAlign;
  }
}
