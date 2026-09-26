const viewMap = {
  dashboard: '../pages/dashboard.html',
  encomenda: '../pages/encomenda.html',
  morador: '../pages/morador.html',
  porteiro: '../pages/porteiro.html',
  historico: '../pages/historico.html'
};

function attachAppFormHandlers() {
  const forms = document.querySelectorAll('form[data-form-name]');

  forms.forEach((form) => {
    if (form.dataset.bound === 'true') {
      return;
    }

    form.dataset.bound = 'true';
    const formName = form.dataset.formName;

    if (formName === 'encomenda') {
      setupEncomendaSearchFlow(form);
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        submitEncomendaForm(form, new FormData(form));
      });
      return;
    }

    if (formName === 'morador') {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        submitMoradorForm(form, new FormData(form));
      });
      return;
    }

    if (formName === 'porteiro') {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        submitPorteiroForm(form, new FormData(form));
      });
    }
  });
}

function updateCurrentUserDisplay() {
  const currentUser = document.getElementById('currentUser');
  if (!currentUser) return;

  const storedUser = sessionStorage.getItem('recebaUser');

  if (storedUser) {
    currentUser.textContent = storedUser;
    return;
  }

  const fallbackUser =
    window.memoryStore && Array.isArray(window.memoryStore.porteiro)
      ? window.memoryStore.porteiro[0]?.nome || window.memoryStore.porteiro[0]?.nomePorteiro || 'Admin'
      : 'Admin';

  currentUser.textContent = fallbackUser;
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
  updateCurrentUserDisplay();

  const links = document.querySelectorAll('.sidebar-link');

  links.forEach((link) => {
    link.addEventListener('click', () => {
      renderView(link.dataset.view);
    });
  });

  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      sessionStorage.removeItem('recebaUser');
      window.location.href = '../index.html';
    });
  }

  renderView('dashboard');
});
