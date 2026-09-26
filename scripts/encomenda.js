function normalizeSearchValue(value) {
  return String(value || '').trim().toLowerCase();
}

function findMoradorBySearch(form) {
  const data = new FormData(form);
  const nome = normalizeSearchValue(data.get('destinatario'));
  const bloco = normalizeSearchValue(data.get('bloco'));
  const unidade = normalizeSearchValue(data.get('unidade'));

  if (!nome && !bloco && !unidade) {
    return null;
  }

  const candidatos = memoryStore.morador.filter((item) => {
    const nomeMatch = !nome || normalizeSearchValue(item.nomeMorador) === nome;
    const blocoMatch = !bloco || normalizeSearchValue(item.blocoMorador) === bloco;
    const unidadeMatch = !unidade || normalizeSearchValue(item.apartamento) === unidade;

    if (nome && bloco && unidade) {
      return nomeMatch && blocoMatch && unidadeMatch;
    }

    if (nome) {
      return nomeMatch;
    }

    return blocoMatch && unidadeMatch;
  });

  return candidatos[0] || null;
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
    const morador = findMoradorBySearch(form);

    if (!morador) {
      showToast('Morador não encontrado. Cadastre o morador antes da encomenda.', 'error');

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

    if (destinatarioField) {
      destinatarioField.value = morador.nomeMorador;
    }

    if (blocoField) {
      blocoField.value = morador.blocoMorador;
    }

    if (unidadeField) {
      unidadeField.value = morador.apartamento;
    }

    packageFields.forEach((field) => {
      if (field) field.disabled = false;
    });

    if (submitButton) {
      submitButton.disabled = false;
    }

    if (moradorIdField) {
      moradorIdField.value = String(morador.id);
    }

    showToast('Morador encontrado. Agora preencha a encomenda.', 'success');
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
    const payload = {
      moradorId: moradorEncontrado.id,
      nomeMorador: moradorEncontrado.nomeMorador,
      blocoMorador: moradorEncontrado.blocoMorador,
      apartamento: moradorEncontrado.apartamento,
      bloco: String(data.get('bloco')).trim(),
      unidade: String(data.get('unidade')).trim(),
      destinatario: String(data.get('destinatario')).trim(),
      codigo: String(data.get('codigo')).trim(),
      empresa: String(data.get('empresa')).trim(),
      entregador: String(data.get('entregador')).trim(),
      status: 'pendente',
      dataRegistro: new Date().toISOString(),
      dataRetirada: '',
      porteiroRegistro: sessionStorage.getItem('recebaUser') || 'porteiro-logado',
      porteiroRetirada: ''
    };

    const result = await sendDataApi('encomenda', payload);

    await sendDataApi('historico', {
      uuid: String(result.data.id || Date.now()),
      cod: payload.codigo,
      empresa: payload.empresa,
      entregador: payload.entregador,
      morador_nome: payload.nomeMorador,
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
  } catch (error) {
    showToast(error.message || 'Não foi possível registrar a encomenda.', 'error');
  }
}
