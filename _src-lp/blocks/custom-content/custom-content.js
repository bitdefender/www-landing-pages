export default function decorate(block) {
  const columns = [...block.children];

  if (columns.length !== 5) {
    return;
  }

  const options = document.createElement('div');
  options.className = 'custom-options';

  const createOption = (column, value) => {
    const content = column.querySelector('[data-valign="middle"]');
    const paragraphs = [...content.querySelectorAll('p')];
    const contentText = content.textContent;

    const isSelected = contentText.includes('[selected]');
    const isSkip = contentText.includes('[skip]');

    const label = document.createElement('label');
    label.className = `custom-option ${isSelected ? 'active' : 'inactive'}`;

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'email-tracking';
    input.value = value;
    input.checked = isSelected;

    const radio = document.createElement('span');
    radio.className = 'custom-radio';

    const text = document.createElement('div');
    text.className = 'custom-option-text';

    paragraphs.forEach((paragraph) => {
      const p = paragraph.cloneNode(true);

      p.textContent = p.textContent
        .replace('[selected]', '')
        .replace('[skip]', '')
        .trim();

      if (p.textContent) {
        text.appendChild(p);
      }
    });

    label.append(input, radio, text);

    if (isSkip) {
      label.dataset.skip = 'true';
    }

    input.addEventListener('change', () => {
      options.querySelectorAll('.custom-option').forEach((option) => {
        const optionInput = option.querySelector('input');

        option.classList.toggle('active', optionInput.checked);
        option.classList.toggle('inactive', !optionInput.checked);
      });
    });

    return label;
  };

  options.append(
    createOption(columns[0], 'yes'),
    createOption(columns[1], 'no'),
  );

  const actions = document.createElement('div');
  actions.className = 'custom-actions';

  const confirmButton = document.createElement('button');
  confirmButton.type = 'button';
  confirmButton.className = 'custom-confirm';
  confirmButton.textContent = columns[2].textContent.trim();

  actions.append(confirmButton);

  const errorTexts = columns[3].textContent
    .split('|')
    .map((message) => message.trim());

  const errorMessage = document.createElement('div');
  errorMessage.className = 'custom-error';
  errorMessage.textContent = errorTexts[0];
  errorMessage.hidden = true;

  const savedMessage = document.createElement('div');
  savedMessage.className = 'custom-saved';
  savedMessage.innerHTML = columns[4].innerHTML.trim();
  savedMessage.hidden = true;

  block.replaceChildren(
    options,
    errorMessage,
    actions,
    savedMessage,
  );

  const section = block.closest('.section');

  if (!section) {
    return;
  }

  const { api } = section.dataset;

  if (api && api === 'yes') {
    const queryString = window.location.search.substring(1);

    const emailParam = queryString
      .split('&')
      .find((param) => param.startsWith('email='));

    const email = emailParam
      ? decodeURIComponent(emailParam.substring('email='.length))
      : null;

    if (!email) {
      console.error('Email parameter is missing.');
      return;
    }

    confirmButton.addEventListener('click', async () => {
      const selected = block.querySelector(
        'input[name="email-tracking"]:checked',
      );

      if (!selected) {
        errorMessage.textContent = errorTexts[0];
        errorMessage.hidden = false;
        return;
      }

      errorMessage.hidden = true;

      const selectedOption = selected.closest('.custom-option');

      const isSkip = selectedOption?.dataset.skip === 'true';

      // Skip API call
      if (isSkip) {
        options.hidden = true;
        actions.hidden = true;
        errorMessage.hidden = true;
        savedMessage.hidden = false;
        return;
      }

      const opensTrackingConsent = selected.value === 'yes';

      try {
        const encodedEmail = encodeURIComponent(email);

        const url = new URL(
          'https://www.bitdefender.com/site/Main/openTrackingConsent',
        );

        url.search = `email=${encodedEmail}&otc=${opensTrackingConsent}`;

        const response = await fetch(url, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        const requestSuccess = data?.result?.result?.data?.success;

        if (requestSuccess === true) {
          options.hidden = true;
          actions.hidden = true;
          errorMessage.hidden = true;
          savedMessage.hidden = false;
        } else {
          errorMessage.textContent = errorTexts[1];
          errorMessage.hidden = false;
        }
      } catch (error) {
        errorMessage.textContent = errorTexts[1];
        errorMessage.hidden = false;
      }
    });
  }
}
