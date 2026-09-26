const viewMap = {
  dashboard: '../pages/dashboard.html',
  encomenda: '../pages/encomenda.html',
  morador: '../pages/morador.html',
  porteiro: '../pages/porteiro.html',
  historico: '../pages/historico.html'
};

function attachAppFormHandlers() {
  // placeholder para futuras views e formulários carregados dinamicamente
}

async function renderView(viewName) {
  const appContent = document.getElementById('appContent');
  const links = document.querySelectorAll('.sidebar-link');

  if (!appContent) return;

  const file = viewMap[viewName] || viewMap.dashboard;

  try {
    const response = await fetch(file);
    if (!response.ok) throw new Error('Erro ao carregar view');
    appContent.innerHTML = await response.text();
  } catch (error) {
    appContent.innerHTML = '<div class="alert alert-danger">Não foi possível carregar a tela.</div>';
  }

  links.forEach((link) => {
    const isActive = link.dataset.view === viewName;
    link.classList.toggle('active', isActive);
  });

  attachAppFormHandlers();

  if (viewName === 'dashboard' && typeof renderDashboard === 'function') {
    renderDashboard();
  }

  if (viewName === 'historico' && typeof renderHistoricoPage === 'function') {
    renderHistoricoPage();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.sidebar-link');

  links.forEach((link) => {
    link.addEventListener('click', () => {
      renderView(link.dataset.view);
    });
  });

  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      window.location.href = '../index.html';
    });
  }

  renderView('dashboard');
});
