function createSelect(fd) {
  const select = document.createElement('select');
  select.id = fd.Field;
  if (fd.Placeholder) {
    const ph = document.createElement('option');
    ph.textContent = fd.Placeholder;
    ph.setAttribute('selected', '');
    ph.setAttribute('disabled', '');
    select.append(ph);
  }
  fd.Options.split(',').forEach((o) => {
    const option = document.createElement('option');
    option.textContent = o.trim();
    option.value = o.trim();
    select.append(option);
  });
  if (fd.Mandatory === 'x') {
    select.setAttribute('required', 'required');
  }
  return select;
}

function constructPayload(form) {
  const payload = {};
  [...form.elements].forEach((fe) => {
    if (fe.type === 'checkbox') {
      if (fe.checked) payload[fe.id] = fe.value;
    } else if (fe.id) {
      payload[fe.id] = fe.value;
    }
  });
  return payload;
}

async function submitForm(form) {
  const payload = constructPayload(form);
  payload.timestamp = new Date().toJSON();
  const resp = await fetch(form.dataset.action, {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: payload }),
  });
  await resp.text();
  return payload;
}

/*
  * Creates a modal with title and message
  * @param {string} title - title of the modal
  * @param {string} message - message of the modal
  * @returns {void}
  */
const createModal = () => {
  const modal = document.createElement('dialog');
  modal.classList.add('success-form-modal');

  const modalTitle = document.createElement('h2');
  modalTitle.classList.add('modal-title');

  const modalMessage = document.createElement('p');
  modalMessage.classList.add('modal-message');

  const modalClose = document.createElement('button');
  modalClose.classList.add('modal-close');
  modalClose.textContent = 'Close';

  modal.appendChild(modalTitle);
  modal.appendChild(modalMessage);
  modal.appendChild(modalClose);

  const formContainer = document.querySelector('.form-container');
  formContainer.appendChild(modal);
};

/**
 * Displays a modal with title and message
 * @param {string} title - title of the modal
 * @param {string} message - message of the modal
 * @returns {void}
 * */
async function displayModal(title, message) {
  createModal();
  const modal = document.querySelector('.success-form-modal');
  const modalTitle = modal.querySelector('.modal-title');
  const modalMessage = modal.querySelector('.modal-message');
  const modalClose = modal.querySelector('.modal-close');

  modalTitle.textContent = title;
  modalMessage.textContent = message;

  modal.showModal();

  await new Promise((resolve) => {
    modalClose.addEventListener('click', () => {
      modal.close();
      resolve();
    });

    // close modal on click outside of modal
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.close();
        resolve();
      }
    });
  });
}

function createButton(fd) {
  const button = document.createElement('button');
  button.textContent = fd.Label;
  button.classList.add('button');
  if (fd.Type === 'submit') {
    button.addEventListener('click', async (event) => {
      const form = button.closest('form');
      if (fd.Placeholder) form.dataset.action = fd.Placeholder;
      if (form.checkValidity()) {
        event.preventDefault();
        button.setAttribute('disabled', '');
        await submitForm(form);
        const redirectTo = fd.Extra;
        await displayModal('success', 'Your form has been submitted successfully');
        window.location.href = redirectTo;
      }
    });
  }
  return button;
}

function createHeading(fd, el) {
  const heading = document.createElement(el);
  heading.textContent = fd.Label;
  return heading;
}

function createInput(fd) {
  const input = document.createElement('input');
  input.type = fd.Type;
  input.id = fd.Field;
  input.setAttribute('placeholder', fd.Placeholder);
  if (fd.Mandatory === 'x') {
    input.setAttribute('required', 'required');
  }
  return input;
}

function createTextArea(fd) {
  const input = document.createElement('textarea');
  input.id = fd.Field;
  input.setAttribute('placeholder', fd.Placeholder);
  if (fd.Mandatory === 'x') {
    input.setAttribute('required', 'required');
  }
  return input;
}

