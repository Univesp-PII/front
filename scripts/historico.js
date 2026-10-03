function formatDateTime(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function firstName(name) {
  const value = String(name || '').trim();
  if (!value) {
    return '-';
  }

  return value.split(' ')[0];
}

function statusLabel(status) {
  if (status === 'retirada') {
    return '<span class="badge badge-success">Retirada</span>';
  }

  if (status === 'pendente') {
    return '<span class="badge badge-warning text-dark">Pendente</span>';
  }

  return `<span class="badge badge-info">${String(status || 'pendente').toUpperCase()}</span>`;
}

async function getHistoricoData() {
  try {
    const result = await getDataApi('api/historico');
    return result.data;
  } catch (error) {
    showToast(error.message || 'Não foi possível buscar o histórico.', 'error');
    return [];
  }
}

async function renderHistoricoPage() {
  const tableBody = document.getElementById('historicoTableBody');

  if (!tableBody) {
    return;
  }

  const data = await getHistoricoData();

  if (!data.length) {
    tableBody.innerHTML = '<tr><td colspan="10" class="text-muted">Nenhum registro de histórico encontrado.</td></tr>';
    return;
  }

  tableBody.innerHTML = data.map((item) => `
    <tr>
      <td>${String(item.cod || item.numero || item.id || '-')}</td>
      <td>${String(item.empresa || '-')}</td>
      <td>${String(item.entregador || '-')}</td>
      <td>${String(item.morador_nome || item.nomeMorador || '-')}</td>
      <td>${firstName(item.porteiro_registro || item.porteiro_nome || item.porteiroLogado || item.porteiroRegistro || '-')}</td>
      <td>${firstName(item.porteiro_retirada || item.retirada_porteiro_nome || item.porteiroLiberou || item.porteiroRetirada || '-')}</td>
      <td>${statusLabel(item.status || 'pendente')}</td>
      <td>${formatDateTime(item.data_registro || item.createdAt || item.dataRegistro)}</td>
      <td>${formatDateTime(item.data_retirada || item.dataRetirada)}</td>
    </tr>
  `).join('');
}
