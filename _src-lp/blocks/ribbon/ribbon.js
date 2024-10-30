export default function decorate(block) {
  const sectionParent = block.closest('.section');
  const sectionParentStyle = sectionParent.style;
  const blockStyle = block.style;
  const { bckImg, bckRepeat, bckColor, txtColor, paddingTop, paddingBottom, marginTop, marginBottom } = sectionParent.dataset;

  if (paddingTop) blockStyle.paddingTop = `${paddingTop}rem`;
  if (paddingBottom) blockStyle.paddingBottom = `${paddingBottom}rem`;
  if (marginTop) sectionParentStyle.marginTop = `${marginTop}rem`;
  if (marginBottom) sectionParentStyle.marginBottom = `${marginBottom}rem`;

  blockStyle.color = txtColor || 'white';

  if (bckImg) {
    sectionParentStyle.backgroundImage = `url("${bckImg}")`;
    sectionParentStyle.backgroundPosition = '0 0';
    sectionParentStyle.backgroundRepeat = bckRepeat || 'no-repeat';
    sectionParentStyle.backgroundBlendMode = 'unset';
  }

  sectionParentStyle.backgroundColor = bckColor || 'black';
}
