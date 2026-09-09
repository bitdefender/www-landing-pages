export default function decorate(block) {
  const columns = [...block.children];

  if (columns.length !== 4) {
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

  const savedMessage = document.createElement('div');
  savedMessage.className = 'custom-saved';
  savedMessage.textContent = columns[3].textContent.trim();
  savedMessage.hidden = true;

  actions.append(confirmButton, savedMessage);

  block.replaceChildren(options, actions);

  confirmButton.addEventListener('click', () => {
    const selected = block.querySelector(
      'input[name="email-tracking"]:checked',
    );

    if (!selected) {
      return;
    }

    options.hidden = true;
    confirmButton.hidden = true;
    savedMessage.hidden = false;
  });
}
