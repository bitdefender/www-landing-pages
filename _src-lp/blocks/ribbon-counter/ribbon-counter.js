export default function decorate(block) {
  const parentSection = block.closest('.section');
  const {
    backgroundColor, textColor, counterEndsOn, counterHeadings, paddingTop, paddingBottom, marginTop, marginBottom,
  } = parentSection.dataset;
  const [, backgroundEl] = block.children;

  if (backgroundColor) parentSection.style.backgroundColor = backgroundColor;
  if (textColor) block.querySelector('*').style.color = textColor;
  if (paddingTop) block.style.paddingTop = `${paddingTop}rem`;
  if (paddingBottom) block.style.paddingBottom = `${paddingBottom}rem`;
  if (marginTop) parentSection.style.marginTop = `${marginTop}rem`;
  if (marginBottom) parentSection.style.marginBottom = `${marginBottom}rem`;

  if (backgroundEl) {
    const backgroundImgEl = backgroundEl.querySelector('img');
    const backgroundImgSrc = backgroundImgEl?.getAttribute('src');

    if (backgroundImgSrc) {
      parentSection.style.backgroundImage = `url("${backgroundImgSrc}")`;
      // Remove the row after setting background
      backgroundEl.remove();
    }
  }

  if (counterEndsOn) {
    const [daysLabel, hoursLabel, minsLabel, secLabel] = counterHeadings ? counterHeadings.split(',').map((v) => v.trim()) : ['d', 'h', 'm', 's'];

    block.innerHTML = block.innerHTML.replace('[counter]', `
      <strong class="ribbonCounter"></strong>
    `);

    const countdownElement = block.querySelector('.ribbonCounter');
    const targetDate = new Date(counterEndsOn).getTime();
    let interval;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        // countdownElement.innerHTML = "Countdown ended!";
        parentSection.remove();
        clearInterval(interval);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      countdownElement.innerHTML = `${days}${daysLabel} : ${hours}${hoursLabel} : ${minutes}${minsLabel} : ${seconds}${secLabel}`;
    };

    interval = setInterval(updateCountdown, 1000);
    updateCountdown();
  }
}
