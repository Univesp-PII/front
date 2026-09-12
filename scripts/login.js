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

  showToast("Login realizado com sucesso.", "success");

  setTimeout(() => {
    window.location.href = "./pages/dashboard.html";
  }, 600);
}
