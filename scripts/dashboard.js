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

function renderDashboardStats() {
  if (!memoryStore) {
    return;
  }

  const quantidadeEncomendas = memoryStore.encomenda.length;
  const quantidadeMoradores = memoryStore.morador.length;
  const entregues = memoryStore.encomenda.filter((item) => normalizeDashboardText(item.status) === 'retirada').length
    
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

function registrarRetiradaDashboard(encomendaId) {
  const encomenda = memoryStore.encomenda.find((item) => String(item.id) === String(encomendaId))

  if (!encomenda) {
    showToast('Encomenda não encontrada para registrar a retirada.', 'error');
    return;
  }

  if (normalizeDashboardText(encomenda.status).toLowerCase() === 'retirada') {
    showToast('Esta encomenda já foi registrada como retirada.', 'success');
    return;
  }

  const porteiroRetirada = sessionStorage.getItem('recebaUser') || 'Admin';
  const dataRetirada = new Date().toISOString();

  encomenda.status = 'retirada';
  encomenda.dataRetirada = dataRetirada;
  encomenda.porteiroRetirada = porteiroRetirada;

  const historicoRelativo = memoryStore.historico.find((item) => String(item.id) === String(encomenda.id))

  if (historicoRelativo) {
    historicoRelativo.status = 'retirada';
    historicoRelativo.porteiro_retirada = porteiroRetirada;
    historicoRelativo.retirada_porteiro_nome = porteiroRetirada;
    historicoRelativo.data_retirada = dataRetirada;
    historicoRelativo.dataRetirada = dataRetirada;
  } else {
    memoryStore.historico.push({
      id: Number(encomenda.id),
      cod: encomenda.codigo || encomenda.cod || '',
      empresa: encomenda.empresa || '',
      entregador: encomenda.entregador || '',
      morador_nome: encomenda.nomeMorador || encomenda.destinatario || '',
      porteiro_nome: encomenda.porteiroRegistro || encomenda.porteiroRegistro || 'Admin',
      retirada_porteiro_nome: porteiroRetirada,
      porteiro_retirada: porteiroRetirada,
      status: 'retirada',
      data_registro: encomenda.dataRegistro || new Date().toISOString(),
      data_retirada: dataRetirada
    });
  }

  renderDashboard();
  showToast('Retirada registrada com sucesso.', 'success');
}

function renderDashboardRecentEncomendas() {
  const tableBody = document.getElementById('dashboardEncomendasTableBody');

  if (!tableBody || !memoryStore) {
    return;
  }

  const encomendas = memoryStore.encomenda.slice(0, 8);

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

function renderDashboard() {
  renderDashboardStats();
  renderDashboardRecentEncomendas();
}
