function handleLogin(event) {
  event.preventDefault();

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  if (
    emailInput.value.trim() !== "admin@email.com" ||
    passwordInput.value.trim() !== "admin"
  ) {
    showToast("Credenciais inválidas.", "error");
    resetForm();
    return;
  }

  const loggedPorteiro =
    window.memoryStore && Array.isArray(window.memoryStore.porteiro)
      ? window.memoryStore.porteiro[0]
      : null;

  sessionStorage.setItem(
    "recebaUser",
    loggedPorteiro ? loggedPorteiro.nome || loggedPorteiro.nomePorteiro : "Admin"
  );

  showToast("Login realizado com sucesso.", "success");

  setTimeout(() => {
    window.location.href = "./pages/layout.html";
  }, 600);
}
