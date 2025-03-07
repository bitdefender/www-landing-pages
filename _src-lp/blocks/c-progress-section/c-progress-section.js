import SvgLoaderComponent from '../../components/svg-loader/svg-loader.js';
import { getDatasetFromSection, matchHeights } from '../../scripts/utils.js';

export default function decorate(block) {
  const [title, subtitle] = block.children;
  const slices = [...block.children].slice(2);

  const metaData = getDatasetFromSection(block);

  const svgColor = metaData.svgcolor;

  const formattedDataColumns = [
    {
      title: null,
      subtitle: null,
      footer: null,
      progresses: [],
      progressMax: [],
    },
    {
      title: null,
      subtitle: null,
      footer: null,
      progresses: [],
      progressMax: [],
    },
  ];

  function formatData() {
    slices.forEach((item, idx) => {
      const [first, second, third, forth] = item.children;

      if (idx === 0) {
        formattedDataColumns[0].title = first.innerText;
        formattedDataColumns[1].title = second.innerText;
      } else if (idx === 1) {
        formattedDataColumns[0].subtitle = first.innerText;
        formattedDataColumns[1].subtitle = second.innerText;
      } else if (idx >= 2 && idx < slices.length - 1) {
        formattedDataColumns[0].progresses = formattedDataColumns[0].progresses.concat({
          text: first.innerText,
          progress: second.innerText,
        });

        formattedDataColumns[0].progressMax = formattedDataColumns[0].progressMax.concat(Number(second.innerText));

        formattedDataColumns[1].progresses = formattedDataColumns[1].progresses.concat({
          text: third.innerText,
          progress: forth.innerText,
        });

        formattedDataColumns[1].progressMax = formattedDataColumns[1].progressMax.concat(Number(forth.innerText));
      } else {
        formattedDataColumns[0].footer = first.innerText;
        formattedDataColumns[1].footer = second.innerText;
      }
    });

    formattedDataColumns[0].progressMax = Math.max(...formattedDataColumns[0].progressMax);
    formattedDataColumns[1].progressMax = Math.max(...formattedDataColumns[1].progressMax);
  }

  function calcProgressBarWidth(current, max) {
    return `${((current / max) * 100).toFixed(2)}%`;
  }

  formatData();

  block.innerHTML = `
    <div class="container">
      ${title.innerText.trim() && `<div class="row">
        <div class="col-12"><h3 class="heading">${title.innerText}</h3></div>
      </div>`}
      ${subtitle.innerText.trim() && `<div class="row">
        <div class="col-12"><h2 class="subheading">${subtitle.innerText}</h2></div>
      </div>`}

      <div class="row">
        ${formattedDataColumns.map((col, parentIdx) => `
          <div class="col-12 col-md-6 mt-4">
            <div class="inner-wrapper">
              <div class="svg-icon">
                ${new SvgLoaderComponent(
    parentIdx === 0 ? 'shield-check' : 'gauge-indicator',
    `${svgColor || 'rgb(5, 14, 129)'}`,
  ).render()
}
              </div>
              <div class="w-100">
                <h2 class="title">${col.title}</h2>
                <p class="subtitle">${col.subtitle}</p>

                ${col.progresses.map((p, idx) => `
                  <div class="d-flex align-items-center">
                    <div
                      class="progress"
                      role="progressbar"
                      aria-label="Basic example"
                      aria-valuemin="0"
                      aria-valuemax="${col.progressMax}"
                      aria-valuenow="${p.progress}">
                        <div class="progress-bar ${idx === 0 ? 'progress-bar--first' : ''}" style="width: ${calcProgressBarWidth(p.progress, col.progressMax)}">
                          ${p.text} <span>${p.progress}</span>
                        </div>
                    </div>
                  </div>
                `).join('')}

                <p class="footer mt-4">${col.footer}</p>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  matchHeights(block, '.title');
  matchHeights(block, '.subtitle');
}
