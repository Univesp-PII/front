function ensureToastHost() {
  let host = document.getElementById("toastHost");

  if (!host) {
    host = document.createElement("div");
    host.id = "toastHost";
    host.className = "toast-stack";
    document.body.appendChild(host);
  }

  return host;
}

function showToast(message, type = "success") {
  const host = ensureToastHost();
  const toast = document.createElement("div");
  const safeType = type === "error" ? "error" : "success";

  toast.className = `toast-card ${safeType}`;
  toast.setAttribute("role", "alert");

  const icon = document.createElement("span");
  icon.className = "toast-icon";
  icon.innerHTML = `<i class="bi ${safeType === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"}"></i>`;

  const content = document.createElement("span");
  content.className = "toast-message";
  content.textContent = message;

  const close = document.createElement("span");
  close.className = "toast-close";
  close.setAttribute("aria-label", "Fechar");
  close.textContent = "×";

  close.addEventListener("click", () => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 260);
  });

  toast.appendChild(icon);
  toast.appendChild(content);
  toast.appendChild(close);

  host.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  window.setTimeout(() => {
    toast.classList.remove("show");
    window.setTimeout(() => toast.remove(), 260);
  }, 2600);
}