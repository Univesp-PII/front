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

  clearMoradorOptions(form);
  showToast('Morador encontrado. Dados preenchidos com sucesso.', 'success');
}

function renderMoradorOptions(form, matches) {
  clearMoradorOptions(form);

  const container = document.createElement('div');
  container.id = 'moradorOptions';
  container.className = 'mt-3';

  const title = document.createElement('small');
  title.className = 'd-block text-muted mb-2';
  title.textContent = 'Selecione o morador:';
  container.appendChild(title);

  matches.forEach((morador) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-sm btn-outline-primary mr-2 mb-2';
    btn.textContent = `${morador.nome || morador.nomeMorador} - ${morador.bloco || morador.blocoMorador}/${morador.apartamento || morador.unidade}`;
    btn.addEventListener('click', () => {
      applyMoradorToForm(form, morador);
    });
    container.appendChild(btn);
  });

  const formBody = form.querySelector('.card-body');
  if (formBody) {
    formBody.appendChild(container);
  }
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
      renderMoradorOptions(form, matches);
      showToast('Mais de um morador encontrado. Selecione uma opção.', 'success');
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

  if (!searchButton) {
    return;
  }

  searchButton.addEventListener('click', () => {
    const result = findMoradorBySearch(form);

    if (!result || (result && result.multiple === true && result.matches && result.matches.length > 1)) {
      if (!result) {
        showToast('Morador não encontrado. Cadastre o morador antes da encomenda.', 'error');
      }

      packageFields.forEach((field) => {
        if (field) field.disabled = true;
      });

      if (submitButton) {
        submitButton.disabled = true;
      }

      if (moradorIdField) {
        moradorIdField.value = '';
      }

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

    clearMoradorOptions(form);
    showToast('Morador encontrado. Dados preenchidos com sucesso.', 'success');
  });
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