function createLabel(fd) {
  const label = document.createElement('label');
  label.setAttribute('for', fd.Field);
  label.textContent = fd.Label;
  if (fd.Mandatory === 'x') {
    label.classList.add('required');
  }
  return label;
}

function applyRules(form, rules) {
  const payload = constructPayload(form);
  rules.forEach((field) => {
    const { type, condition: { key, operator, value } } = field.rule;
    if (type === 'visible') {
      if (operator === 'eq') {
        if (payload[key] === value) {
          form.querySelector(`.${field.fieldId}`).classList.remove('hidden');
        } else {
          form.querySelector(`.${field.fieldId}`).classList.add('hidden');
        }
      }
    }
  });
}

function fill(form) {
  const { action } = form.dataset;
  if (action === '/tools/bot/register-form') {
    const loc = new URL(window.location.href);
    form.querySelector('#owner').value = loc.searchParams.get('owner') || '';
    form.querySelector('#installationId').value = loc.searchParams.get('id') || '';
  }
}

async function createForm(formURL) {
  const { pathname } = new URL(formURL);
  const resp = await fetch(pathname);
  const json = await resp.json();
  const form = document.createElement('form');
  const rules = [];
  // eslint-disable-next-line prefer-destructuring
  form.dataset.action = pathname.split('.json')[0];
  json.data.forEach((fd) => {
    fd.Type = fd.Type || 'text';
    const fieldWrapper = document.createElement('div');
    const style = fd.Style ? ` form-${fd.Style}` : '';
    const fieldId = `form-${fd.Type}-wrapper${style}`;
    fieldWrapper.className = fieldId;
    fieldWrapper.classList.add('field-wrapper');
    switch (fd.Type) {
      case 'select':
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createSelect(fd));
        break;
      case 'heading':
        fieldWrapper.append(createHeading(fd, 'h3'));
        break;
      case 'legal':
        fieldWrapper.append(createHeading(fd, 'p'));
        break;
      case 'checkbox':
        fieldWrapper.append(createInput(fd));
        fieldWrapper.append(createLabel(fd));
        break;
      case 'text-area':
        // fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createTextArea(fd));
        break;
      case 'submit':
        fieldWrapper.append(createButton(fd));
        break;
      default:
        // fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createInput(fd));
    }

    if (fd.Rules) {
      try {
        rules.push({ fieldId, rule: JSON.parse(fd.Rules) });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`Invalid Rule ${fd.Rules}: ${e}`);
      }
    }
    form.append(fieldWrapper);
  });

  form.addEventListener('change', () => applyRules(form, rules));
  applyRules(form, rules);
  fill(form);
  return (form);
}

export default async function decorate(block) {
  const title = block.querySelector('div > div > div:nth-child(1) > div > div');
  if (title) {
    title.classList.add('title');
  }

  const form = block.querySelector('a[href$=".json"]');
  if (form) {
    form.replaceWith(await createForm(form.href));
  }

  const formElement = document.querySelector('main .form-wrapper:has(.form-besides-table)');
  const formContainer = document.querySelector('.section.form-container');
  // select the target node below the formContainer node
  const targetNode = formContainer.nextElementSibling;

  const tableElement = document.querySelector('.section.b-table-container table');
  if (formElement && tableElement) {
    const resizeOb = new ResizeObserver((entries) => {
      // since we are observing only a single element, so we access the first element in entries array
      const rect = entries[0].contentRect;

      const height = rect.height;
      const formHeight = formElement.offsetHeight;

      const mediaQuery = window.matchMedia('(min-width: 900px)');
      if (mediaQuery.matches) {
        formElement.style.top = `-${height}px`;
        targetNode.style.marginTop = `-${formHeight - 15}px`;
      } else {
        formElement.style.marginTop = '2rem';
        targetNode.style.marginTop = 'initial';
      }
    });

    resizeOb.observe(tableElement);
  }
}
