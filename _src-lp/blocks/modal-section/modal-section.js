export default function decorate(block) {
  const metaData = block.closest('.section').dataset;
  const { formButtonText } = metaData;

  const table = block.querySelector('table');
  if (!table) return;

  const newDiv = document.createElement('form');
  newDiv.classList.add('ag_form_container');

  function saveFormSelections() {
    const dropdowns = block.querySelectorAll('.ag_dropdown');
    dropdowns.forEach((dropdown) => {
      localStorage.setItem(dropdown.id, dropdown.value);
    });
  }

  function restoreFormSelections() {
    const dropdowns = document.querySelectorAll('.ag_dropdown');
    dropdowns.forEach((dropdown) => {
      const savedValue = localStorage.getItem(dropdown.id);
      if (savedValue) {
        dropdown.value = savedValue;
      }
    });
  }

  table.querySelectorAll('tbody tr').forEach((row, index) => {
    const cells = row.querySelectorAll('td');

    if (cells.length === 2) {
      const labelText = cells[0].textContent.trim();
      const optionElements = cells[1].querySelectorAll('p');

      const questionContainer = document.createElement('div');
      questionContainer.classList.add('ag_question_container');

      const label = document.createElement('label');
      label.setAttribute('for', `question_${index}`);
      label.textContent = labelText;

      const select = document.createElement('select');
      select.classList.add('ag_dropdown');
      select.id = `question_${index}`;
      select.name = `question_${index}`;
      select.required = true;

      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.disabled = true;
      defaultOption.selected = true;
      defaultOption.textContent = '-';
      select.appendChild(defaultOption);

      optionElements.forEach((p) => {
        const optionTexts = p.innerHTML.split('<br>');
        optionTexts.forEach((text) => {
          const option = document.createElement('option');
          option.value = text.trim().replace(/\s+/g, '-');
          option.textContent = text.trim();
          select.appendChild(option);
        });
      });

      questionContainer.appendChild(label);
      questionContainer.appendChild(select);
      newDiv.appendChild(questionContainer);
    }
  });

  const modal = document.querySelector('.modal-section-container');

  function handleClosingModal() {
    if (modal) {
      modal.style.display = 'none';
    }
  }

  document.addEventListener('openModalEvent', () => {
    if (modal) {
      restoreFormSelections();
      modal.style.display = 'flex';
    }
  });

  const closeButton = document.createElement('button');
  closeButton.classList.add('modal-close-button');
  closeButton.innerHTML = '&times;';
  closeButton.addEventListener('click', () => handleClosingModal());

  table.parentNode.appendChild(newDiv);
  table.parentNode.appendChild(closeButton);

  if (formButtonText) {
    const formButton = document.createElement('button');
    formButton.setAttribute('type', 'submit');
    formButton.classList.add('ag_form_button');
    formButton.textContent = formButtonText;

    formButton.addEventListener('click', (event) => {
      event.preventDefault();

      if (newDiv.checkValidity()) {
        saveFormSelections();
        localStorage.setItem('discountApplied', 'true');
        document.dispatchEvent(new Event('formSubmittedEvent'));
        handleClosingModal();
      } else {
        newDiv.reportValidity();
      }
    });

    newDiv.appendChild(formButton);
  }

  table.remove();
}
