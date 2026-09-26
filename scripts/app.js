document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
    return;
  }

  const appContent = document.getElementById('appContent');
  if (appContent) {
    updateUserLabel();
    renderView('dashboard').then(() => {
      if (typeof renderDashboard === 'function') {
        renderDashboard();
      }
    });

    menuButtons.forEach((link) => {
      link.addEventListener('click', () => {
        renderView(link.dataset.view).then(() => {
          if (link.dataset.view === 'dashboard' && typeof renderDashboard === 'function') {
            renderDashboard();
          }
        });
      });
    });

    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
      logoutButton.addEventListener('click', logout);
    }
  }
});
