function normalizeSearchValue(value) {
  return String(value || '').trim().toLowerCase();
}

function getFirstName(value) {
  const text = String(value || '').trim();
  if (!text) {
    return '';
  }

  return text.split(/\s+/)[0].toLowerCase();
}

function clearMoradorOptions(form) {
  const container = form.querySelector('#moradorOptions');
  if (container) {
    container.remove();
  }
}

function setMoradorFieldState(form, isValid) {
  const fields = form.querySelectorAll('#destinatario, #bloco, #unidade');

  fields.forEach((field) => {
    field.classList.remove('is-invalid');

    if (isValid) {
      field.classList.add('is-valid');
      field.style.borderColor = '#28a745';
      field.style.boxShadow = '0 0 0 0.2rem rgba(40, 167, 69, 0.15)';
      return;
    }

    field.classList.remove('is-valid');
    field.style.borderColor = '';
    field.style.boxShadow = '';
  });
}

function applyMoradorToForm(form, morador) {
  const codeField = form.querySelector('#codigo');
  const empresaField = form.querySelector('#empresa');
  const entregadorField = form.querySelector('#entregador');
  const submitButton = form.querySelector('#encomendaSubmit');
  const moradorIdField = form.querySelector('input[name="moradorId"]');
  const destinatarioField = form.querySelector('#destinatario');
  const blocoField = form.querySelector('#bloco');
  const unidadeField = form.querySelector('#unidade');

  const nomeMorador = morador.nome || morador.nomeMorador;
  const blocoMorador = morador.bloco || morador.blocoMorador;
  const apartamento = morador.apartamento || morador.unidade;

  if (destinatarioField) destinatarioField.value = nomeMorador || '';
  if (blocoField) blocoField.value = blocoMorador || '';
  if (unidadeField) unidadeField.value = apartamento || '';

  if (moradorIdField) moradorIdField.value = String(morador.id);

  [codeField, empresaField, entregadorField].forEach((field) => {
    if (field) field.disabled = false;
  });

  if (submitButton) submitButton.disabled = false;

  setMoradorFieldState(form, true);
  clearMoradorOptions(form);
  showToast('Morador encontrado. Dados preenchidos com sucesso.', 'success');
}

function renderMoradorOptions(form, matches) {
  clearMoradorOptions(form);

  const container = document.createElement('div');
  container.id = 'moradorOptions';
  container.className = 'mt-3 p-3 border rounded shadow-sm';
  container.style.backgroundColor = '#fff5f5';
  container.style.borderColor = '#dc3545';

  const title = document.createElement('small');
  title.className = 'd-block text-danger font-weight-bold mb-2';
  title.textContent = 'Selecione o morador correto:';
  container.appendChild(title);

  matches.forEach((morador) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-block text-left mb-2';
    btn.style.backgroundColor = '#dc3545';
    btn.style.color = '#fff';
    btn.style.border = '1px solid #c82333';
    btn.style.borderRadius = '8px';
    btn.style.padding = '10px 12px';
    btn.style.fontWeight = '600';
    btn.style.boxShadow = '0 2px 6px rgba(220, 53, 69, 0.15)';
    btn.textContent = `${morador.nome || morador.nomeMorador} - ${morador.bloco || morador.blocoMorador}/${morador.apartamento || morador.unidade}`;
    btn.addEventListener('click', () => {
      applyMoradorToForm(form, morador);
    });
    container.appendChild(btn);
  });

  const submitButton = form.querySelector('#encomendaSubmit');
  if (submitButton) {
    form.insertBefore(container, submitButton);
    return;
  }

  form.appendChild(container);
}

function findMoradorBySearch(form) {
  const data = new FormData(form);
  const nome = normalizeSearchValue(data.get('destinatario'));
  const bloco = normalizeSearchValue(data.get('bloco'));
  const unidade = normalizeSearchValue(data.get('unidade'));

  if (!nome && (!bloco || !unidade)) {
    return null;
  }

  if (nome) {
    const nomeBusca = nome.trim();
    const matches = memoryStore.morador.filter((item) => {
      const nomeItem = normalizeSearchValue(item.nome || item.nomeMorador);
      const primeiroNome = getFirstName(item.nome || item.nomeMorador);
      return nomeItem === nomeBusca || primeiroNome === nomeBusca || nomeItem.includes(nomeBusca) || primeiroNome.includes(nomeBusca);
    });

    if (matches.length > 1) {
      setMoradorFieldState(form, false);
      renderMoradorOptions(form, matches);
      return { multiple: true, matches };
    }

    return matches[0] || null;
  }

  if (bloco && unidade) {
    return memoryStore.morador.find((item) => {
      const blocoItem = normalizeSearchValue(item.bloco || item.blocoMorador);
      const unidadeItem = normalizeSearchValue(item.apartamento || item.unidade);
      return blocoItem === bloco && unidadeItem === unidade;
    }) || null;
  }

  return null;
}

