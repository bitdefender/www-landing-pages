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
    const isSelected = content.textContent.includes('[selected]');

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
      p.textContent = p.textContent.replace('[selected]', '').trim();

      if (p.textContent) {
        text.appendChild(p);
      }
    });

    label.append(input, radio, text);

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

  // Errors from column 4, separated by "|"
  const errorMessages = columns[3].textContent
    .split('|')
    .map((message) => message.trim());

  const errorMessage = document.createElement('div');
  errorMessage.className = 'custom-error';
  errorMessage.textContent = errorMessages[0] || '';
  errorMessage.hidden = true;

  const apiErrorMessage = document.createElement('div');
  apiErrorMessage.className = 'custom-error';
  apiErrorMessage.textContent = errorMessages[1] || '';
  apiErrorMessage.hidden = true;

  // Success message from column 5
  const savedMessage = document.createElement('div');
  savedMessage.className = 'custom-saved';
  savedMessage.textContent = columns[4].textContent.trim();
  savedMessage.hidden = true;

  block.replaceChildren(
    options,
    errorMessage,
    apiErrorMessage,
    actions,
    savedMessage,
  );

  const { api } = block.closest('.section').dataset;

  if (api && api === 'yes') {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');

    if (!email) {
      console.error('Email parameter is missing.');
      return;
    }

    confirmButton.addEventListener('click', async () => {
      const selected = block.querySelector(
        'input[name="email-tracking"]:checked',
      );

      // No option selected
      if (!selected) {
        errorMessage.hidden = false;
        apiErrorMessage.hidden = true;
        return;
      }

      errorMessage.hidden = true;
      apiErrorMessage.hidden = true;

      const opensTrackingConsent = selected.value === 'yes';

      try {
        const response = await fetch(
          'https://orion.bitdefender.com/2.1/emarsys',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: Date.now(),
              jsonrpc: '2.0',
              method: 'updateOpensTrackingConsent',
              params: {
                point: 'live',
                email,
                opensTrackingConsent,
              },
            }),
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();
        console.log('data ', data);

        if (data?.result?.data?.success) {
          options.hidden = true;
          actions.hidden = true;
          savedMessage.hidden = false;
        } else {
          apiErrorMessage.hidden = false;
        }
      } catch (error) {
        console.error(
          'Failed to update opens tracking consent:',
          error,
        );

        apiErrorMessage.hidden = false;
      }
    });
  }
}
