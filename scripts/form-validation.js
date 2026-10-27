function getValidationErrorMessage(field) {
  const label = field.labels?.[0]?.textContent.trim().replace(/\s+/g, ' ') || 'este campo';

  if (field.validity.valueMissing) {
    return `Preencha o campo ${label}.`;
  }

  if (field.validity.typeMismatch && field.type === 'email') {
    return `Informe um email válido para ${label}.`;
  }

  if (field.validity.patternMismatch) {
    return `Confira o formato informado para ${label}.`;
  }

  return `Confira o valor informado para ${label}.`;
}

function showFieldValidationError(field) {
  const errorId = field.dataset.validationErrorId || `${field.id || field.name}-error`;
  field.dataset.validationErrorId = errorId;

  let error = document.getElementById(errorId);
  if (!error) {
    error = document.createElement('span');
    error.id = errorId;
    error.className = 'field-error';
    field.insertAdjacentElement('afterend', error);
  }

  error.textContent = getValidationErrorMessage(field);
  field.setAttribute('aria-invalid', 'true');

  const describedBy = new Set((field.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
  describedBy.add(errorId);
  field.setAttribute('aria-describedby', Array.from(describedBy).join(' '));
}

function clearFieldValidationError(field) {
  const errorId = field.dataset.validationErrorId;
  if (!errorId) return;

  document.getElementById(errorId)?.remove();
  delete field.dataset.validationErrorId;
  field.removeAttribute('aria-invalid');

  const describedBy = (field.getAttribute('aria-describedby') || '')
    .split(/\s+/)
    .filter((id) => id && id !== errorId);

  if (describedBy.length) {
    field.setAttribute('aria-describedby', describedBy.join(' '));
  } else {
    field.removeAttribute('aria-describedby');
  }
}

function validateAccessibleForm(form) {
  const fields = Array.from(form.querySelectorAll('input, select, textarea'))
    .filter((field) => field.willValidate);
  const invalidFields = fields.filter((field) => !field.validity.valid);

  fields.forEach((field) => {
    if (field.validity.valid) {
      clearFieldValidationError(field);
    } else {
      showFieldValidationError(field);
    }
  });

  if (invalidFields.length) {
    invalidFields[0].focus();
    return false;
  }

  return true;
}

function setupAccessibleFormValidation(form) {
  form.noValidate = true;

  form.addEventListener('submit', (event) => {
    if (!validateAccessibleForm(form)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  form.querySelectorAll('input, select, textarea').forEach((field) => {
    const clearIfValid = () => {
      if (field.validity.valid) {
        clearFieldValidationError(field);
      } else if (field.dataset.validationErrorId) {
        showFieldValidationError(field);
      }
    };

    field.addEventListener('input', clearIfValid);
    field.addEventListener('change', clearIfValid);
  });
}