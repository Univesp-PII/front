async function handleLogin(event) {
  event.preventDefault();

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const submitButton = event.currentTarget.querySelector('button[type="submit"]');

  submitButton.disabled = true;

  try {
    apiService.setBaseUrl("http://localhost:8000/api");
    const response = await apiService.post("auth/login", {
      email: emailInput.value.trim(),
      password: passwordInput.value
    });

    const user = response?.data?.user || response?.user || response?.data || response;
    const loggedUser =
      user?.nome || user?.name || user?.nomePorteiro || user?.email || emailInput.value.trim();

    sessionStorage.setItem("recebaUser", loggedUser);
    showToast("Login realizado com sucesso.", "success");

    setTimeout(() => {
      window.location.href = "./pages/layout.html";
    }, 600);
  } catch (error) {
    showToast(error.message || "Não foi possível fazer login.", "error");
  } finally {
    submitButton.disabled = false;
  }
}
