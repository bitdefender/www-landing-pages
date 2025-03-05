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

  const questionContainers = [];

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

      const optionArray = [];
      optionElements.forEach((p) => {
        const optionTexts = p.innerHTML.split('<br>');
        optionTexts.forEach((text) => {
          const option = document.createElement('option');
          option.value = text.trim().replace(/\s+/g, '-');
          option.textContent = text.trim();
          select.appendChild(option);
          optionArray.push(option.value);
        });
      });

      questionContainer.appendChild(label);
      questionContainer.appendChild(select);
      newDiv.appendChild(questionContainer);

      questionContainers.push({ container: questionContainer, select, options: optionArray });

      // Hide second question initially
      if (index > 0) {
        questionContainer.style.display = 'none';
      }
    }
  });

  // Function to handle question visibility logic
  function updateQuestionVisibility() {
    if (questionContainers.length > 1) {
      const firstSelect = questionContainers[0].select;
      const secondQuestion = questionContainers[1].container;
      const secondSelect = questionContainers[1].select;

      firstSelect.addEventListener('change', () => {
        const selectedIndex = firstSelect.selectedIndex;

        if (selectedIndex === 1 || selectedIndex === firstSelect.options.length - 1) {
          // First or last option selected → Hide second question
          secondQuestion.style.display = 'none';
          secondSelect.value = '-'; // Default value
          secondSelect.removeAttribute('required');
        } else {
          // Middle options selected → Show second question
          secondQuestion.style.display = 'block';
          secondSelect.setAttribute('required', true);
        }
      });
    }
  }

  updateQuestionVisibility(); // Call function to set up logic

  const modal = document.querySelector('.modal-section-container');

  function handleCloseModal() {
    if (modal) {
      modal.style.display = 'none';
    }
  }

  function handleAdobeDataLayer() {
    const campaignEvent = window.adobeDataLayer.find((item) => item.event === 'campaign product');
    const formFields = Array.from(document.querySelectorAll('.ag_dropdown, input, textarea, select'))
      .map((field) => field.value.trim())
      .filter((value) => value)
      .map((value) => {
        const parts = value.split(',');
        const relevantPart = parts.length > 1 ? parts[1] : parts[0];

        return relevantPart.replace(/-(?=\D)/g, ' ').trim();
      })
      .join('|');

    if (Array.isArray(campaignEvent.product.info)) {
      campaignEvent.product.info.forEach((item) => {
        const productData = window.StoreProducts.product[item.ID];
        if (productData && productData.platformProductID) {
          item.ID = productData.platformProductID;
        }
      });
    }

    if (campaignEvent.product.info && formFields) {
      window.adobeDataLayer.push({
        event: 'discount unlocked',
        product: { info: campaignEvent.product.info },
        user: {
          form: 'discount unlocked',
          formFields,
        },
      });
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
  closeButton.addEventListener('click', () => {
    handleCloseModal();
  });

  table.parentNode.appendChild(newDiv);
  table.parentNode.appendChild(closeButton);

  if (formButtonText) {
    const formButton = document.createElement('button');
    formButton.setAttribute('type', 'submit');
    formButton.classList.add('ag_form_button');
    formButton.textContent = formButtonText;

    formButton.addEventListener('click', (event) => {
      event.preventDefault();

      const secondSelect = questionContainers.length > 1 ? questionContainers[1].select : null;

      if (newDiv.checkValidity()) {
        saveFormSelections();
        localStorage.setItem('discountApplied', 'true');

        if (secondSelect && secondSelect.parentNode.style.display === 'none') {
          secondSelect.value = '-';
        }

        document.dispatchEvent(new Event('formSubmittedEvent'));
        handleAdobeDataLayer();
        handleCloseModal();
      } else {
        newDiv.reportValidity();
      }
    });

    newDiv.appendChild(formButton);
  }

  table.remove();
}
