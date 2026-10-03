function normalizeDashboardText(value) {
  return String(value || '').trim();
}

function statusClassForDashboard(status) {
  const normalized = normalizeDashboardText(status).toLowerCase();

  if (normalized === 'retirada') {
    return 'badge-success';
  }

  if (normalized === 'pendente') {
    return 'badge-warning text-dark';
  }

  return 'badge-info';
}

function renderDashboardStats(encomendas, moradores) {
  const quantidadeEncomendas = encomendas.length;
  const quantidadeMoradores = moradores.length;
  const entregues = encomendas.filter((item) => normalizeDashboardText(item.status) === 'retirada').length;
    
  const percentEntregues = quantidadeEncomendas > 0
    ? Math.round((entregues / quantidadeEncomendas) * 100)
    : 0;

  const totalEncomendas = document.getElementById('dashboardTotalEncomendas');
  const totalMoradores = document.getElementById('dashboardTotalMoradores');
  const totalEntregues = document.getElementById('dashboardTotalEntregues');

  if (totalEncomendas) totalEncomendas.textContent = quantidadeEncomendas;
  if (totalMoradores) totalMoradores.textContent = quantidadeMoradores;
  if (totalEntregues) totalEntregues.textContent = `${percentEntregues}%`;
}

async function registrarRetiradaDashboard(encomendaId) {
  const porteiroRetirada = sessionStorage.getItem('recebaUser') || 'Admin';
  const dataRetirada = new Date().toISOString();

  try {
    const response = await getDataApi('api/encomenda', encomendaId);
    const encomenda = response.data;
    if (!encomenda) {
      throw new Error('Encomenda não encontrada para registrar a retirada.');
    }

    if (normalizeDashboardText(encomenda.status).toLowerCase() === 'retirada') {
      showToast('Esta encomenda já foi registrada como retirada.', 'success');
      return;
    }

    await sendDataApi('api/encomenda', {
      ...encomenda,
      status: 'retirada',
      dataRetirada,
      porteiroRetirada
    }, encomendaId);

    const historicoResponse = await getDataApi('api/historico');
    const historicos = Array.isArray(historicoResponse.data) ? historicoResponse.data : [];
    const historico = historicos.find((item) => String(item.id) === String(encomenda.id));
    const historicoPayload = {
      id: Number(encomenda.id),
      cod: encomenda.codigo || encomenda.cod || '',
      empresa: encomenda.empresa || '',
      entregador: encomenda.entregador || '',
      morador_nome: encomenda.nomeMorador || encomenda.destinatario || '',
      porteiro_nome: encomenda.porteiroRegistro || 'Admin',
      retirada_porteiro_nome: porteiroRetirada,
      porteiro_retirada: porteiroRetirada,
      status: 'retirada',
      data_registro: encomenda.dataRegistro || new Date().toISOString(),
      data_retirada: dataRetirada
    };

    if (historico) {
      await sendDataApi('api/historico', historicoPayload, historico.id);
    } else {
      await sendDataApi('api/historico', historicoPayload);
    }

    showToast('Retirada registrada com sucesso.', 'success');
    await renderDashboard();
  } catch (error) {
    showToast(error.message || 'Não foi possível registrar a retirada.', 'error');
  }
}

function renderDashboardRecentEncomendas(encomendas) {
  const tableBody = document.getElementById('dashboardEncomendasTableBody');

  if (!tableBody) {
    return;
  }

  encomendas = encomendas.slice(0, 8);

  if (encomendas.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" class="text-muted">Nenhuma encomenda cadastrada.</td></tr>`;
    return;
  }

  tableBody.innerHTML = encomendas.map((item) => {
    const status = normalizeDashboardText(item.status || 'pendente').toLowerCase();
    const statusClass = statusClassForDashboard(status);
    const statusLabel = normalizeDashboardText(item.status || 'pendente').toUpperCase();
    const isRetirada = status === 'retirada';

    return `<tr>
      <td>${normalizeDashboardText(item.blocoMorador || item.bloco || '-')}</td>
      <td>${normalizeDashboardText(item.apartamento || item.unidade || '-')}</td>
      <td>${normalizeDashboardText(item.nomeMorador || item.destinatario || '-')}</td>
      <td><span class="badge ${statusClass}">${statusLabel}</span></td>
      <td>
        ${isRetirada
          ? '<span class="text-muted">Registrada</span>'
          : `<button type="button" class="btn btn-sm btn-success" data-retirada-id="${normalizeDashboardText(item.id)}">Registrar retirada</button>`}
      </td>
    </tr>`;
  }).join('');

  tableBody.querySelectorAll('[data-retirada-id]').forEach((button) => {
    button.addEventListener('click', () => {
      registrarRetiradaDashboard(button.dataset.retiradaId);
    });
  });
}

async function renderDashboard() {
  try {
    const [encomendasResponse, moradoresResponse] = await Promise.all([
      getDataApi('api/encomenda'),
      getDataApi('api/morador')
    ]);
    const encomendas = Array.isArray(encomendasResponse.data) ? encomendasResponse.data : [];
    const moradores = Array.isArray(moradoresResponse.data) ? moradoresResponse.data : [];

    renderDashboardStats(encomendas, moradores);
    renderDashboardRecentEncomendas(encomendas);
  } catch (error) {
    showToast(error.message || 'Não foi possível carregar o dashboard.', 'error');
    renderDashboardRecentEncomendas([]);
  }
}