function setupEncomendaSearchFlow(form) {
  if (!form || form.dataset.encomendaSearchBound === 'true') {
    return;
  }

  form.dataset.encomendaSearchBound = 'true';

  const searchButton = form.querySelector('#searchMoradorButton');
  const codeField = form.querySelector('#codigo');
  const empresaField = form.querySelector('#empresa');
  const entregadorField = form.querySelector('#entregador');
  const submitButton = form.querySelector('#encomendaSubmit');
  const moradorIdField = form.querySelector('input[name="moradorId"]');
  const destinatarioField = form.querySelector('#destinatario');
  const blocoField = form.querySelector('#bloco');
  const unidadeField = form.querySelector('#unidade');

  const packageFields = [codeField, empresaField, entregadorField];
  packageFields.forEach((field) => {
    if (field) field.disabled = true;
  });

  if (submitButton) {
    submitButton.disabled = true;
  }

  const resolveMoradorSearch = () => {
    const result = findMoradorBySearch(form);

    if (result && result.multiple === true && result.matches && result.matches.length > 1) {
      setMoradorFieldState(form, false);
      renderMoradorOptions(form, result.matches);
      packageFields.forEach((field) => {
        if (field) field.disabled = true;
      });
      if (submitButton) submitButton.disabled = true;
      if (moradorIdField) moradorIdField.value = '';
      return;
    }

    if (!result) {
      setMoradorFieldState(form, false);
      showToast('Morador não encontrado. Cadastre o morador antes da encomenda.', 'error');
      packageFields.forEach((field) => {
        if (field) field.disabled = true;
      });
      if (submitButton) submitButton.disabled = true;
      if (moradorIdField) moradorIdField.value = '';
      return;
    }

    const morador = result;
    const nomeMorador = morador.nome || morador.nomeMorador;
    const blocoMorador = morador.bloco || morador.blocoMorador;
    const apartamento = morador.apartamento || morador.unidade;

    if (destinatarioField) destinatarioField.value = nomeMorador || '';
    if (blocoField) blocoField.value = blocoMorador || '';
    if (unidadeField) unidadeField.value = apartamento || '';

    packageFields.forEach((field) => {
      if (field) field.disabled = false;
    });

    if (submitButton) submitButton.disabled = false;
    if (moradorIdField) moradorIdField.value = String(morador.id);

    setMoradorFieldState(form, true);
    clearMoradorOptions(form);
    showToast('Morador encontrado. Dados preenchidos com sucesso.', 'success');
  };

  if (searchButton) {
    searchButton.addEventListener('click', resolveMoradorSearch);
  }

  if (destinatarioField) {
    destinatarioField.addEventListener('input', () => {
      const nomeDigitado = destinatarioField.value.trim();
      if (nomeDigitado.length < 2) {
        setMoradorFieldState(form, false);
        clearMoradorOptions(form);
        return;
      }

      const result = findMoradorBySearch(form);
      if (result && result.multiple === true && result.matches && result.matches.length > 1) {
        setMoradorFieldState(form, false);
        renderMoradorOptions(form, result.matches);
      } else if (result && !result.multiple) {
        setMoradorFieldState(form, true);
        clearMoradorOptions(form);
      } else if (!result && nomeDigitado.length >= 2) {
        setMoradorFieldState(form, false);
        clearMoradorOptions(form);
      }
    });
  }
}

async function submitEncomendaForm(form, data) {
  const hiddenMoradorId = String(data.get('moradorId') || '').trim();

  const moradorEncontrado = memoryStore.morador.find((item) => String(item.id) === hiddenMoradorId);

  if (!moradorEncontrado) {
    showToast('Morador não encontrado. Cadastre o morador antes da encomenda.', 'error');
    return;
  }

  try {
    const nomeMorador = moradorEncontrado.nome || moradorEncontrado.nomeMorador || String(data.get('destinatario') || '').trim();
    const blocoMorador = moradorEncontrado.bloco || moradorEncontrado.blocoMorador || String(data.get('bloco') || '').trim();
    const apartamentoMorador = moradorEncontrado.apartamento || moradorEncontrado.unidade || String(data.get('unidade') || '').trim();

    const payload = {
      moradorId: moradorEncontrado.id,
      nomeMorador,
      nome: nomeMorador,
      blocoMorador,
      bloco: blocoMorador,
      apartamento: apartamentoMorador,
      unidade: apartamentoMorador,
      destinatario: String(data.get('destinatario')).trim(),
      codigo: String(data.get('codigo')).trim(),
      empresa: String(data.get('empresa')).trim(),
      entregador: String(data.get('entregador')).trim(),
      status: 'pendente',
      dataRegistro: new Date().toISOString(),
      dataRetirada: '',
      porteiroRegistro: sessionStorage.getItem('recebaUser') || 'Admin',
      porteiroRetirada: ''
    };

    const result = await sendDataApi('encomenda', payload);

    await sendDataApi('historico', {
      id: Number(result.data.id || Date.now()),
      cod: payload.codigo,
      empresa: payload.empresa,
      entregador: payload.entregador,
      morador_nome: nomeMorador,
      porteiro_nome: payload.porteiroRegistro,
      retirada_porteiro_nome: payload.porteiroRetirada,
      status: payload.status,
      data_registro: payload.dataRegistro,
      data_retirada: payload.dataRetirada
    });

    showToast(result.message || 'Encomenda cadastrada com sucesso!', 'success');
    form.reset();

    const packageFields = form.querySelectorAll('#codigo, #empresa, #entregador');
    packageFields.forEach((field) => {
      field.disabled = true;
    });

    const submitButton = form.querySelector('#encomendaSubmit');
    if (submitButton) {
      submitButton.disabled = true;
    }

    const hidden = form.querySelector('input[name="moradorId"]');
    if (hidden) {
      hidden.value = '';
    }

    setTimeout(() => {
      if (typeof renderView === 'function') {
        renderView('dashboard');
      }
    }, 1200);
  } catch (error) {
    showToast(error.message || 'Não foi possível registrar a encomenda.', 'error');
  }
}
