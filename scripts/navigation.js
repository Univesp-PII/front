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

  currentUser.textContent = 'Admin';
}

async function renderView(viewName, moveFocus = false) {
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
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });

  if (moveFocus) {
    const pageHeading = appContent.querySelector('.page-header h2');
    if (pageHeading) {
      pageHeading.tabIndex = -1;
      pageHeading.focus({ preventScroll: true });
    }
  }

  attachAppFormHandlers();

  if (viewName === 'dashboard' && typeof renderDashboard === 'function') {
    renderDashboard();
  }

  if (viewName === 'historico' && typeof renderHistoricoPage === 'function') {
    renderHistoricoPage();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!sessionStorage.getItem('recebaToken')) {
    sessionStorage.removeItem('recebaUser');
    window.location.replace('../index.html');
    return;
  }

  updateCurrentUserDisplay();

  const links = document.querySelectorAll('.sidebar-link');

  links.forEach((link) => {
    link.addEventListener('click', () => {
      renderView(link.dataset.view, true);
    });
  });

  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      sessionStorage.removeItem('recebaToken');
      sessionStorage.removeItem('recebaUser');
      window.location.href = '../index.html';
    });
  }

  renderView('dashboard');
});
